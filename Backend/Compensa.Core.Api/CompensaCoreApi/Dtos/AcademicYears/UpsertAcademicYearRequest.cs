namespace CompensaCoreApi.Dtos.AcademicYears;

public sealed record UpsertAcademicYearRequest(
    string Name,
    DateOnly StartsOn,
    DateOnly EndsOn,
    bool IsActive);
