using CompensaCoreApi.Dtos.Schedules;

namespace CompensaCoreApi.Services.Schedules;

public interface IScheduleAvailabilityService
{
    Task<ScheduleAvailabilityResponse> CheckAsync(
        ScheduleAvailabilityQuery query,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns the availability status of every active classroom for the given time slot.
    /// </summary>
    Task<IReadOnlyCollection<ClassroomAvailabilityItem>> CheckRoomsAvailabilityAsync(
        RoomsAvailabilityQuery query,
        CancellationToken cancellationToken = default);

    Task<ClassGroupDayResponse> CheckClassGroupDayAsync(
        ClassGroupDayQuery query,
        CancellationToken cancellationToken = default);
}
