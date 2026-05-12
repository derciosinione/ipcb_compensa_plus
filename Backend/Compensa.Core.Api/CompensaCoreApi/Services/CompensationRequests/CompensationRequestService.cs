using CompensaCoreApi.Domain.CompensationRequests;
using CompensaCoreApi.Domain.Courses;
using CompensaCoreApi.Dtos.CompensationRequests;
using CompensaCoreApi.Exceptions;
using CompensaCoreApi.Repositories.Assignments;
using CompensaCoreApi.Repositories.AcademicYears;
using CompensaCoreApi.Repositories.Classrooms;
using CompensaCoreApi.Repositories.CompensationRequests;
using CompensaCoreApi.Repositories.Courses;
using CompensaCoreApi.Services.Audit;
using MassTransit;
using CompensaCoreApi.IntegrationEvents;
using CompensaCoreApi.Infrastructure.Caching;
using Microsoft.Extensions.Caching.Distributed;

namespace CompensaCoreApi.Services.CompensationRequests;

public sealed class CompensationRequestService : ICompensationRequestService
{
    private readonly ICompensationRequestRepository _repository;
    private readonly ICourseRepository _courseRepository;
    private readonly IClassroomRepository _classroomRepository;
    private readonly IAcademicYearRepository _academicYearRepository;
    private readonly IUserUnitAssignmentRepository _assignmentRepository;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly IAuditService _auditService;
    private readonly IDistributedCache _cache;

    public CompensationRequestService(
        ICompensationRequestRepository repository,
        ICourseRepository courseRepository,
        IClassroomRepository classroomRepository,
        IAcademicYearRepository academicYearRepository,
        IUserUnitAssignmentRepository assignmentRepository,
        IPublishEndpoint publishEndpoint,
        IAuditService auditService,
        IDistributedCache cache)
    {
        _repository = repository;
        _courseRepository = courseRepository;
        _classroomRepository = classroomRepository;
        _academicYearRepository = academicYearRepository;
        _assignmentRepository = assignmentRepository;
        _publishEndpoint = publishEndpoint;
        _auditService = auditService;
        _cache = cache;
    }

    public async Task<IReadOnlyCollection<CompensationRequestResponse>> ListAsync(
        CompensationRequestStatus? status,
        string? teacherUserId,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        // Security check: Teachers can only see their own requests
        if (!isAdmin && !isCoordinator)
        {
            teacherUserId = actorUserId;
        }

        var requests = await _repository.ListAsync(status, teacherUserId, cancellationToken);
        
        // Extra layer for coordinators: they should only see requests for their courses?
        // For now, we trust the filter above for teachers, and let coordinators see all.
        // If we wanted to be stricter:
        // if (isCoordinator && !isAdmin) { /* filter requests by coordinated course IDs */ }

        return requests.Select(ToResponse).ToArray();
    }

    public async Task<CompensationRequestResponse> GetByIdAsync(
        Guid id,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        var request = await GetRequiredRequestAsync(id, cancellationToken);
        
        // Security check: If teacher, must be the owner
        if (!isAdmin && !isCoordinator && request.TeacherUserId != actorUserId)
        {
            throw new ForbiddenException("You don't have permission to view this request.");
        }

        return ToResponse(request);
    }

