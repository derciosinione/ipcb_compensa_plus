namespace CompensaCoreApi.Services.Schedules;

public static class ScheduleConflictRule
{
    public static bool Overlaps(
        TimeOnly existingStart,
        TimeOnly existingEnd,
        TimeOnly candidateStart,
        TimeOnly candidateEnd)
    {
        ValidateRange(existingStart, existingEnd);
        ValidateRange(candidateStart, candidateEnd);

        return existingStart < candidateEnd && candidateStart < existingEnd;
    }

    public static void ValidateRange(TimeOnly startTime, TimeOnly endTime)
    {
        if (startTime >= endTime)
            throw new InvalidOperationException("Schedule start time must be before end time.");
    }
}
