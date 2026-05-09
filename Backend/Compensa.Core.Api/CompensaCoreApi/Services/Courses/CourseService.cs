using CompensaCoreApi.Domain.Courses;
using CompensaCoreApi.Dtos.Courses;
using CompensaCoreApi.Exceptions;
using CompensaCoreApi.Repositories.Courses;

namespace CompensaCoreApi.Services.Courses;

public sealed class CourseService : ICourseService
{
    private const string DefaultCourseImageUrl = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop";

    private readonly ICourseRepository _repository;

    public CourseService(ICourseRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyCollection<CourseResponse>> ListAsync(
        string? search,
        CancellationToken cancellationToken = default)
    {
        var courses = await _repository.ListAsync(search, cancellationToken);
        return courses.Select(ToResponse).ToArray();
    }

    public async Task<CourseResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var course = await GetRequiredCourseAsync(id, cancellationToken);
        return ToResponse(course);
    }

    public async Task<CourseDetailsResponse> GetDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var course = await GetRequiredCourseAsync(id, cancellationToken);
        var units = await _repository.ListUnitsAsync(id, cancellationToken);
        var components = await _repository.ListComponentsAsync(id, cancellationToken);
        var unitAssignments = await _repository.ListUnitAssignmentsAsync(id, cancellationToken);
        var classes = await _repository.ListClassGroupsAsync(id, cancellationToken);

        var componentResponses = components.Select(ToComponentResponse).ToArray();

