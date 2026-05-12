using CompensaCoreApi.Services.Schedules;

namespace CompensaCoreApi.Tests;

public sealed class ScheduleConflictRuleTests
{
    [Fact]
    public void Overlaps_ReturnsTrue_WhenIntervalsIntersect()
    {
        var overlaps = ScheduleConflictRule.Overlaps(
            TimeOnly.Parse("09:00"),
            TimeOnly.Parse("11:00"),
            TimeOnly.Parse("10:30"),
            TimeOnly.Parse("12:00"));

        Assert.True(overlaps);
    }

    [Fact]
    public void Overlaps_ReturnsFalse_WhenCandidateStartsAtExistingEnd()
    {
        var overlaps = ScheduleConflictRule.Overlaps(
            TimeOnly.Parse("09:00"),
            TimeOnly.Parse("11:00"),
            TimeOnly.Parse("11:00"),
            TimeOnly.Parse("12:00"));

        Assert.False(overlaps);
    }

    [Fact]
    public void ValidateRange_Throws_WhenStartIsAfterEnd()
    {
        var exception = Assert.Throws<InvalidOperationException>(() =>
            ScheduleConflictRule.ValidateRange(TimeOnly.Parse("12:00"), TimeOnly.Parse("11:00")));

        Assert.Equal("Schedule start time must be before end time.", exception.Message);
    }
}
