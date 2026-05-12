using CompensaCoreApi.Domain.CompensationRequests;
using CompensaCoreApi.Dtos.CompensationRequests;
using CompensaCoreApi.Exceptions;
using CompensaCoreApi.Repositories.CompensationRequests;
using CompensaCoreApi.Services.CompensationRequests;

namespace CompensaCoreApi.Tests;

public sealed class CompensationRequestAuthorizationTests
{
    [Fact]
    public async Task ListAsync_ForTeacher_IgnoresRequestedTeacherFilter()
    {
        var repository = new CapturingCompensationRequestRepository([]);
        var service = CreateService(repository);

        await service.ListAsync(
            status: null,
            teacherUserId: "other-teacher",
            actorUserId: "current-teacher",
            isCoordinator: false,
            isAdmin: false);

        Assert.Equal("current-teacher", repository.LastTeacherUserId);
    }

    [Fact]
    public async Task GetByIdAsync_ForTeacher_ThrowsForbidden_WhenRequestBelongsToAnotherTeacher()
    {
        var request = CreateRequest("owner-teacher");
        var service = CreateService(new CapturingCompensationRequestRepository([request]));

        var exception = await Assert.ThrowsAsync<ForbiddenException>(() =>
            service.GetByIdAsync(
                request.Id,
                actorUserId: "other-teacher",
                isCoordinator: false,
                isAdmin: false));

        Assert.Equal("You don't have permission to view this request.", exception.Message);
    }

    [Fact]
    public async Task GetByIdAsync_ForCoordinator_AllowsReadingAnotherTeachersRequest()
    {
        var request = CreateRequest("owner-teacher");
        var service = CreateService(new CapturingCompensationRequestRepository([request]));

        var response = await service.GetByIdAsync(
            request.Id,
            actorUserId: "coordinator",
            isCoordinator: true,
            isAdmin: false);

        Assert.Equal(request.Id, response.Id);
        Assert.Equal("owner-teacher", response.TeacherUserId);
    }

    private static CompensationRequestService CreateService(ICompensationRequestRepository repository)
    {
        return new CompensationRequestService(
            repository,
            courseRepository: null!,
            classroomRepository: null!,
            academicYearRepository: null!,
            assignmentRepository: null!,
            publishEndpoint: null!,
            auditService: null!,
            cache: null!);
    }

    private static CompensationRequest CreateRequest(string teacherUserId)
    {
        return new CompensationRequest
        {
            Id = Guid.NewGuid(),
            TeacherUserId = teacherUserId,
            TeacherName = "Teacher",
            Course = "Course",
            CurricularUnit = "Unit",
            YearGroups = ["Year 1"],
            ComponentType = TeachingComponentType.Practical,
            OriginalDate = new DateOnly(2026, 5, 12),
            OriginalStartTime = new TimeOnly(9, 0),
            OriginalEndTime = new TimeOnly(11, 0),
            OriginalRoom = "A1",
            NewDate = new DateOnly(2026, 5, 13),
            NewStartTime = new TimeOnly(14, 0),
            NewEndTime = new TimeOnly(16, 0),
            NewRoom = "B1",
            Justification = "Conference",
            Status = CompensationRequestStatus.Pending
        };
    }

    private sealed class CapturingCompensationRequestRepository : ICompensationRequestRepository
    {
        private readonly List<CompensationRequest> _requests;

        public CapturingCompensationRequestRepository(IEnumerable<CompensationRequest> requests)
        {
            _requests = requests.ToList();
        }

        public string? LastTeacherUserId { get; private set; }

        public Task<IReadOnlyCollection<CompensationRequest>> ListAsync(
            CompensationRequestStatus? status,
            string? teacherUserId,
            CancellationToken cancellationToken = default)
        {
            LastTeacherUserId = teacherUserId;
            IReadOnlyCollection<CompensationRequest> result = _requests
                .Where(request => teacherUserId is null || request.TeacherUserId == teacherUserId)
                .ToArray();
            return Task.FromResult(result);
        }

        public Task<CompensationRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(_requests.FirstOrDefault(request => request.Id == id));
        }

        public Task<IReadOnlyCollection<CompensationRequest>> ListOverlappingActiveAsync(
            Guid academicYearId,
            int semester,
            DateOnly date,
            TimeOnly startTime,
            TimeOnly endTime,
            Guid? excludedRequestId,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyCollection<CompensationRequest>>([]);
        }

        public Task AddAsync(CompensationRequest request, CancellationToken cancellationToken = default)
        {
            _requests.Add(request);
            return Task.CompletedTask;
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }
    }
}
