using CompensaCoreApi.Domain.CompensationRequests;
using CompensaCoreApi.Domain.Assignments;
using CompensaCoreApi.Domain.Courses;
using CompensaCoreApi.Dtos.CompensationRequests;
using CompensaCoreApi.Exceptions;
using CompensaCoreApi.Repositories.Assignments;
using CompensaCoreApi.Repositories.CompensationRequests;
using CompensaCoreApi.Repositories.Courses;
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
        var request = CreateRequest("owner-teacher", Guid.NewGuid());
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
    public async Task ListAsync_ForCoordinator_ReturnsOnlyRequestsForRelatedCourses()
    {
        var relatedCourseId = Guid.NewGuid();
        var unrelatedCourseId = Guid.NewGuid();
        var repository = new CapturingCompensationRequestRepository(
        [
            CreateRequest("owner-teacher", relatedCourseId),
            CreateRequest("other-teacher", unrelatedCourseId)
        ]);
        var service = CreateService(
            repository,
            courses: [new Course { Id = relatedCourseId }, new Course { Id = unrelatedCourseId }],
            courseAssignments: [new CourseTeacherAssignment { UserId = "coordinator", CourseId = relatedCourseId, IsCoordinator = true }]);

        var response = await service.ListAsync(
            status: null,
            teacherUserId: null,
            actorUserId: "coordinator",
            isCoordinator: true,
            isAdmin: false);

        var request = Assert.Single(response);
        Assert.Equal(relatedCourseId, request.CourseId);
    }

    [Fact]
    public async Task GetByIdAsync_ForCoordinator_ThrowsForbidden_WhenRequestCourseIsUnrelated()
    {
        var request = CreateRequest("owner-teacher", Guid.NewGuid());
        var service = CreateService(
            new CapturingCompensationRequestRepository([request]),
            courses: [new Course { Id = request.CourseId!.Value }]);

        var exception = await Assert.ThrowsAsync<ForbiddenException>(() =>
            service.GetByIdAsync(
                request.Id,
                actorUserId: "coordinator",
                isCoordinator: true,
                isAdmin: false));

        Assert.Equal("You don't have permission to view this request.", exception.Message);
    }

    [Fact]
    public async Task GetByIdAsync_ForCoordinator_AllowsReadingRelatedCourseRequest()
    {
        var courseId = Guid.NewGuid();
        var request = CreateRequest("owner-teacher", courseId);
        var service = CreateService(
            new CapturingCompensationRequestRepository([request]),
            courses: [new Course { Id = courseId }],
            courseAssignments: [new CourseTeacherAssignment { UserId = "coordinator", CourseId = courseId, IsCoordinator = true }]);

        var response = await service.GetByIdAsync(
            request.Id,
            actorUserId: "coordinator",
            isCoordinator: true,
            isAdmin: false);

        Assert.Equal(request.Id, response.Id);
        Assert.Equal("owner-teacher", response.TeacherUserId);
    }

    private static CompensationRequestService CreateService(
        ICompensationRequestRepository repository,
        IEnumerable<Course>? courses = null,
        IEnumerable<CourseTeacherAssignment>? courseAssignments = null)
    {
        return new CompensationRequestService(
            repository,
            courseRepository: new FakeCourseRepository(courses ?? []),
            classroomRepository: null!,
            academicYearRepository: null!,
            assignmentRepository: new FakeAssignmentRepository(courseAssignments ?? []),
            publishEndpoint: null!,
            auditService: null!,
            cache: null!,
            documentStorageService: null!);
    }

    private static CompensationRequest CreateRequest(string teacherUserId, Guid? courseId = null)
    {
        return new CompensationRequest
        {
            Id = Guid.NewGuid(),
            TeacherUserId = teacherUserId,
            TeacherName = "Teacher",
            CourseId = courseId,
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

        public Task<CompensationRequest?> GetByIdAsync(Guid id, bool includeDocuments = false, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(_requests.FirstOrDefault(request => request.Id == id));
        }

        public Task DeleteAsync(CompensationRequest request, CancellationToken cancellationToken = default)
        {
            _requests.Remove(request);
            return Task.CompletedTask;
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

        public Task<IReadOnlyCollection<CompensationRequest>> ListActiveForClassGroupsOnDateAsync(
            IReadOnlyCollection<Guid> classGroupIds,
            DateOnly date,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyCollection<CompensationRequest>>([]);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }
    }

    private sealed class FakeCourseRepository : ICourseRepository
    {
        private readonly List<Course> _courses;

        public FakeCourseRepository(IEnumerable<Course> courses)
        {
            _courses = courses.ToList();
        }

        public Task<Course?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(_courses.FirstOrDefault(course => course.Id == id));
        }

        public Task<IReadOnlyCollection<Course>> ListCoordinatedByAsync(string coordinatorUserId, CancellationToken cancellationToken = default)
        {
            // This is complex for a fake if we need offerings. 
            // For now, let's return empty or implement a simple check if the tests allow.
            return Task.FromResult<IReadOnlyCollection<Course>>([]);
        }

        public Task<CourseOffering?> GetOfferingAsync(Guid courseId, Guid academicYearId, CancellationToken cancellationToken = default) => Task.FromResult<CourseOffering?>(null);
        public Task<IReadOnlyCollection<CourseOffering>> ListOfferingsAsync(Guid academicYearId, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyCollection<CourseOffering>>([]);
        public Task<CurricularUnitOffering?> GetUnitOfferingAsync(Guid unitId, Guid academicYearId, CancellationToken cancellationToken = default) => Task.FromResult<CurricularUnitOffering?>(null);
        public Task<IReadOnlyCollection<CurricularUnitOffering>> ListUnitOfferingsAsync(Guid academicYearId, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyCollection<CurricularUnitOffering>>([]);
        public Task<IReadOnlyCollection<CurricularUnitOffering>> ListUnitOfferingsAsync(IReadOnlyCollection<Guid> unitIds, Guid academicYearId, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyCollection<CurricularUnitOffering>>([]);
        public Task AddOfferingAsync(CourseOffering offering, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task AddUnitOfferingAsync(CurricularUnitOffering offering, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task<IReadOnlyCollection<CourseTeacherAssignment>> ListCourseAssignmentsAsync(Guid courseId, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyCollection<CourseTeacherAssignment>>([]);

        public Task<IReadOnlyCollection<Course>> ListAsync(string? search, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<Course?> GetByAbbreviationAsync(string abbreviation, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<IReadOnlyCollection<CurricularUnit>> ListUnitsAsync(Guid courseId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<CurricularUnit?> GetUnitByIdAsync(Guid courseId, Guid unitId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<IReadOnlyCollection<CurricularUnitComponent>> ListComponentsAsync(Guid courseId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<CurricularUnitComponent?> GetComponentByIdAsync(Guid courseId, Guid unitId, Guid componentId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<IReadOnlyCollection<UserUnitAssignment>> ListUnitAssignmentsAsync(Guid courseId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<IReadOnlyCollection<ClassGroup>> ListClassGroupsAsync(Guid courseId, Guid academicYearId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<ClassGroup?> GetClassGroupByIdAsync(Guid courseId, Guid classGroupId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<IReadOnlyCollection<ClassSchedule>> ListClassSchedulesAsync(Guid courseId, Guid academicYearId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<ClassSchedule?> GetClassScheduleByIdAsync(Guid scheduleId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<ClassSchedule?> GetClassScheduleByIdAsync(Guid courseId, Guid classGroupId, Guid scheduleId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<IReadOnlyCollection<(ClassSchedule Schedule, ClassGroup ClassGroup)>> ListOverlappingSchedulesAsync(Guid academicYearId, int semester, int dayOfWeek, TimeOnly startTime, TimeOnly endTime, Guid? excludedScheduleId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<IReadOnlyCollection<ClassSchedule>> ListClassGroupSchedulesForDayAsync(IReadOnlyCollection<Guid> classGroupIds, int dayOfWeek, Guid academicYearId, int semester, Guid? excludedScheduleId, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyCollection<ClassSchedule>>([]);
        public Task AddAsync(Course course, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task AddUnitAsync(CurricularUnit unit, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task AddComponentAsync(CurricularUnitComponent component, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task AddClassGroupAsync(ClassGroup classGroup, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task AddClassScheduleAsync(ClassSchedule schedule, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task SaveChangesAsync(CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task DeleteAsync(Course course, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task DeleteUnitAsync(CurricularUnit unit, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task DeleteComponentAsync(CurricularUnitComponent component, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task DeleteClassGroupAsync(ClassGroup classGroup, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task DeleteClassScheduleAsync(ClassSchedule schedule, CancellationToken cancellationToken = default) => throw new NotSupportedException();
    }

    private sealed class FakeAssignmentRepository : IUserUnitAssignmentRepository
    {
        private readonly List<CourseTeacherAssignment> _courseAssignments;

        public FakeAssignmentRepository(IEnumerable<CourseTeacherAssignment> courseAssignments)
        {
            _courseAssignments = courseAssignments.ToList();
        }

        public Task<IReadOnlyCollection<CourseTeacherAssignment>> ListCoursesByUserAsync(string userId, string userEmail = "", CancellationToken cancellationToken = default)
        {
            IReadOnlyCollection<CourseTeacherAssignment> assignments = _courseAssignments
                .Where(assignment => assignment.UserId == userId)
                .ToArray();
            return Task.FromResult(assignments);
        }

        public Task<IReadOnlyCollection<UserUnitAssignment>> ListByUserAsync(string userId, string userEmail = "", CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyCollection<UserUnitAssignment>>([]);
        }
        public Task<IReadOnlyCollection<Course>> ListCoursesByIdsAsync(IReadOnlyCollection<Guid> courseIds, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<IReadOnlyCollection<CurricularUnit>> ListUnitsByIdsAsync(IReadOnlyCollection<Guid> unitIds, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task ReplaceUserAssignmentsAsync(string userId, IReadOnlyCollection<UserUnitAssignment> unitAssignments, IReadOnlyCollection<CourseTeacherAssignment> courseAssignments, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task EnsureUserUnitAssignmentAsync(string userId, string userEmail, CurricularUnit unit, bool isResponsible, CancellationToken cancellationToken = default) => throw new NotSupportedException();
    }
}