    public async Task<CompensationRequestResponse> CreateAsync(
        CreateCompensationRequestRequest request,
        string actorUserId,
        bool canCreateForOthers,
        CancellationToken cancellationToken = default)
    {
        ValidateSchedule(request.NewStartTime, request.NewEndTime, "new");
        EnsureCanCreateRequestForUser(request, actorUserId, canCreateForOthers);

        var academicYear = await _academicYearRepository.GetByIdAsync(request.AcademicYearId, cancellationToken)
            ?? throw new NotFoundException($"Academic year '{request.AcademicYearId}' was not found.");

        var course = await _courseRepository.GetByIdAsync(request.CourseId, cancellationToken)
            ?? throw new NotFoundException($"Course '{request.CourseId}' was not found.");

        var unit = await _courseRepository.GetUnitByIdAsync(request.CourseId, request.CurricularUnitId, cancellationToken)
            ?? throw new NotFoundException($"Curricular unit '{request.CurricularUnitId}' was not found in course '{request.CourseId}'.");

        var classGroup = await _courseRepository.GetClassGroupByIdAsync(request.CourseId, request.ClassGroupId, cancellationToken)
            ?? throw new NotFoundException($"Class group '{request.ClassGroupId}' was not found in course '{request.CourseId}'.");

        var originalSchedule = await _courseRepository.GetClassScheduleByIdAsync(request.OriginalClassScheduleId, cancellationToken)
            ?? throw new NotFoundException($"Original class schedule '{request.OriginalClassScheduleId}' was not found.");

        var originalRoom = await _classroomRepository.GetByIdAsync(originalSchedule.ClassroomId, cancellationToken)
            ?? throw new NotFoundException($"Original classroom '{originalSchedule.ClassroomId}' was not found.");

        var newRoom = await _classroomRepository.GetByIdAsync(request.NewClassroomId, cancellationToken)
            ?? throw new NotFoundException($"New classroom '{request.NewClassroomId}' was not found.");

        ValidateOriginalSchedule(request, academicYear.Id, course.Id, unit.Id, classGroup.Id, originalSchedule);
        await EnsureTeacherCanUseClassAsync(request, classGroup, canCreateForOthers, cancellationToken);
        await EnsureNewScheduleHasNoConflictsAsync(request, classGroup, originalSchedule, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var compensationRequest = new CompensationRequest
        {
            TeacherUserId = request.TeacherUserId.Trim(),
            TeacherName = request.TeacherName.Trim(),
            AcademicYearId = academicYear.Id,
            Semester = originalSchedule.Semester,
            CourseId = course.Id,
            CurricularUnitId = unit.Id,
            ClassGroupId = classGroup.Id,
            OriginalClassScheduleId = originalSchedule.Id,
            OriginalClassroomId = originalSchedule.ClassroomId,
            NewClassroomId = newRoom.Id,
            Course = course.Name,
            CurricularUnit = unit.Name,
            YearGroups = [$"Year {unit.Year}", classGroup.Name],
            ComponentType = ToTeachingComponentType(originalSchedule.ComponentType),
            OriginalDate = request.OriginalDate,
            OriginalStartTime = originalSchedule.StartTime,
            OriginalEndTime = originalSchedule.EndTime,
            OriginalRoom = originalRoom.Name,
            NewDate = request.NewDate,
            NewStartTime = request.NewStartTime,
            NewEndTime = request.NewEndTime,
            NewRoom = newRoom.Name,
            Justification = request.Justification.Trim(),
            Status = CompensationRequestStatus.Pending,
            HasConflict = false,
            SubmittedAt = now,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _repository.AddAsync(compensationRequest, cancellationToken);

        await _auditService.LogActionAsync(
            "CompensationRequest",
            compensationRequest.Id.ToString(),
            "Create",
            actorUserId,
            null,
            compensationRequest);

        var coordinatorUserIds = await GetCourseCoordinatorUserIdsAsync(course, cancellationToken);
        foreach (var coordinatorUserId in coordinatorUserIds)
        {
            await _publishEndpoint.Publish(new RequestCreatedEvent
            {
                RequestId = compensationRequest.Id,
                TeacherUserId = compensationRequest.TeacherUserId,
                TeacherName = compensationRequest.TeacherName,
                CourseId = compensationRequest.CourseId?.ToString() ?? string.Empty,
                CoordinatorUserId = coordinatorUserId,
                SubmittedAt = compensationRequest.SubmittedAt.UtcDateTime
            }, cancellationToken);
        }

        await InvalidateDashboardCacheAsync(cancellationToken);

        return ToResponse(compensationRequest);
    }

    public async Task<CompensationRequestResponse> UpdateStatusAsync(
        Guid id,
        UpdateCompensationRequestStatusRequest request,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        var compensationRequest = await GetRequiredRequestAsync(id, cancellationToken);
        await EnsureCanDecideRequestAsync(compensationRequest, actorUserId, isCoordinator, isAdmin, cancellationToken);
        
        if (compensationRequest.CourseId == null) throw new InvalidOperationException("Request has no associated course.");
        var course = await _courseRepository.GetByIdAsync(compensationRequest.CourseId.Value, cancellationToken);
        if (course is null) throw new InvalidOperationException("Course not found.");

        if (compensationRequest.Status is CompensationRequestStatus.Cancelled)
            throw new InvalidOperationException("Cancelled requests cannot be changed.");

        if (request.Status is CompensationRequestStatus.Rejected && string.IsNullOrWhiteSpace(request.DecisionComment))
            throw new InvalidOperationException("Rejected requests require a decision comment.");

        var previousState = new { compensationRequest.Status, compensationRequest.DecisionComment };

        compensationRequest.Status = request.Status;
        compensationRequest.DecisionComment = request.DecisionComment?.Trim();
        compensationRequest.UpdatedAt = DateTimeOffset.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);

        await _auditService.LogActionAsync(
            "CompensationRequest",
            compensationRequest.Id.ToString(),
            "UpdateStatus",
            actorUserId,
            previousState,
            new { compensationRequest.Status, compensationRequest.DecisionComment });

        var decisionCoordinatorIds = await GetCourseCoordinatorUserIdsAsync(course, cancellationToken);
        foreach (var coordinatorUserId in decisionCoordinatorIds.DefaultIfEmpty(actorUserId))
        {
            await _publishEndpoint.Publish(new RequestStatusUpdatedEvent
            {
                RequestId = compensationRequest.Id,
                TeacherUserId = compensationRequest.TeacherUserId,
                CoordinatorUserId = coordinatorUserId,
                UpdatedByUserId = actorUserId,
                Status = compensationRequest.Status.ToString(),
                DecisionComment = compensationRequest.DecisionComment
            }, cancellationToken);
        }

        await InvalidateDashboardCacheAsync(cancellationToken);

        return ToResponse(compensationRequest);
    }

    private async Task<CompensationRequest> GetRequiredRequestAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Compensation request '{id}' was not found.");
    }

