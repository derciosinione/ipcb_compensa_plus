using CompensaCoreApi.Dtos.Assignments;

namespace CompensaCoreApi.Services.Assignments;

public interface IUserUnitAssignmentService
{
    Task<UserAcademicAssignmentsResponse> ListByUserAsync(string userId, CancellationToken cancellationToken = default);
    Task<UserAcademicAssignmentsResponse> SaveAsync(string userId, SaveUserUnitAssignmentsRequest request, CancellationToken cancellationToken = default);
}
