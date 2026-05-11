using CompensaCoreApi.Domain.Courses;
using CompensaCoreApi.Domain.Assignments;

namespace CompensaCoreApi.Repositories.Courses;

public interface ICourseRepository
{
    Task<IReadOnlyCollection<Course>> ListAsync(string? search, CancellationToken cancellationToken = default);
    Task<Course?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Course?> GetByAbbreviationAsync(string abbreviation, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<CurricularUnit>> ListUnitsAsync(Guid courseId, CancellationToken cancellationToken = default);
    Task<CurricularUnit?> GetUnitByIdAsync(Guid courseId, Guid unitId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<CurricularUnitComponent>> ListComponentsAsync(Guid courseId, CancellationToken cancellationToken = default);
    Task<CurricularUnitComponent?> GetComponentByIdAsync(Guid courseId, Guid unitId, Guid componentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<UserUnitAssignment>> ListUnitAssignmentsAsync(Guid courseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ClassGroup>> ListClassGroupsAsync(Guid courseId, CancellationToken cancellationToken = default);
    Task<ClassGroup?> GetClassGroupByIdAsync(Guid courseId, Guid classGroupId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ClassSchedule>> ListClassSchedulesAsync(Guid courseId, CancellationToken cancellationToken = default);
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
    Task AddAsync(Course course, CancellationToken cancellationToken = default);
    Task AddUnitAsync(CurricularUnit unit, CancellationToken cancellationToken = default);
    Task AddComponentAsync(CurricularUnitComponent component, CancellationToken cancellationToken = default);
    Task AddClassGroupAsync(ClassGroup classGroup, CancellationToken cancellationToken = default);
    Task AddClassScheduleAsync(ClassSchedule schedule, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
    Task DeleteAsync(Course course, CancellationToken cancellationToken = default);
    Task DeleteUnitAsync(CurricularUnit unit, CancellationToken cancellationToken = default);
    Task DeleteComponentAsync(CurricularUnitComponent component, CancellationToken cancellationToken = default);
    Task DeleteClassGroupAsync(ClassGroup classGroup, CancellationToken cancellationToken = default);
    Task DeleteClassScheduleAsync(ClassSchedule schedule, CancellationToken cancellationToken = default);
}
