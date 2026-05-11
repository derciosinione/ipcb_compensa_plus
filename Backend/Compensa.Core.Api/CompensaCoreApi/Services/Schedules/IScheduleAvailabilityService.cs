using CompensaCoreApi.Dtos.Schedules;

namespace CompensaCoreApi.Services.Schedules;

public interface IScheduleAvailabilityService
{
    Task<ScheduleAvailabilityResponse> CheckAsync(
        ScheduleAvailabilityQuery query,
        CancellationToken cancellationToken = default);
}