    private static void ValidateSchedule(TimeOnly startTime, TimeOnly endTime, string label)
    {
        if (startTime >= endTime)
            throw new InvalidOperationException($"The {label} start time must be before the end time.");
    }

    private static void EnsureCanCreateRequestForUser(
        CreateCompensationRequestRequest request,
        string actorUserId,
        bool canCreateForOthers)
    {
        if (string.IsNullOrWhiteSpace(actorUserId))
            throw new InvalidOperationException("Authenticated user id is required.");

        if (!canCreateForOthers && request.TeacherUserId != actorUserId)
            throw new InvalidOperationException("Teachers can only create compensation requests for themselves.");
    }

    private static void ValidateOriginalSchedule(
        CreateCompensationRequestRequest request,
        Guid academicYearId,
        Guid courseId,
        Guid unitId,
        Guid classGroupId,
        ClassSchedule originalSchedule)
    {
        if (originalSchedule.AcademicYearId != academicYearId ||
            originalSchedule.CourseId != courseId ||
            originalSchedule.CurricularUnitId != unitId ||
            originalSchedule.ClassGroupId != classGroupId)
        {
            throw new InvalidOperationException("Original schedule does not match the selected academic context.");
        }

        if (originalSchedule.DayOfWeek != (int)request.OriginalDate.DayOfWeek)
            throw new InvalidOperationException("Original date does not match the weekday of the selected class schedule.");
    }

    private async Task EnsureNewScheduleHasNoConflictsAsync(
        CreateCompensationRequestRequest request,
        ClassGroup classGroup,
        ClassSchedule originalSchedule,
        CancellationToken cancellationToken)
    {
        var overlaps = await _courseRepository.ListOverlappingSchedulesAsync(
            originalSchedule.AcademicYearId,
            originalSchedule.Semester,
            (int)request.NewDate.DayOfWeek,
            request.NewStartTime,
            request.NewEndTime,
            excludedScheduleId: originalSchedule.Id,
            cancellationToken);

        var classConflict = overlaps.FirstOrDefault(item => item.Schedule.ClassGroupId == classGroup.Id);
        if (classConflict.Schedule != null)
            throw new InvalidOperationException($"Class group '{classGroup.Name}' already has a class in the proposed time interval.");

        var roomConflict = overlaps.FirstOrDefault(item => item.Schedule.ClassroomId == request.NewClassroomId);
        if (roomConflict.Schedule != null)
            throw new InvalidOperationException("The selected classroom is already occupied in the proposed time interval.");

        var teacherConflict = overlaps.FirstOrDefault(item => item.ClassGroup.TeacherId == classGroup.TeacherId);
        if (teacherConflict.Schedule != null)
            throw new InvalidOperationException($"Teacher '{classGroup.TeacherId}' already has a class in the proposed time interval.");

        var requestOverlaps = await _repository.ListOverlappingActiveAsync(
            originalSchedule.AcademicYearId,
            originalSchedule.Semester,
            request.NewDate,
            request.NewStartTime,
            request.NewEndTime,
            excludedRequestId: null,
            cancellationToken);

        var requestedClassConflict = requestOverlaps.FirstOrDefault(item => item.ClassGroupId == classGroup.Id);
        if (requestedClassConflict != null)
            throw new InvalidOperationException($"Class group '{classGroup.Name}' already has a compensation request in the proposed time interval.");

        var requestedRoomConflict = requestOverlaps.FirstOrDefault(item => item.NewClassroomId == request.NewClassroomId);
        if (requestedRoomConflict != null)
            throw new InvalidOperationException("The selected classroom already has a compensation request in the proposed time interval.");

        var requestedTeacherConflict = requestOverlaps.FirstOrDefault(item => item.TeacherUserId == classGroup.TeacherId);
        if (requestedTeacherConflict != null)
            throw new InvalidOperationException($"Teacher '{classGroup.TeacherId}' already has a compensation request in the proposed time interval.");
    }

