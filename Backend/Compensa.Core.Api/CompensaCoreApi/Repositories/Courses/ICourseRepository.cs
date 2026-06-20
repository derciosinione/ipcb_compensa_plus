using CompensaCoreApi.Domain.Courses;
using CompensaCoreApi.Domain.Assignments;

namespace CompensaCoreApi.Repositories.Courses;

public interface ICourseRepository
{
    Task<IReadOnlyCollection<Course>> ListAsync(string? search, CancellationToken cancellationToken = default);
    Task<Course?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<Course>> ListCoordinatedByAsync(string coordinatorUserId, CancellationToken cancellationToken = default);
    Task<Course?> GetByAbbreviationAsync(string abbreviation, CancellationToken cancellationToken = default);
    
    Task<CourseOffering?> GetOfferingAsync(Guid courseId, Guid academicYearId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<CourseOffering>> ListOfferingsAsync(Guid academicYearId, CancellationToken cancellationToken = default);
    
    Task<IReadOnlyCollection<CurricularUnit>> ListUnitsAsync(Guid courseId, CancellationToken cancellationToken = default);
    Task<CurricularUnit?> GetUnitByIdAsync(Guid courseId, Guid unitId, CancellationToken cancellationToken = default);
    
    Task<CurricularUnitOffering?> GetUnitOfferingAsync(Guid unitId, Guid academicYearId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<CurricularUnitOffering>> ListUnitOfferingsAsync(Guid academicYearId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<CurricularUnitOffering>> ListUnitOfferingsAsync(IReadOnlyCollection<Guid> unitIds, Guid academicYearId, CancellationToken cancellationToken = default);
    
    Task<IReadOnlyCollection<CurricularUnitComponent>> ListComponentsAsync(Guid courseId, CancellationToken cancellationToken = default);
    Task<CurricularUnitComponent?> GetComponentByIdAsync(Guid courseId, Guid unitId, Guid componentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<UserUnitAssignment>> ListUnitAssignmentsAsync(Guid courseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<CourseTeacherAssignment>> ListCourseAssignmentsAsync(Guid courseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<CourseTeacherAssignment>> ListAllCourseAssignmentsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ClassGroup>> ListClassGroupsAsync(Guid courseId, Guid academicYearId, CancellationToken cancellationToken = default);
    Task<ClassGroup?> GetClassGroupByIdAsync(Guid courseId, Guid classGroupId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ClassSchedule>> ListClassSchedulesAsync(Guid courseId, Guid academicYearId, CancellationToken cancellationToken = default);
    Task<ClassSchedule?> GetClassScheduleByIdAsync(Guid scheduleId, CancellationToken cancellationToken = default);
    Task<ClassSchedule?> GetClassScheduleByIdAsync(Guid courseId, Guid classGroupId, Guid scheduleId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<(ClassSchedule Schedule, ClassGroup ClassGroup)>> ListOverlappingSchedulesAsync(
        Guid academicYearId,
        int semester,
        int dayOfWeek,
        TimeOnly startTime,
        TimeOnly endTime,
        Guid? excludedScheduleId,
        CancellationToken cancellationToken = default);

    /// <summary>All fixed schedules for the given class groups on the specified day of week (no time filter).</summary>
    Task<IReadOnlyCollection<ClassSchedule>> ListClassGroupSchedulesForDayAsync(
        IReadOnlyCollection<Guid> classGroupIds,
        int dayOfWeek,
        Guid academicYearId,
        int semester,
        Guid? excludedScheduleId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<ClassSchedule>> ListTeacherSchedulesForDayAsync(
        string teacherUserId,
        int dayOfWeek,
        Guid academicYearId,
        int semester,
        Guid? excludedScheduleId,
        CancellationToken cancellationToken = default);
    Task AddAsync(Course course, CancellationToken cancellationToken = default);
    Task AddUnitAsync(CurricularUnit unit, CancellationToken cancellationToken = default);
    Task AddComponentAsync(CurricularUnitComponent component, CancellationToken cancellationToken = default);
    Task AddClassGroupAsync(ClassGroup classGroup, CancellationToken cancellationToken = default);
    Task AddClassScheduleAsync(ClassSchedule schedule, CancellationToken cancellationToken = default);
    
    Task AddOfferingAsync(CourseOffering offering, CancellationToken cancellationToken = default);
    Task AddUnitOfferingAsync(CurricularUnitOffering offering, CancellationToken cancellationToken = default);
    
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
    Task DeleteAsync(Course course, CancellationToken cancellationToken = default);
    Task DeleteUnitAsync(CurricularUnit unit, CancellationToken cancellationToken = default);
    Task DeleteComponentAsync(CurricularUnitComponent component, CancellationToken cancellationToken = default);
    Task DeleteClassGroupAsync(ClassGroup classGroup, CancellationToken cancellationToken = default);
    Task DeleteClassScheduleAsync(ClassSchedule schedule, CancellationToken cancellationToken = default);
}
