using CompensaCoreApi.Domain.Assignments;
using CompensaCoreApi.Domain.Courses;
using CompensaCoreApi.Dtos.Assignments;
using CompensaCoreApi.Dtos.Courses;
using CompensaCoreApi.Exceptions;
using CompensaCoreApi.Repositories.Assignments;
using CompensaCoreApi.Repositories.AcademicYears;
using CompensaCoreApi.Repositories.Courses;
using CompensaCoreApi.Services.Schedules;
using CompensaCoreApi.Infrastructure.Caching;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace CompensaCoreApi.Services.Courses;

public sealed class CourseService : ICourseService
{
    private const string DefaultCourseImageUrl = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop";

    private readonly ICourseRepository _repository;
    private readonly IAcademicYearRepository _academicYearRepository;
    private readonly IUserUnitAssignmentRepository _assignmentRepository;
    private readonly IDistributedCache _cache;

    public CourseService(
        ICourseRepository repository,
        IAcademicYearRepository academicYearRepository,
        IUserUnitAssignmentRepository assignmentRepository,
        IDistributedCache cache)
    {
        _repository = repository;
        _academicYearRepository = academicYearRepository;
        _assignmentRepository = assignmentRepository;
        _cache = cache;
    }

    public async Task<IReadOnlyCollection<CourseResponse>> ListAsync(
        string? search,
        Guid? academicYearId,
        string actorUserId,
        string actorUserEmail,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        var version = await GetListVersionAsync(cancellationToken);
        var cacheKey = CacheKeys.CourseList(version, search, actorUserId, isCoordinator, isAdmin);
        var cachedData = await _cache.GetStringAsync(cacheKey, cancellationToken);

        if (!string.IsNullOrEmpty(cachedData))
        {
            return JsonSerializer.Deserialize<IReadOnlyCollection<CourseResponse>>(cachedData)!;
        }

        var activeYearId = academicYearId;
        if (!activeYearId.HasValue)
        {
            var activeYear = await _academicYearRepository.GetActiveAsync(cancellationToken)
                ?? throw new NotFoundException("No active academic year found.");
            activeYearId = activeYear.Id;
        }

        IReadOnlyCollection<CourseResponse> result;

        var allAssignments = await _repository.ListAllCourseAssignmentsAsync(cancellationToken);
        var coordinatorsMap = allAssignments
            .Where(a => a.IsCoordinator)
            .GroupBy(a => a.CourseId)
            .ToDictionary(g => g.Key, g => g.First().UserId);

        if (isAdmin)
        {
            var allCourses = await _repository.ListAsync(search, cancellationToken);
            var offerings = await _repository.ListOfferingsAsync(activeYearId.Value, cancellationToken);

            result = allCourses.Select(course =>
            {
                var offering = offerings.FirstOrDefault(o => o.CourseId == course.Id);
                return ToResponse(course, offering, coordinatorsMap.GetValueOrDefault(course.Id));
            }).ToArray();
        }
        else if (isCoordinator)
        {
            var relatedCourseIds = await GetRelatedCourseIdsAsync(actorUserId, actorUserEmail, cancellationToken);
            var courses = await _repository.ListAsync(search, cancellationToken);
            var offerings = await _repository.ListOfferingsAsync(activeYearId.Value, cancellationToken);

            result = courses
                .Where(course => relatedCourseIds.Contains(course.Id) || offerings.Any(o => o.CourseId == course.Id && o.CoordinatorUserId == actorUserId))
                .Select(course =>
                {
                    var offering = offerings.FirstOrDefault(o => o.CourseId == course.Id);
                    return ToResponse(course, offering, coordinatorsMap.GetValueOrDefault(course.Id));
                })
                .ToArray();
        }
        else
        {
            var assignedCourseIds = (await _assignmentRepository.ListByUserAsync(actorUserId, actorUserEmail, cancellationToken))
                .Select(a => a.CourseId)
                .Distinct()
                .ToHashSet();

            var courses = await _repository.ListAsync(search, cancellationToken);
            var offerings = await _repository.ListOfferingsAsync(activeYearId.Value, cancellationToken);

            result = courses
                .Where(c => assignedCourseIds.Contains(c.Id))
                .Select(course =>
                {
                    var offering = offerings.FirstOrDefault(o => o.CourseId == course.Id);
                    return ToResponse(course, offering, coordinatorsMap.GetValueOrDefault(course.Id));
                })
                .ToArray();
        }

        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(result),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10) },
            cancellationToken);

        return result;
    }

    public async Task<CourseResponse> GetByIdAsync(
        Guid id,
        Guid? academicYearId,
        string actorUserId,
        string actorUserEmail,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        var activeYearId = academicYearId;
        if (!activeYearId.HasValue)
        {
            var activeYear = await _academicYearRepository.GetActiveAsync(cancellationToken)
                ?? throw new NotFoundException("No active academic year found.");
            activeYearId = activeYear.Id;
        }

        var course = await GetRequiredCourseAsync(id, cancellationToken);
        await EnsureCanReadCourseAsync(course, activeYearId.Value, actorUserId, actorUserEmail, isCoordinator, isAdmin, cancellationToken);

        var offering = await _repository.GetOfferingAsync(course.Id, activeYearId.Value, cancellationToken);

        return ToResponse(course, offering);
    }

    public async Task<CourseDetailsResponse> GetDetailsAsync(
        Guid id,
        Guid? academicYearId,
        string actorUserId,
        string actorUserEmail,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        var activeYearId = academicYearId;
        if (!activeYearId.HasValue)
        {
            var activeYear = await _academicYearRepository.GetActiveAsync(cancellationToken)
                ?? throw new NotFoundException("No active academic year found.");
            activeYearId = activeYear.Id;
        }

        var course = await GetRequiredCourseAsync(id, cancellationToken);
        await EnsureCanReadCourseAsync(course, activeYearId.Value, actorUserId, actorUserEmail, isCoordinator, isAdmin, cancellationToken);

        var offering = await _repository.GetOfferingAsync(id, activeYearId.Value, cancellationToken);
        var courseAssignments = await _repository.ListCourseAssignmentsAsync(id, cancellationToken);

        // Determine if user has full access to this course
        bool hasFullAccess = isAdmin || (isCoordinator &&
                           ((offering?.CoordinatorUserId == actorUserId) ||
                            courseAssignments.Any(a => a.UserId == actorUserId && a.IsCoordinator)));

        var cacheKey = CacheKeys.CourseDetails(id, activeYearId.Value);
        var cachedData = await _cache.GetStringAsync(cacheKey, cancellationToken);

        if (!string.IsNullOrEmpty(cachedData) && hasFullAccess)
        {
            return JsonSerializer.Deserialize<CourseDetailsResponse>(cachedData)!;
        }

        var units = await _repository.ListUnitsAsync(id, cancellationToken);
        var unitOfferings = await _repository.ListUnitOfferingsAsync(activeYearId.Value, cancellationToken);
        var components = await _repository.ListComponentsAsync(id, cancellationToken);
        var unitAssignments = await _repository.ListUnitAssignmentsAsync(id, cancellationToken);
        var classes = await _repository.ListClassGroupsAsync(id, activeYearId.Value, cancellationToken);
        var schedules = await _repository.ListClassSchedulesAsync(id, activeYearId.Value, cancellationToken);

        if (!hasFullAccess)
        {
            var userAssignments = unitAssignments
                .Where(a => a.UserId == actorUserId || (!string.IsNullOrEmpty(a.UserEmail) && string.Equals(a.UserEmail, actorUserEmail, StringComparison.OrdinalIgnoreCase)))
                .ToArray();
            var userAssignedUnitIds = userAssignments.Select(a => a.CurricularUnitId).ToHashSet();

            // Filter components where the user is the responsible teacher
            var filteredComponents = components
                .Where(c => c.ResponsibleTeacherId == actorUserId || (c.ResponsibleTeacherEmail != "" && c.ResponsibleTeacherEmail.Equals(actorUserEmail, StringComparison.OrdinalIgnoreCase)))
                .ToArray();

            var responsibleUnitIds = unitOfferings
                .Where(o => o.ResponsibleTeacherId == actorUserId || (!string.IsNullOrEmpty(o.ResponsibleTeacherEmail) && string.Equals(o.ResponsibleTeacherEmail, actorUserEmail, StringComparison.OrdinalIgnoreCase)))
                .Select(o => o.CurricularUnitId)
                .ToHashSet();

            // Units the teacher is directly involved in
            var myUnitIds = responsibleUnitIds
                .Concat(userAssignedUnitIds)
                .Concat(filteredComponents.Select(c => c.CurricularUnitId))
                .ToHashSet();

            // Classes where the teacher is the main group teacher
            var mainTeacherClassIds = classes.Where(c => c.TeacherId == actorUserId).Select(c => c.Id).ToHashSet();

            // Classes that have schedules for the units the teacher is involved in
            var classesWithMyUnitsSchedules = schedules
                .Where(s => myUnitIds.Contains(s.CurricularUnitId))
                .Select(s => s.ClassGroupId)
                .ToHashSet();

            // Final set of visible classes
            var finalClassIds = mainTeacherClassIds.Concat(classesWithMyUnitsSchedules).ToHashSet();

            // Units taught in classes where the teacher is the main group teacher (they should see the whole schedule of their group)
            var unitIdsFromMyClasses = schedules
                .Where(s => mainTeacherClassIds.Contains(s.ClassGroupId))
                .Select(s => s.CurricularUnitId)
                .ToHashSet();

            // Final set of visible units
            var finalUnitIds = myUnitIds.Concat(unitIdsFromMyClasses).ToHashSet();

            var filteredUnits = units.Where(u => finalUnitIds.Contains(u.Id)).ToArray();
            var filteredClasses = classes.Where(c => finalClassIds.Contains(c.Id)).ToArray();

            // Filter schedules: only for visible classes AND visible units
            var filteredSchedules = schedules
                .Where(s => finalClassIds.Contains(s.ClassGroupId) && finalUnitIds.Contains(s.CurricularUnitId))
                .ToArray();

            units = filteredUnits;
            components = filteredComponents;
            classes = filteredClasses;
            schedules = filteredSchedules;
        }

        var componentResponses = components.Select(ToComponentResponse).ToArray();

        var result = new CourseDetailsResponse(
            ToResponse(course, offering),
            units.Select(unit =>
            {
                var unitOffering = unitOfferings.FirstOrDefault(o => o.CurricularUnitId == unit.Id);
                return ToUnitResponse(
                    unit,
                    unitOffering,
                    componentResponses.Where(component => component.CurricularUnitId == unit.Id).ToArray(),
                    unitAssignments
                        .Where(assignment => assignment.CurricularUnitId == unit.Id)
                        .Select(assignment => assignment.UserId)
                        .Concat(new[] { unitOffering?.ResponsibleTeacherId ?? string.Empty })
                        .Concat(components
                            .Where(component => component.CurricularUnitId == unit.Id)
                            .Select(component => component.ResponsibleTeacherId))
                        .Where(userId => !string.IsNullOrWhiteSpace(userId))
                        .Distinct()
                        .ToArray());
            })
                .ToArray(),
            componentResponses,
            classes.Select(ToClassGroupResponse).ToArray(),
            schedules.Select(ToClassScheduleResponse).ToArray(),
            courseAssignments.Select(a => ToCourseAssignmentResponse(a, course.Name)).ToArray());

        // Only cache full details
        if (hasFullAccess)
        {
            await _cache.SetStringAsync(
                cacheKey,
                JsonSerializer.Serialize(result),
                new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30) },
                cancellationToken);
        }

        return result;
    }

    public async Task<CourseResponse> CreateAsync(
        CreateCourseRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureUniqueAbbreviationAsync(request.Abbreviation, excludedCourseId: null, cancellationToken);

        var activeYear = await _academicYearRepository.GetActiveAsync(cancellationToken)
            ?? throw new NotFoundException("No active academic year found.");

        var now = DateTimeOffset.UtcNow;
        var course = new Course
        {
            Name = request.Name.Trim(),
            Abbreviation = request.Abbreviation.Trim().ToUpperInvariant(),
            Type = request.Type,
            DurationYears = request.DurationYears,
            TotalCredits = request.TotalCredits,
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _repository.AddAsync(course, cancellationToken);

        var offering = new CourseOffering
        {
            CourseId = course.Id,
            AcademicYearId = activeYear.Id,
            CoordinatorUserId = NormalizeOptional(request.CoordinatorUserId),
            Description = request.Description.Trim(),
            ImageUrl = NormalizeImageUrl(request.ImageUrl, request.Type),
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _repository.AddOfferingAsync(offering, cancellationToken);

        await InvalidateListCacheAsync(cancellationToken);
        return ToResponse(course, offering);
    }

    public async Task<CourseResponse> UpdateAsync(
        Guid id,
        UpdateCourseRequest request,
        CancellationToken cancellationToken = default)
    {
        var course = await GetRequiredCourseAsync(id, cancellationToken);
        await EnsureUniqueAbbreviationAsync(request.Abbreviation, course.Id, cancellationToken);

        var activeYear = await _academicYearRepository.GetActiveAsync(cancellationToken)
            ?? throw new NotFoundException("No active academic year found.");

        course.Name = request.Name.Trim();
        course.Abbreviation = request.Abbreviation.Trim().ToUpperInvariant();
        course.Type = request.Type;
        course.DurationYears = request.DurationYears;
        course.TotalCredits = request.TotalCredits;
        course.IsActive = request.IsActive;
        course.UpdatedAt = DateTimeOffset.UtcNow;

        var offering = await _repository.GetOfferingAsync(id, activeYear.Id, cancellationToken);
        if (offering == null)
        {
            offering = new CourseOffering
            {
                CourseId = id,
                AcademicYearId = activeYear.Id,
                CreatedAt = DateTimeOffset.UtcNow
            };
            await _repository.AddOfferingAsync(offering, cancellationToken);
        }

        offering.CoordinatorUserId = NormalizeOptional(request.CoordinatorUserId);
        offering.Description = request.Description.Trim();
        offering.ImageUrl = NormalizeImageUrl(request.ImageUrl, request.Type);
        offering.IsActive = request.IsActive;
        offering.UpdatedAt = DateTimeOffset.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);

        // Invalidate cache
        await InvalidateDetailsCacheAsync(id, cancellationToken);
        await InvalidateListCacheAsync(cancellationToken);

        return ToResponse(course, offering);
    }

    public async Task<CurricularUnitResponse> CreateUnitAsync(
        Guid courseId,
        UpsertCurricularUnitRequest request,
        CancellationToken cancellationToken = default)
    {
        var course = await GetRequiredCourseAsync(courseId, cancellationToken);
        ValidateUnitBelongsToCourseYear(course, request.Year);

        await EnsureUniqueUnitNameAsync(courseId, request.Name, excludedUnitId: null, cancellationToken);
        if (!string.IsNullOrWhiteSpace(request.Abbreviation))
        {
            await EnsureUniqueUnitAbbreviationAsync(courseId, request.Abbreviation, excludedUnitId: null, cancellationToken);
        }

        var activeYear = await _academicYearRepository.GetActiveAsync(cancellationToken)
            ?? throw new NotFoundException("No active academic year found.");

        var now = DateTimeOffset.UtcNow;
        var unit = new CurricularUnit
        {
            CourseId = course.Id,
            Name = request.Name.Trim(),
            Abbreviation = request.Abbreviation?.Trim() ?? string.Empty,
            Year = request.Year,
            Semester = request.Semester,
            Ects = request.Ects,
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _repository.AddUnitAsync(unit, cancellationToken);

        var offering = new CurricularUnitOffering
        {
            CurricularUnitId = unit.Id,
            AcademicYearId = activeYear.Id,
            ResponsibleTeacherId = request.ResponsibleTeacherId.Trim(),
            ResponsibleTeacherEmail = request.ResponsibleTeacherEmail.Trim().ToLowerInvariant(),
            Year = request.Year,
            Semester = request.Semester,
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _repository.AddUnitOfferingAsync(offering, cancellationToken);

        await InvalidateDetailsCacheAsync(courseId, cancellationToken);
        await InvalidateListCacheAsync(cancellationToken);

        await _assignmentRepository.EnsureUserUnitAssignmentAsync(
            offering.ResponsibleTeacherId,
            offering.ResponsibleTeacherEmail,
            unit,
            isResponsible: true,
            cancellationToken);

        return ToUnitResponse(unit, offering, Array.Empty<CurricularUnitComponentResponse>(), [offering.ResponsibleTeacherId]);
    }

    public async Task<CurricularUnitResponse> UpdateUnitAsync(
        Guid courseId,
        Guid unitId,
        UpsertCurricularUnitRequest request,
        CancellationToken cancellationToken = default)
    {
        var course = await GetRequiredCourseAsync(courseId, cancellationToken);
        ValidateUnitBelongsToCourseYear(course, request.Year);

        var activeYear = await _academicYearRepository.GetActiveAsync(cancellationToken)
            ?? throw new NotFoundException("No active academic year found.");

        var unit = await GetRequiredUnitAsync(courseId, unitId, cancellationToken);

        await EnsureUniqueUnitNameAsync(courseId, request.Name, unitId, cancellationToken);
        if (!string.IsNullOrWhiteSpace(request.Abbreviation))
        {
            await EnsureUniqueUnitAbbreviationAsync(courseId, request.Abbreviation, unitId, cancellationToken);
        }

        unit.Name = request.Name.Trim();
        if (request.Abbreviation != null)
        {
            unit.Abbreviation = request.Abbreviation.Trim();
        }
        unit.Year = request.Year;
        unit.Semester = request.Semester;
        unit.Ects = request.Ects;
        unit.IsActive = request.IsActive;
        unit.UpdatedAt = DateTimeOffset.UtcNow;

        var offering = await _repository.GetUnitOfferingAsync(unitId, activeYear.Id, cancellationToken);
        if (offering == null)
        {
            offering = new CurricularUnitOffering
            {
                CurricularUnitId = unitId,
                AcademicYearId = activeYear.Id,
                CreatedAt = DateTimeOffset.UtcNow
            };
            await _repository.AddUnitOfferingAsync(offering, cancellationToken);
        }

        offering.ResponsibleTeacherId = request.ResponsibleTeacherId.Trim();
        offering.ResponsibleTeacherEmail = request.ResponsibleTeacherEmail.Trim().ToLowerInvariant();
        offering.Year = request.Year;
        offering.Semester = request.Semester;
        offering.IsActive = request.IsActive;
        offering.UpdatedAt = DateTimeOffset.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        await InvalidateDetailsCacheAsync(courseId, cancellationToken);
        await InvalidateListCacheAsync(cancellationToken);

        await _assignmentRepository.EnsureUserUnitAssignmentAsync(
            offering.ResponsibleTeacherId,
            offering.ResponsibleTeacherEmail,
            unit,
            isResponsible: true,
            cancellationToken);

        var components = await _repository.ListComponentsAsync(courseId, cancellationToken);
        var assignments = await _repository.ListUnitAssignmentsAsync(courseId, cancellationToken);

        return ToUnitResponse(
            unit,
            offering,
            components.Where(component => component.CurricularUnitId == unit.Id).Select(ToComponentResponse).ToArray(),
            assignments
                .Where(assignment => assignment.CurricularUnitId == unit.Id)
                .Select(assignment => assignment.UserId)
                .Concat(new[] { offering.ResponsibleTeacherId })
                .Where(userId => !string.IsNullOrWhiteSpace(userId))
                .Distinct()
                .ToArray());
    }

    public async Task DeleteUnitAsync(Guid courseId, Guid unitId, CancellationToken cancellationToken = default)
    {
        var unit = await GetRequiredUnitAsync(courseId, unitId, cancellationToken);
        await _repository.DeleteUnitAsync(unit, cancellationToken);
        await InvalidateDetailsCacheAsync(courseId, cancellationToken);
        await InvalidateListCacheAsync(cancellationToken);
    }

    public async Task<CurricularUnitComponentResponse> CreateComponentAsync(
        Guid courseId,
        Guid unitId,
        UpsertCurricularUnitComponentRequest request,
        CancellationToken cancellationToken = default)
    {
        var unit = await GetRequiredUnitAsync(courseId, unitId, cancellationToken);
        var now = DateTimeOffset.UtcNow;
        var component = new CurricularUnitComponent
        {
            CourseId = courseId,
            CurricularUnitId = unit.Id,
            Name = request.Name.Trim(),
            Type = request.Type,
            ResponsibleTeacherId = request.ResponsibleTeacherId.Trim(),
            ResponsibleTeacherEmail = request.ResponsibleTeacherEmail.Trim().ToLowerInvariant(),
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _repository.AddComponentAsync(component, cancellationToken);
        await InvalidateDetailsCacheAsync(courseId, cancellationToken);
        await InvalidateListCacheAsync(cancellationToken);

        await _assignmentRepository.EnsureUserUnitAssignmentAsync(
            component.ResponsibleTeacherId,
            component.ResponsibleTeacherEmail,
            unit,
            isResponsible: false,
            cancellationToken);

        return ToComponentResponse(component);
    }

    public async Task<CurricularUnitComponentResponse> UpdateComponentAsync(
        Guid courseId,
        Guid unitId,
        Guid componentId,
        UpsertCurricularUnitComponentRequest request,
        CancellationToken cancellationToken = default)
    {
        await GetRequiredUnitAsync(courseId, unitId, cancellationToken);
        var component = await GetRequiredComponentAsync(courseId, unitId, componentId, cancellationToken);

        component.Name = request.Name.Trim();
        component.Type = request.Type;
        component.ResponsibleTeacherId = request.ResponsibleTeacherId.Trim();
        component.ResponsibleTeacherEmail = request.ResponsibleTeacherEmail.Trim().ToLowerInvariant();
        component.IsActive = request.IsActive;
        component.UpdatedAt = DateTimeOffset.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        await InvalidateDetailsCacheAsync(courseId, cancellationToken);
        await InvalidateListCacheAsync(cancellationToken);

        var unit = await GetRequiredUnitAsync(courseId, unitId, cancellationToken);
        await _assignmentRepository.EnsureUserUnitAssignmentAsync(
            component.ResponsibleTeacherId,
            component.ResponsibleTeacherEmail,
            unit,
            isResponsible: false,
            cancellationToken);

        return ToComponentResponse(component);
    }

    public async Task DeleteComponentAsync(
        Guid courseId,
        Guid unitId,
        Guid componentId,
        CancellationToken cancellationToken = default)
    {
        await GetRequiredUnitAsync(courseId, unitId, cancellationToken);
        var component = await GetRequiredComponentAsync(courseId, unitId, componentId, cancellationToken);

        await _repository.DeleteComponentAsync(component, cancellationToken);
        await InvalidateDetailsCacheAsync(courseId, cancellationToken);
        await InvalidateListCacheAsync(cancellationToken);
    }

    public async Task<ClassGroupResponse> CreateClassGroupAsync(
        Guid courseId,
        UpsertClassGroupRequest request,
        CancellationToken cancellationToken = default)
    {
        await GetRequiredCourseAsync(courseId, cancellationToken);

        // Check for existing class with same name and year in this academic year
        var existingClasses = await _repository.ListClassGroupsAsync(courseId, request.AcademicYearId, cancellationToken);
        if (existingClasses.Any(c => string.Equals(c.Name, request.Name.Trim(), StringComparison.OrdinalIgnoreCase) && c.Year == request.Year))
        {
            throw new InvalidOperationException($"A class group with name '{request.Name}' already exists for year {request.Year} in this academic year.");
        }

        var now = DateTimeOffset.UtcNow;
        var classGroup = new ClassGroup
        {
            CourseId = courseId,
            AcademicYearId = request.AcademicYearId,
            Year = request.Year,
            Name = request.Name.Trim(),
            TeacherId = request.TeacherId.Trim(),
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _repository.AddClassGroupAsync(classGroup, cancellationToken);
        await InvalidateDetailsCacheAsync(courseId, cancellationToken);
        return ToClassGroupResponse(classGroup);
    }

    public async Task<ClassGroupResponse> UpdateClassGroupAsync(
        Guid courseId,
        Guid classGroupId,
        UpsertClassGroupRequest request,
        CancellationToken cancellationToken = default)
    {
        var classGroup = await GetRequiredClassGroupAsync(courseId, classGroupId, cancellationToken);

        classGroup.Year = request.Year;
        classGroup.Name = request.Name.Trim();
        classGroup.TeacherId = request.TeacherId.Trim();
        classGroup.AcademicYearId = request.AcademicYearId;
        classGroup.IsActive = request.IsActive;
        classGroup.UpdatedAt = DateTimeOffset.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        await InvalidateDetailsCacheAsync(courseId, cancellationToken);
        return ToClassGroupResponse(classGroup);
    }

    public async Task DeleteClassGroupAsync(
        Guid courseId,
        Guid classGroupId,
        CancellationToken cancellationToken = default)
    {
        var classGroup = await GetRequiredClassGroupAsync(courseId, classGroupId, cancellationToken);
        await _repository.DeleteClassGroupAsync(classGroup, cancellationToken);
        await InvalidateDetailsCacheAsync(courseId, cancellationToken);
    }

    public async Task<ClassScheduleResponse> CreateScheduleAsync(
        Guid courseId,
        Guid classGroupId,
        UpsertClassScheduleRequest request,
        CancellationToken cancellationToken = default)
    {
        var classGroup = await GetRequiredClassGroupAsync(courseId, classGroupId, cancellationToken);
        ValidateSchedule(request.StartTime, request.EndTime);
        await EnsureAcademicYearExistsAsync(request.AcademicYearId, cancellationToken);
        await EnsureScheduleSemesterMatchesUnitAsync(courseId, request.CurricularUnitId, request.Semester, cancellationToken);
        await EnsureScheduleHasNoConflictsAsync(
            classGroup,
            request.AcademicYearId,
            request.Semester,
            request.DayOfWeek,
            request.StartTime,
            request.EndTime,
            request.ClassroomId,
            excludedScheduleId: null,
            cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var schedule = new ClassSchedule
        {
            CourseId = courseId,
            CurricularUnitId = request.CurricularUnitId,
            ClassGroupId = classGroup.Id,
            AcademicYearId = request.AcademicYearId,
            Semester = request.Semester,
            ComponentType = request.ComponentType,
            DayOfWeek = request.DayOfWeek,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            ClassroomId = request.ClassroomId,
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        await EnsureScheduleSemesterMatchesUnitAsync(courseId, request.CurricularUnitId, request.Semester, cancellationToken);
        await _repository.AddClassScheduleAsync(schedule, cancellationToken);
        await InvalidateDetailsCacheAsync(courseId, cancellationToken);
        return ToClassScheduleResponse(schedule);
    }

    public async Task<ClassScheduleResponse> UpdateScheduleAsync(
        Guid courseId,
        Guid classGroupId,
        Guid scheduleId,
        UpsertClassScheduleRequest request,
        CancellationToken cancellationToken = default)
    {
        var classGroup = await GetRequiredClassGroupAsync(courseId, classGroupId, cancellationToken);
        var schedule = await GetRequiredClassScheduleAsync(courseId, classGroupId, scheduleId, cancellationToken);
        ValidateSchedule(request.StartTime, request.EndTime);
        await EnsureAcademicYearExistsAsync(request.AcademicYearId, cancellationToken);
        await EnsureScheduleSemesterMatchesUnitAsync(courseId, request.CurricularUnitId, request.Semester, cancellationToken);
        await EnsureScheduleHasNoConflictsAsync(
            classGroup,
            request.AcademicYearId,
            request.Semester,
            request.DayOfWeek,
            request.StartTime,
            request.EndTime,
            request.ClassroomId,
            excludedScheduleId: schedule.Id,
            cancellationToken);

        schedule.CurricularUnitId = request.CurricularUnitId;
        schedule.ComponentType = request.ComponentType;
        schedule.AcademicYearId = request.AcademicYearId;
        schedule.Semester = request.Semester;
        schedule.DayOfWeek = request.DayOfWeek;
        schedule.StartTime = request.StartTime;
        schedule.EndTime = request.EndTime;
        schedule.ClassroomId = request.ClassroomId;
        schedule.IsActive = request.IsActive;
        schedule.UpdatedAt = DateTimeOffset.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        await InvalidateDetailsCacheAsync(courseId, cancellationToken);
        return ToClassScheduleResponse(schedule);
    }

    public async Task DeleteScheduleAsync(
        Guid courseId,
        Guid classGroupId,
        Guid scheduleId,
        CancellationToken cancellationToken = default)
    {
        await GetRequiredClassGroupAsync(courseId, classGroupId, cancellationToken);
        var schedule = await GetRequiredClassScheduleAsync(courseId, classGroupId, scheduleId, cancellationToken);
        await _repository.DeleteClassScheduleAsync(schedule, cancellationToken);
        await InvalidateDetailsCacheAsync(courseId, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var course = await GetRequiredCourseAsync(id, cancellationToken);
        await _repository.DeleteAsync(course, cancellationToken);

        await InvalidateDetailsCacheAsync(id, cancellationToken);
        await InvalidateListCacheAsync(cancellationToken);
    }

    private async Task<Course> GetRequiredCourseAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Course '{id}' was not found.");
    }

    private async Task EnsureCanReadCourseAsync(
        Course course,
        Guid academicYearId,
        string actorUserId,
        string actorUserEmail,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken)
    {
        if (isAdmin)
            return;

        if (isCoordinator && await HasCourseRelationshipAsync(course, academicYearId, actorUserId, actorUserEmail, cancellationToken))
            return;

        var assignedCourseIds = (await _assignmentRepository.ListByUserAsync(actorUserId, actorUserEmail, cancellationToken))
            .Select(assignment => assignment.CourseId)
            .ToHashSet();

        if (assignedCourseIds.Contains(course.Id))
            return;

        throw new ForbiddenException("You don't have permission to view this course.");
    }

    private async Task<HashSet<Guid>> GetRelatedCourseIdsAsync(
        string actorUserId,
        string actorUserEmail,
        CancellationToken cancellationToken)
    {
        var unitCourseIds = (await _assignmentRepository.ListByUserAsync(actorUserId, actorUserEmail, cancellationToken))
            .Select(assignment => assignment.CourseId);
        var courseAssignmentIds = (await _assignmentRepository.ListCoursesByUserAsync(actorUserId, actorUserEmail, cancellationToken))
            .Select(assignment => assignment.CourseId);

        return unitCourseIds
            .Concat(courseAssignmentIds)
            .Distinct()
            .ToHashSet();
    }

    private async Task<bool> HasCourseRelationshipAsync(
        Course course,
        Guid academicYearId,
        string actorUserId,
        string actorUserEmail,
        CancellationToken cancellationToken)
    {
        var offering = await _repository.GetOfferingAsync(course.Id, academicYearId, cancellationToken);
        if (offering?.CoordinatorUserId == actorUserId)
            return true;

        var relatedCourseIds = await GetRelatedCourseIdsAsync(actorUserId, actorUserEmail, cancellationToken);
        return relatedCourseIds.Contains(course.Id);
    }

    private async Task<CurricularUnit> GetRequiredUnitAsync(
        Guid courseId,
        Guid unitId,
        CancellationToken cancellationToken)
    {
        return await _repository.GetUnitByIdAsync(courseId, unitId, cancellationToken)
            ?? throw new NotFoundException($"Curricular unit '{unitId}' was not found in course '{courseId}'.");
    }

    private async Task<CurricularUnitComponent> GetRequiredComponentAsync(
        Guid courseId,
        Guid unitId,
        Guid componentId,
        CancellationToken cancellationToken)
    {
        return await _repository.GetComponentByIdAsync(courseId, unitId, componentId, cancellationToken)
            ?? throw new NotFoundException($"Curricular unit component '{componentId}' was not found.");
    }

    private async Task<ClassGroup> GetRequiredClassGroupAsync(
        Guid courseId,
        Guid classGroupId,
        CancellationToken cancellationToken)
    {
        return await _repository.GetClassGroupByIdAsync(courseId, classGroupId, cancellationToken)
            ?? throw new NotFoundException($"Class group '{classGroupId}' was not found in course '{courseId}'.");
    }

    private async Task<ClassSchedule> GetRequiredClassScheduleAsync(
        Guid courseId,
        Guid classGroupId,
        Guid scheduleId,
        CancellationToken cancellationToken)
    {
        return await _repository.GetClassScheduleByIdAsync(courseId, classGroupId, scheduleId, cancellationToken)
            ?? throw new NotFoundException($"Schedule '{scheduleId}' was not found in class group '{classGroupId}'.");
    }

    private static void ValidateUnitBelongsToCourseYear(Course course, int year)
    {
        if (year > course.DurationYears)
            throw new InvalidOperationException($"Year {year} is outside the {course.DurationYears}-year duration of course '{course.Name}'.");
    }

    private static void ValidateSchedule(TimeOnly startTime, TimeOnly endTime)
    {
        ScheduleConflictRule.ValidateRange(startTime, endTime);
    }

    private async Task EnsureScheduleHasNoConflictsAsync(
        ClassGroup classGroup,
        Guid academicYearId,
        int semester,
        int dayOfWeek,
        TimeOnly startTime,
        TimeOnly endTime,
        Guid classroomId,
        Guid? excludedScheduleId,
        CancellationToken cancellationToken)
    {
        var overlaps = await _repository.ListOverlappingSchedulesAsync(
            academicYearId,
            semester,
            dayOfWeek,
            startTime,
            endTime,
            excludedScheduleId,
            cancellationToken);

        var classConflict = overlaps.FirstOrDefault(item => item.Schedule.ClassGroupId == classGroup.Id);
        if (classConflict.Schedule != null)
            throw new InvalidOperationException($"Class group '{classGroup.Name}' already has a schedule in this time interval.");

        var roomConflict = overlaps.FirstOrDefault(item => item.Schedule.ClassroomId == classroomId);
        if (roomConflict.Schedule != null)
            throw new InvalidOperationException("The selected classroom is already occupied in this time interval.");

        var teacherConflict = overlaps.FirstOrDefault(item => item.ClassGroup.TeacherId == classGroup.TeacherId);
        if (teacherConflict.Schedule != null)
            throw new InvalidOperationException($"Teacher '{classGroup.TeacherId}' already has a class in this time interval.");
    }

    private async Task EnsureAcademicYearExistsAsync(Guid academicYearId, CancellationToken cancellationToken)
    {
        if (academicYearId == Guid.Empty)
            throw new InvalidOperationException("Academic year is required.");

        var academicYear = await _academicYearRepository.GetByIdAsync(academicYearId, cancellationToken);
        if (academicYear is null)
            throw new NotFoundException($"Academic year '{academicYearId}' was not found.");
    }

    private async Task EnsureScheduleSemesterMatchesUnitAsync(
        Guid courseId,
        Guid curricularUnitId,
        int semester,
        CancellationToken cancellationToken)
    {
        var unit = await _repository.GetUnitByIdAsync(courseId, curricularUnitId, cancellationToken)
            ?? throw new NotFoundException($"Curricular unit '{curricularUnitId}' was not found.");

        if (unit.Semester != semester)
            throw new InvalidOperationException($"Schedule semester must match curricular unit semester {unit.Semester}.");
    }

    private async Task EnsureUniqueAbbreviationAsync(
        string abbreviation,
        Guid? excludedCourseId,
        CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByAbbreviationAsync(abbreviation, cancellationToken);

        if (existing != null && existing.Id != excludedCourseId)
            throw new InvalidOperationException($"Course abbreviation '{abbreviation}' already exists.");
    }

    private async Task EnsureUniqueUnitAbbreviationAsync(
        Guid courseId,
        string abbreviation,
        Guid? excludedUnitId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(abbreviation))
            return;

        var units = await _repository.ListUnitsAsync(courseId, cancellationToken);
        var existing = units.FirstOrDefault(u => string.Equals(u.Abbreviation, abbreviation.Trim(), StringComparison.OrdinalIgnoreCase));

        if (existing != null && existing.Id != excludedUnitId)
            throw new InvalidOperationException($"A curricular unit with abbreviation '{abbreviation}' already exists in this course.");
    }

    private async Task EnsureUniqueUnitNameAsync(
        Guid courseId,
        string name,
        Guid? excludedUnitId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(name))
            return;

        var units = await _repository.ListUnitsAsync(courseId, cancellationToken);
        var existing = units.FirstOrDefault(u => string.Equals(u.Name, name.Trim(), StringComparison.OrdinalIgnoreCase));

        if (existing != null && existing.Id != excludedUnitId)
            throw new InvalidOperationException($"A curricular unit with name '{name}' already exists in this course.");
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static string NormalizeImageUrl(string? imageUrl, CourseDegreeType type)
    {
        if (!string.IsNullOrWhiteSpace(imageUrl))
            return imageUrl.Trim();

        return type switch
        {
            CourseDegreeType.Mestrado => "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop",
            CourseDegreeType.CTeSP => "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop",
            _ => DefaultCourseImageUrl
        };
    }

    private static CourseResponse ToResponse(Course course, CourseOffering? offering = null, string? fallbackCoordinatorUserId = null)
    {
        return new CourseResponse(
            course.Id,
            course.Name,
            course.Abbreviation,
            course.Type,
            offering?.Description ?? string.Empty,
            course.DurationYears,
            course.TotalCredits,
            offering?.CoordinatorUserId ?? fallbackCoordinatorUserId,
            offering?.ImageUrl ?? DefaultCourseImageUrl,
            course.IsActive && (offering?.IsActive ?? true),
            course.CreatedAt,
            course.UpdatedAt);
    }

    private static CurricularUnitResponse ToUnitResponse(
        CurricularUnit unit,
        CurricularUnitOffering? offering,
        IReadOnlyCollection<CurricularUnitComponentResponse> components,
        string[] teacherIds)
    {
        return new CurricularUnitResponse(
            unit.Id,
            unit.CourseId,
            unit.Name,
            unit.Abbreviation,
            offering?.Year ?? unit.Year,
            offering?.Semester ?? unit.Semester,
            unit.Ects,
            teacherIds,
            offering?.ResponsibleTeacherId ?? string.Empty,
            offering?.ResponsibleTeacherEmail ?? string.Empty,
            components,
            unit.IsActive && (offering?.IsActive ?? true));
    }

    private static CurricularUnitComponentResponse ToComponentResponse(CurricularUnitComponent component)
    {
        return new CurricularUnitComponentResponse(
            component.Id,
            component.CourseId,
            component.CurricularUnitId,
            component.Name,
            component.Type,
            component.ResponsibleTeacherId,
            component.ResponsibleTeacherEmail,
            component.IsActive);
    }

    private static ClassGroupResponse ToClassGroupResponse(ClassGroup group)
    {
        return new ClassGroupResponse(
            group.Id,
            group.CourseId,
            group.Year,
            group.Name,
            group.TeacherId,
            group.IsActive);
    }

    private static ClassScheduleResponse ToClassScheduleResponse(ClassSchedule schedule)
    {
        return new ClassScheduleResponse(
            schedule.Id,
            schedule.CourseId,
            schedule.CurricularUnitId,
            schedule.ClassGroupId,
            schedule.AcademicYearId,
            schedule.Semester,
            schedule.ComponentType,
            schedule.DayOfWeek,
            schedule.StartTime,
            schedule.EndTime,
            schedule.ClassroomId,
            schedule.IsActive);
    }

    private static CourseTeacherAssignmentResponse ToCourseAssignmentResponse(CourseTeacherAssignment assignment, string courseName)
    {
        return new CourseTeacherAssignmentResponse(
            assignment.Id,
            assignment.UserId,
            assignment.UserEmail,
            assignment.CourseId,
            courseName,
            assignment.IsCoordinator,
            assignment.CreatedAt,
            assignment.UpdatedAt);
    }

    private async Task<string> GetListVersionAsync(CancellationToken cancellationToken)
    {
        return await _cache.GetStringAsync(CacheKeys.CourseListVersion, cancellationToken) ?? "0";
    }

    private async Task InvalidateListCacheAsync(CancellationToken cancellationToken)
    {
        var version = await GetListVersionAsync(cancellationToken);
        var nextVersion = (int.TryParse(version, out var v) ? v : 0) + 1;
        await _cache.SetStringAsync(CacheKeys.CourseListVersion, nextVersion.ToString(), cancellationToken);
        await InvalidateDashboardCacheAsync(cancellationToken);
    }

    private async Task InvalidateDashboardCacheAsync(CancellationToken cancellationToken)
    {
        try
        {
            var version = await _cache.GetStringAsync(CacheKeys.DashboardSummaryVersion, cancellationToken) ?? "0";
            var nextVersion = (int.TryParse(version, out var v) ? v : 0) + 1;
            await _cache.SetStringAsync(CacheKeys.DashboardSummaryVersion, nextVersion.ToString(), cancellationToken);
        }
        catch (Exception)
        {
            // Ignore cache errors
        }
    }

    private async Task InvalidateDetailsCacheAsync(Guid id, CancellationToken cancellationToken)
    {
        var activeYear = await _academicYearRepository.GetActiveAsync(cancellationToken);
        if (activeYear != null)
        {
            await _cache.RemoveAsync(CacheKeys.CourseDetails(id, activeYear.Id), cancellationToken);
        }
        await InvalidateDashboardCacheAsync(cancellationToken);
    }
}