    private async Task EnsureTeacherCanUseClassAsync(
        CreateCompensationRequestRequest request,
        ClassGroup classGroup,
        bool canCreateForOthers,
        CancellationToken cancellationToken)
    {
        if (canCreateForOthers)
            return;

        if (classGroup.TeacherId == request.TeacherUserId)
            return;

        var assignments = await _assignmentRepository.ListByUserAsync(request.TeacherUserId, cancellationToken);
        if (assignments.Any(assignment => assignment.CurricularUnitId == classGroup.CurricularUnitId))
            return;

        throw new InvalidOperationException("Teacher is not assigned to the selected curricular unit or class group.");
    }

    private async Task EnsureCanDecideRequestAsync(
        CompensationRequest request,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken)
    {
        if (isAdmin && !isCoordinator)
            throw new InvalidOperationException("Administrators can monitor requests but cannot approve or reject them as coordinators.");

        if (!isCoordinator)
            throw new InvalidOperationException("Only coordinators can approve or reject compensation requests.");

        if (!request.CourseId.HasValue)
            throw new InvalidOperationException("Request is not linked to a course.");

        var course = await _courseRepository.GetByIdAsync(request.CourseId.Value, cancellationToken)
            ?? throw new NotFoundException($"Course '{request.CourseId}' was not found.");

        if (course.CoordinatorUserId == actorUserId)
            return;

        var courseAssignments = await _assignmentRepository.ListCoursesByUserAsync(actorUserId, cancellationToken);
        if (courseAssignments.Any(assignment => assignment.CourseId == request.CourseId && assignment.IsCoordinator))
            return;

        throw new InvalidOperationException("Coordinator is not responsible for this course.");
    }

    private async Task<string[]> GetCourseCoordinatorUserIdsAsync(
        Course course,
        CancellationToken cancellationToken)
    {
        var assignmentCoordinatorIds = (await _courseRepository.ListCourseAssignmentsAsync(course.Id, cancellationToken))
            .Where(assignment => assignment.IsCoordinator)
            .Select(assignment => assignment.UserId)
            .Where(userId => !string.IsNullOrWhiteSpace(userId));

        return assignmentCoordinatorIds
            .Concat(string.IsNullOrWhiteSpace(course.CoordinatorUserId) ? [] : [course.CoordinatorUserId])
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    private static TeachingComponentType ToTeachingComponentType(UnitComponentType type)
    {
        return type switch
        {
            UnitComponentType.Practical => TeachingComponentType.Practical,
            UnitComponentType.Theoretical => TeachingComponentType.Theoretical,
            _ => TeachingComponentType.All
        };
    }

    private static CompensationRequestResponse ToResponse(CompensationRequest request)
    {
        return new CompensationRequestResponse(
            request.Id,
            request.TeacherUserId,
            request.TeacherName,
            request.AcademicYearId,
            request.Semester,
            request.CourseId,
            request.CurricularUnitId,
            request.ClassGroupId,
            request.OriginalClassScheduleId,
            request.OriginalClassroomId,
            request.NewClassroomId,
            request.Course,
            request.CurricularUnit,
            request.YearGroups,
            request.ComponentType,
            request.OriginalDate,
            request.OriginalStartTime,
            request.OriginalEndTime,
            request.OriginalRoom,
            request.NewDate,
            request.NewStartTime,
            request.NewEndTime,
            request.NewRoom,
            request.Justification,
            request.Status,
            request.DecisionComment,
            request.HasConflict,
            request.SubmittedAt,
            request.CreatedAt,
            request.UpdatedAt);
    }

    private async Task InvalidateDashboardCacheAsync(CancellationToken cancellationToken)
    {
        await _cache.RemoveAsync(CacheKeys.DashboardSummary, cancellationToken);
    }
}