        return new CourseDetailsResponse(
            ToResponse(course),
            units.Select(unit => ToUnitResponse(
                    unit,
                    componentResponses.Where(component => component.CurricularUnitId == unit.Id).ToArray(),
                    unitAssignments
                        .Where(assignment => assignment.CurricularUnitId == unit.Id)
                        .Select(assignment => assignment.UserId)
                        .Distinct()
                        .ToArray()))
                .ToArray(),
            componentResponses,
            classes.Select(ToClassGroupResponse).ToArray());
    }

    public async Task<CourseResponse> CreateAsync(
        CreateCourseRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureUniqueAbbreviationAsync(request.Abbreviation, excludedCourseId: null, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var course = new Course
        {
            Name = request.Name.Trim(),
            Abbreviation = request.Abbreviation.Trim().ToUpperInvariant(),
            Type = request.Type,
            Description = request.Description.Trim(),
            DurationYears = request.DurationYears,
            TotalCredits = request.TotalCredits,
            CoordinatorUserId = NormalizeOptional(request.CoordinatorUserId),
            ImageUrl = NormalizeImageUrl(request.ImageUrl, request.Type),
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _repository.AddAsync(course, cancellationToken);
        return ToResponse(course);
    }

    public async Task<CourseResponse> UpdateAsync(
        Guid id,
        UpdateCourseRequest request,
        CancellationToken cancellationToken = default)
    {
        var course = await GetRequiredCourseAsync(id, cancellationToken);
        await EnsureUniqueAbbreviationAsync(request.Abbreviation, course.Id, cancellationToken);

        course.Name = request.Name.Trim();
        course.Abbreviation = request.Abbreviation.Trim().ToUpperInvariant();
        course.Type = request.Type;
        course.Description = request.Description.Trim();
        course.DurationYears = request.DurationYears;
        course.TotalCredits = request.TotalCredits;
        course.CoordinatorUserId = NormalizeOptional(request.CoordinatorUserId);
        course.ImageUrl = NormalizeImageUrl(request.ImageUrl, request.Type);
        course.IsActive = request.IsActive;
        course.UpdatedAt = DateTimeOffset.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        return ToResponse(course);
    }

    public async Task<CurricularUnitResponse> CreateUnitAsync(
        Guid courseId,
        UpsertCurricularUnitRequest request,
        CancellationToken cancellationToken = default)
    {
        var course = await GetRequiredCourseAsync(courseId, cancellationToken);
        ValidateUnitBelongsToCourseYear(course, request.Year);

        var now = DateTimeOffset.UtcNow;
        var unit = new CurricularUnit
        {
            CourseId = course.Id,
            Name = request.Name.Trim(),
            Year = request.Year,
            Semester = request.Semester,
            Ects = request.Ects,
            ResponsibleTeacherId = request.ResponsibleTeacherId.Trim(),
            ResponsibleTeacherEmail = request.ResponsibleTeacherEmail.Trim().ToLowerInvariant(),
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _repository.AddUnitAsync(unit, cancellationToken);
        return ToUnitResponse(unit, Array.Empty<CurricularUnitComponentResponse>(), Array.Empty<string>());
    }

    public async Task<CurricularUnitResponse> UpdateUnitAsync(
        Guid courseId,
        Guid unitId,
        UpsertCurricularUnitRequest request,
        CancellationToken cancellationToken = default)
    {
        var course = await GetRequiredCourseAsync(courseId, cancellationToken);
        ValidateUnitBelongsToCourseYear(course, request.Year);

        var unit = await GetRequiredUnitAsync(courseId, unitId, cancellationToken);
        unit.Name = request.Name.Trim();
        unit.Year = request.Year;
        unit.Semester = request.Semester;
        unit.Ects = request.Ects;
        unit.ResponsibleTeacherId = request.ResponsibleTeacherId.Trim();
        unit.ResponsibleTeacherEmail = request.ResponsibleTeacherEmail.Trim().ToLowerInvariant();
        unit.IsActive = request.IsActive;
        unit.UpdatedAt = DateTimeOffset.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);

        var components = await _repository.ListComponentsAsync(courseId, cancellationToken);
        var assignments = await _repository.ListUnitAssignmentsAsync(courseId, cancellationToken);

        return ToUnitResponse(
            unit,
            components.Where(component => component.CurricularUnitId == unit.Id).Select(ToComponentResponse).ToArray(),
            assignments
                .Where(assignment => assignment.CurricularUnitId == unit.Id)
                .Select(assignment => assignment.UserId)
                .Distinct()
                .ToArray());
    }

    public async Task DeleteUnitAsync(Guid courseId, Guid unitId, CancellationToken cancellationToken = default)
    {
        var unit = await GetRequiredUnitAsync(courseId, unitId, cancellationToken);
        await _repository.DeleteUnitAsync(unit, cancellationToken);
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
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var course = await GetRequiredCourseAsync(id, cancellationToken);
        await _repository.DeleteAsync(course, cancellationToken);
    }

    private async Task<Course> GetRequiredCourseAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Course '{id}' was not found.");
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

    private static void ValidateUnitBelongsToCourseYear(Course course, int year)
    {
        if (year > course.DurationYears)
            throw new InvalidOperationException($"Year {year} is outside the {course.DurationYears}-year duration of course '{course.Name}'.");
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

    private static CourseResponse ToResponse(Course course)
    {
        return new CourseResponse(
            course.Id,
            course.Name,
            course.Abbreviation,
            course.Type,
            course.Description,
            course.DurationYears,
            course.TotalCredits,
            course.CoordinatorUserId,
            course.ImageUrl,
            course.IsActive,
            course.CreatedAt,
            course.UpdatedAt);
    }

    private static CurricularUnitResponse ToUnitResponse(
        CurricularUnit unit,
        IReadOnlyCollection<CurricularUnitComponentResponse> components,
        string[] teacherIds)
    {
        return new CurricularUnitResponse(
            unit.Id,
            unit.CourseId,
            unit.Name,
            unit.Year,
            unit.Semester,
            unit.Ects,
            teacherIds,
            unit.ResponsibleTeacherId,
            unit.ResponsibleTeacherEmail,
            components,
            unit.IsActive);
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
            group.CurricularUnitId,
            group.Name,
            group.TeacherId,
            group.IsActive);
    }
}
