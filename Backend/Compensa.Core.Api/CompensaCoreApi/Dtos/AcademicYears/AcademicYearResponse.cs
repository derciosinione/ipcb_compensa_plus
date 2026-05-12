namespace CompensaCoreApi.Dtos.AcademicYears;

public sealed record AcademicYearResponse(
    Guid Id,
    string Name,
    DateOnly StartsOn,
    DateOnly EndsOn,
    bool IsActive);
