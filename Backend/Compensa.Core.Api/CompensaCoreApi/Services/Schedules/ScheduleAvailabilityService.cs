using CompensaCoreApi.Dtos.Schedules;
using CompensaCoreApi.Repositories.CompensationRequests;
using CompensaCoreApi.Repositories.Courses;

namespace CompensaCoreApi.Services.Schedules;

public sealed class ScheduleAvailabilityService : IScheduleAvailabilityService
{
    private readonly ICourseRepository _courseRepository;
    private readonly ICompensationRequestRepository _requestRepository;

    public ScheduleAvailabilityService(
        ICourseRepository courseRepository,
        ICompensationRequestRepository requestRepository)
    {
        _courseRepository = courseRepository;
        _requestRepository = requestRepository;
    }

    public async Task<ScheduleAvailabilityResponse> CheckAsync(
        ScheduleAvailabilityQuery query,
        CancellationToken cancellationToken = default)
    {
        if (query.StartTime >= query.EndTime)
            throw new InvalidOperationException("Start time must be before end time.");

        var conflicts = new List<ScheduleConflictResponse>();
        var dayOfWeek = (int)query.Date.DayOfWeek;

        var scheduleOverlaps = await _courseRepository.ListOverlappingSchedulesAsync(
            query.AcademicYearId,
            query.Semester,
            dayOfWeek,
            query.StartTime,
            query.EndTime,
            query.ExcludedScheduleId,
            cancellationToken);

        foreach (var overlap in scheduleOverlaps)
        {
            if (query.ClassGroupId.HasValue && overlap.Schedule.ClassGroupId == query.ClassGroupId)
            {
                conflicts.Add(new ScheduleConflictResponse(
                    "ClassGroup",
                    "The selected class group already has a class in this interval.",
                    overlap.Schedule.Id,
                    null));
            }

            if (query.ClassroomId.HasValue && overlap.Schedule.ClassroomId == query.ClassroomId)
            {
                conflicts.Add(new ScheduleConflictResponse(
                    "Classroom",
                    "The selected classroom is already occupied in this interval.",
                    overlap.Schedule.Id,
                    null));
            }

            if (!string.IsNullOrWhiteSpace(query.TeacherUserId) && overlap.ClassGroup.TeacherId == query.TeacherUserId)
            {
                conflicts.Add(new ScheduleConflictResponse(
                    "Teacher",
                    "The selected teacher already has a class in this interval.",
                    overlap.Schedule.Id,
                    null));
            }
        }

        var requestOverlaps = await _requestRepository.ListOverlappingActiveAsync(
            query.AcademicYearId,
            query.Semester,
            query.Date,
            query.StartTime,
            query.EndTime,
            query.ExcludedRequestId,
            cancellationToken);

        foreach (var request in requestOverlaps)
        {
            if (query.ClassGroupId.HasValue && request.ClassGroupId == query.ClassGroupId)
            {
                conflicts.Add(new ScheduleConflictResponse(
                    "ClassGroupRequest",
                    "The selected class group already has a compensation request in this interval.",
                    null,
                    request.Id));
            }

            if (query.ClassroomId.HasValue && request.NewClassroomId == query.ClassroomId)
            {
                conflicts.Add(new ScheduleConflictResponse(
                    "ClassroomRequest",
                    "The selected classroom already has a compensation request in this interval.",
                    null,
                    request.Id));
            }

            if (!string.IsNullOrWhiteSpace(query.TeacherUserId) && request.TeacherUserId == query.TeacherUserId)
            {
                conflicts.Add(new ScheduleConflictResponse(
                    "TeacherRequest",
                    "The selected teacher already has a compensation request in this interval.",
                    null,
                    request.Id));
            }
        }

        return new ScheduleAvailabilityResponse(conflicts.Count == 0, conflicts);
    }
}
