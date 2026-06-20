using CompensaCoreApi.Domain.CompensationRequests;
using CompensaCoreApi.Domain.Courses;
using CompensaCoreApi.Dtos.Schedules;
using CompensaCoreApi.Repositories.Classrooms;
using CompensaCoreApi.Repositories.CompensationRequests;
using CompensaCoreApi.Repositories.Courses;

namespace CompensaCoreApi.Services.Schedules;

public sealed class ScheduleAvailabilityService : IScheduleAvailabilityService
{
    private readonly ICourseRepository _courseRepository;
    private readonly ICompensationRequestRepository _requestRepository;
    private readonly IClassroomRepository _classroomRepository;

    public ScheduleAvailabilityService(
        ICourseRepository courseRepository,
        ICompensationRequestRepository requestRepository,
        IClassroomRepository classroomRepository)
    {
        _courseRepository = courseRepository;
        _requestRepository = requestRepository;
        _classroomRepository = classroomRepository;
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

    public async Task<IReadOnlyCollection<ClassroomAvailabilityItem>> CheckRoomsAvailabilityAsync(
        RoomsAvailabilityQuery query,
        CancellationToken cancellationToken = default)
    {
        if (query.StartTime >= query.EndTime)
            throw new InvalidOperationException("Start time must be before end time.");

        var dayOfWeek = (int)query.Date.DayOfWeek;

        // 1. Get all active classrooms
        var allClassrooms = await _classroomRepository.ListAsync(null, cancellationToken);
        var activeClassrooms = allClassrooms.Where(c => c.IsActive).ToList();

        // 2. Find all overlapping fixed schedules in this slot (across all rooms)
        var scheduleOverlaps = await _courseRepository.ListOverlappingSchedulesAsync(
            query.AcademicYearId,
            query.Semester,
            dayOfWeek,
            query.StartTime,
            query.EndTime,
            query.ExcludedScheduleId,
            cancellationToken);

        // 3. Find all overlapping compensation requests in this slot (across all rooms)
        var requestOverlaps = await _requestRepository.ListOverlappingActiveAsync(
            query.AcademicYearId,
            query.Semester,
            query.Date,
            query.StartTime,
            query.EndTime,
            excludedRequestId: null,
            cancellationToken);

        // Index conflicts by classroom ID
        var busyRooms = new Dictionary<Guid, string>();

        foreach (var overlap in scheduleOverlaps)
        {
            if (overlap.Schedule.ClassroomId.HasValue && !busyRooms.ContainsKey(overlap.Schedule.ClassroomId.Value))
            {
                var start = overlap.Schedule.StartTime.ToString(@"HH\:mm");
                var end = overlap.Schedule.EndTime.ToString(@"HH\:mm");
                busyRooms[overlap.Schedule.ClassroomId.Value] = $"Occupied {start}–{end} (regular class)";
            }
        }

        foreach (var req in requestOverlaps)
        {
            if (req.NewClassroomId.HasValue && !busyRooms.ContainsKey(req.NewClassroomId.Value))
            {
                var start = req.NewStartTime.ToString(@"HH\:mm");
                var end = req.NewEndTime.ToString(@"HH\:mm");
                busyRooms[req.NewClassroomId.Value] = $"Occupied {start}–{end} (compensation request)";
            }
        }

        return activeClassrooms
            .Select(room =>
            {
                var isBusy = busyRooms.TryGetValue(room.Id, out var conflictInfo);
                return new ClassroomAvailabilityItem(
                    room.Id,
                    room.Name,
                    !isBusy,
                    isBusy ? conflictInfo : null);
            })
            .OrderBy(r => r.IsAvailable ? 0 : 1)  // Available rooms first
            .ThenBy(r => r.ClassroomName)
            .ToArray();
    }

    public async Task<ClassGroupDayResponse> CheckClassGroupDayAsync(
        ClassGroupDayQuery query,
        CancellationToken cancellationToken = default)
    {
        var ids = (query.ClassGroupIds ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(s => Guid.TryParse(s, out var g) ? g : Guid.Empty)
            .Where(g => g != Guid.Empty)
            .ToArray();

        if (ids.Length == 0)
        {
            return new ClassGroupDayResponse(
                Array.Empty<ClassGroupBusySlot>(),
                new[] { "08:00–22:00" });
        }

        var dayOfWeek = (int)query.Date.DayOfWeek;

        // 1. Get fixed schedules for class groups on this day
        var schedules = await _courseRepository.ListClassGroupSchedulesForDayAsync(
            ids,
            dayOfWeek,
            query.AcademicYearId,
            query.Semester,
            query.ExcludedScheduleId,
            cancellationToken);

        // 2. Get active compensation requests on this day
        var activeRequests = await _requestRepository.ListActiveForClassGroupsOnDateAsync(
            ids,
            query.Date,
            cancellationToken);

        // 2.1. Get fixed schedules for the teacher on this day (if TeacherUserId is provided)
        IReadOnlyCollection<ClassSchedule> teacherSchedules = Array.Empty<ClassSchedule>();
        if (!string.IsNullOrWhiteSpace(query.TeacherUserId))
        {
            teacherSchedules = await _courseRepository.ListTeacherSchedulesForDayAsync(
                query.TeacherUserId,
                dayOfWeek,
                query.AcademicYearId,
                query.Semester,
                query.ExcludedScheduleId,
                cancellationToken);
        }

        // 2.2. Get active compensation requests for the teacher on this day (if TeacherUserId is provided)
        IReadOnlyCollection<CompensationRequest> teacherRequests = Array.Empty<CompensationRequest>();
        if (!string.IsNullOrWhiteSpace(query.TeacherUserId))
        {
            teacherRequests = await _requestRepository.ListActiveForTeacherOnDateAsync(
                query.TeacherUserId,
                query.Date,
                cancellationToken);
        }

        // 3. Populate busy slots
        var busySlots = new List<ClassGroupBusySlot>();
        foreach (var s in schedules)
        {
            busySlots.Add(new ClassGroupBusySlot(
                s.StartTime.ToString(@"HH\:mm"),
                s.EndTime.ToString(@"HH\:mm"),
                "ClassSchedule"));
        }
        foreach (var r in activeRequests)
        {
            busySlots.Add(new ClassGroupBusySlot(
                r.NewStartTime.ToString(@"HH\:mm"),
                r.NewEndTime.ToString(@"HH\:mm"),
                "CompensationRequest"));
        }
        foreach (var s in teacherSchedules)
        {
            // Avoid duplicates
            if (schedules.Any(cs => cs.Id == s.Id))
                continue;

            busySlots.Add(new ClassGroupBusySlot(
                s.StartTime.ToString(@"HH\:mm"),
                s.EndTime.ToString(@"HH\:mm"),
                "TeacherSchedule"));
        }
        foreach (var r in teacherRequests)
        {
            // Avoid duplicates
            if (activeRequests.Any(cr => cr.Id == r.Id))
                continue;

            busySlots.Add(new ClassGroupBusySlot(
                r.NewStartTime.ToString(@"HH\:mm"),
                r.NewEndTime.ToString(@"HH\:mm"),
                "TeacherCompensationRequest"));
        }

        var orderedBusySlots = busySlots
            .OrderBy(slot => slot.StartTime)
            .ThenBy(slot => slot.EndTime)
            .ToList();

        // 4. Merge intervals to calculate free windows
        var mergedBusy = new List<(TimeOnly Start, TimeOnly End)>();
        var intervals = schedules.Select(s => (StartTime: s.StartTime, EndTime: s.EndTime))
            .Concat(activeRequests.Select(r => (StartTime: r.NewStartTime, EndTime: r.NewEndTime)))
            .Concat(teacherSchedules.Select(s => (StartTime: s.StartTime, EndTime: s.EndTime)))
            .Concat(teacherRequests.Select(r => (StartTime: r.NewStartTime, EndTime: r.NewEndTime)))
            .Select(i => (
                Start: i.StartTime < new TimeOnly(8, 0) ? new TimeOnly(8, 0) : i.StartTime,
                End: i.EndTime > new TimeOnly(22, 0) ? new TimeOnly(22, 0) : i.EndTime
            ))
            .Where(i => i.Start < i.End)
            .OrderBy(i => i.Start)
            .ToList();

        if (intervals.Count > 0)
        {
            var current = intervals[0];
            for (int i = 1; i < intervals.Count; i++)
            {
                var next = intervals[i];
                if (next.Start <= current.End)
                {
                    if (next.End > current.End)
                    {
                        current = (current.Start, next.End);
                    }
                }
                else
                {
                    mergedBusy.Add(current);
                    current = next;
                }
            }
            mergedBusy.Add(current);
        }

        // 5. Generate free windows from gaps (08:00 - 22:00)
        var freeWindows = new List<string>();
        var currentStart = new TimeOnly(8, 0);
        var dayEnd = new TimeOnly(22, 0);

        foreach (var busy in mergedBusy)
        {
            if (busy.Start > currentStart)
            {
                freeWindows.Add($"{currentStart:HH\\:mm}–{busy.Start:HH\\:mm}");
            }
            if (busy.End > currentStart)
            {
                currentStart = busy.End;
            }
        }

        if (currentStart < dayEnd)
        {
            freeWindows.Add($"{currentStart:HH\\:mm}–{dayEnd:HH\\:mm}");
        }

        return new ClassGroupDayResponse(orderedBusySlots, freeWindows);
    }
}
