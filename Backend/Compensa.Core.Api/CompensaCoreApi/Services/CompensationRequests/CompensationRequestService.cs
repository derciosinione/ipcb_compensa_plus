using CompensaCoreApi.Domain.CompensationRequests;
using CompensaCoreApi.Domain.Courses;
using CompensaCoreApi.Dtos.CompensationRequests;
using CompensaCoreApi.Exceptions;
using CompensaCoreApi.Repositories.AcademicYears;
using CompensaCoreApi.Repositories.Classrooms;
using CompensaCoreApi.Repositories.CompensationRequests;
using CompensaCoreApi.Repositories.Courses;

namespace CompensaCoreApi.Services.CompensationRequests;

public sealed class CompensationRequestService : ICompensationRequestService
{
    private readonly ICompensationRequestRepository _repository;
    private readonly ICourseRepository _courseRepository;
    private readonly IClassroomRepository _classroomRepository;
    private readonly IAcademicYearRepository _academicYearRepository;

    public CompensationRequestService(
        ICompensationRequestRepository repository,
        ICourseRepository courseRepository,
        IClassroomRepository classroomRepository,
        IAcademicYearRepository academicYearRepository)
    {
        _repository = repository;
        _courseRepository = courseRepository;
        _classroomRepository = classroomRepository;
        _academicYearRepository = academicYearRepository;
    }

    public async Task<IReadOnlyCollection<CompensationRequestResponse>> ListAsync(
        CompensationRequestStatus? status,
        string? teacherUserId,
        CancellationToken cancellationToken = default)
    {
        var requests = await _repository.ListAsync(status, teacherUserId, cancellationToken);
        return requests.Select(ToResponse).ToArray();
    }

    public async Task<CompensationRequestResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var request = await GetRequiredRequestAsync(id, cancellationToken);
        return ToResponse(request);
    }

    public async Task<CompensationRequestResponse> CreateAsync(
        CreateCompensationRequestRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateSchedule(request.NewStartTime, request.NewEndTime, "new");

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
        return ToResponse(compensationRequest);
    }

    public async Task<CompensationRequestResponse> UpdateStatusAsync(
        Guid id,
        UpdateCompensationRequestStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        var compensationRequest = await GetRequiredRequestAsync(id, cancellationToken);

        if (compensationRequest.Status is CompensationRequestStatus.Cancelled)
            throw new InvalidOperationException("Cancelled requests cannot be changed.");

        if (request.Status is CompensationRequestStatus.Rejected && string.IsNullOrWhiteSpace(request.DecisionComment))
            throw new InvalidOperationException("Rejected requests require a decision comment.");

        compensationRequest.Status = request.Status;
        compensationRequest.DecisionComment = request.DecisionComment?.Trim();
        compensationRequest.UpdatedAt = DateTimeOffset.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
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
}
