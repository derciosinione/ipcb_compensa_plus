using CompensaCoreApi.Data;
using CompensaCoreApi.Domain.Assignments;
using CompensaCoreApi.Domain.Courses;
using Microsoft.EntityFrameworkCore;

namespace CompensaCoreApi.Repositories.Courses;

public sealed class CourseRepository : ICourseRepository
{
    private readonly CoreDbContext _context;

    public CourseRepository(CoreDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyCollection<Course>> ListAsync(
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Courses.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var trimmedSearch = search.Trim();
            var searchPattern = $"%{trimmedSearch}%";
            var matchingTypes = Enum.GetValues<CourseDegreeType>()
                .Where(type => type.ToString().Contains(trimmedSearch, StringComparison.OrdinalIgnoreCase))
                .ToArray();

            query = query.Where(course =>
                EF.Functions.ILike(course.Name, searchPattern) ||
                EF.Functions.ILike(course.Abbreviation, searchPattern) ||
                matchingTypes.Contains(course.Type));
        }

        return await query
            .OrderBy(course => course.Name)
            .ToArrayAsync(cancellationToken);
    }

    public Task<Course?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.Courses.FirstOrDefaultAsync(course => course.Id == id, cancellationToken);
    }

    public Task<Course?> GetByAbbreviationAsync(string abbreviation, CancellationToken cancellationToken = default)
    {
        var normalizedAbbreviation = abbreviation.Trim().ToLower();
        return _context.Courses.FirstOrDefaultAsync(
            course => course.Abbreviation.ToLower() == normalizedAbbreviation,
            cancellationToken);
    }

    public async Task<IReadOnlyCollection<CurricularUnit>> ListUnitsAsync(
        Guid courseId,
        CancellationToken cancellationToken = default)
    {
        return await _context.CurricularUnits
            .AsNoTracking()
            .Where(unit => unit.CourseId == courseId)
            .OrderBy(unit => unit.Year)
            .ThenBy(unit => unit.Semester)
            .ThenBy(unit => unit.Name)
            .ToArrayAsync(cancellationToken);
    }

    public Task<CurricularUnit?> GetUnitByIdAsync(
        Guid courseId,
        Guid unitId,
        CancellationToken cancellationToken = default)
    {
        return _context.CurricularUnits.FirstOrDefaultAsync(
            unit => unit.CourseId == courseId && unit.Id == unitId,
            cancellationToken);
    }

    public async Task<IReadOnlyCollection<ClassGroup>> ListClassGroupsAsync(
        Guid courseId,
        CancellationToken cancellationToken = default)
    {
        return await _context.ClassGroups
            .AsNoTracking()
            .Where(group => group.CourseId == courseId)
            .OrderBy(group => group.Name)
            .ToArrayAsync(cancellationToken);
    }

    public Task<ClassGroup?> GetClassGroupByIdAsync(
        Guid courseId,
        Guid classGroupId,
        CancellationToken cancellationToken = default)
    {
        return _context.ClassGroups.FirstOrDefaultAsync(
            group => group.CourseId == courseId && group.Id == classGroupId,
            cancellationToken);
    }

    public async Task<IReadOnlyCollection<ClassSchedule>> ListClassSchedulesAsync(
        Guid courseId,
        CancellationToken cancellationToken = default)
    {
        return await _context.ClassSchedules
            .AsNoTracking()
            .Where(schedule => schedule.CourseId == courseId)
            .OrderBy(schedule => schedule.DayOfWeek)
            .ThenBy(schedule => schedule.StartTime)
            .ToArrayAsync(cancellationToken);
    }

    public Task<ClassSchedule?> GetClassScheduleByIdAsync(
        Guid scheduleId,
        CancellationToken cancellationToken = default)
    {
        return _context.ClassSchedules.FirstOrDefaultAsync(
            schedule => schedule.Id == scheduleId,
            cancellationToken);
    }

    public Task<ClassSchedule?> GetClassScheduleByIdAsync(
        Guid courseId,
        Guid classGroupId,
        Guid scheduleId,
        CancellationToken cancellationToken = default)
    {
        return _context.ClassSchedules.FirstOrDefaultAsync(
            schedule =>
                schedule.CourseId == courseId &&
                schedule.ClassGroupId == classGroupId &&
                schedule.Id == scheduleId,
            cancellationToken);
    }

    public async Task<IReadOnlyCollection<(ClassSchedule Schedule, ClassGroup ClassGroup)>> ListOverlappingSchedulesAsync(
        Guid academicYearId,
        int semester,
        int dayOfWeek,
        TimeOnly startTime,
        TimeOnly endTime,
        Guid? excludedScheduleId,
        CancellationToken cancellationToken = default)
    {
        var query =
            from schedule in _context.ClassSchedules.AsNoTracking()
            join classGroup in _context.ClassGroups.AsNoTracking()
                on schedule.ClassGroupId equals classGroup.Id
            where schedule.IsActive &&
                  classGroup.IsActive &&
                  schedule.AcademicYearId == academicYearId &&
                  schedule.Semester == semester &&
                  schedule.DayOfWeek == dayOfWeek &&
                  schedule.StartTime < endTime &&
                  startTime < schedule.EndTime
            select new { Schedule = schedule, ClassGroup = classGroup };

        if (excludedScheduleId.HasValue)
        {
            query = query.Where(item => item.Schedule.Id != excludedScheduleId.Value);
        }

        var results = await query.ToArrayAsync(cancellationToken);
        return results.Select(item => (item.Schedule, item.ClassGroup)).ToArray();
    }

    public async Task<IReadOnlyCollection<CurricularUnitComponent>> ListComponentsAsync(
        Guid courseId,
        CancellationToken cancellationToken = default)
    {
        return await _context.CurricularUnitComponents
            .AsNoTracking()
            .Where(component => component.CourseId == courseId)
            .OrderBy(component => component.CurricularUnitId)
            .ThenBy(component => component.Type)
            .ThenBy(component => component.Name)
            .ToArrayAsync(cancellationToken);
    }

    public Task<CurricularUnitComponent?> GetComponentByIdAsync(
        Guid courseId,
        Guid unitId,
        Guid componentId,
        CancellationToken cancellationToken = default)
    {
        return _context.CurricularUnitComponents.FirstOrDefaultAsync(
            component =>
                component.CourseId == courseId &&
                component.CurricularUnitId == unitId &&
                component.Id == componentId,
            cancellationToken);
    }

    public async Task<IReadOnlyCollection<UserUnitAssignment>> ListUnitAssignmentsAsync(
        Guid courseId,
        CancellationToken cancellationToken = default)
    {
        return await _context.UserUnitAssignments
            .AsNoTracking()
            .Where(assignment => assignment.CourseId == courseId)
            .OrderBy(assignment => assignment.CurricularUnitId)
            .ThenBy(assignment => assignment.UserEmail)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<CourseTeacherAssignment>> ListCourseAssignmentsAsync(
        Guid courseId,
        CancellationToken cancellationToken = default)
    {
        return await _context.CourseTeacherAssignments
            .AsNoTracking()
            .Where(assignment => assignment.CourseId == courseId)
            .OrderBy(assignment => assignment.UserEmail)
            .ToArrayAsync(cancellationToken);
    }

    public async Task AddAsync(Course course, CancellationToken cancellationToken = default)
    {
        _context.Courses.Add(course);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task AddUnitAsync(CurricularUnit unit, CancellationToken cancellationToken = default)
    {
        _context.CurricularUnits.Add(unit);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task AddComponentAsync(CurricularUnitComponent component, CancellationToken cancellationToken = default)
    {
        _context.CurricularUnitComponents.Add(component);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task AddClassGroupAsync(ClassGroup classGroup, CancellationToken cancellationToken = default)
    {
        _context.ClassGroups.Add(classGroup);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task AddClassScheduleAsync(ClassSchedule schedule, CancellationToken cancellationToken = default)
    {
        _context.ClassSchedules.Add(schedule);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Course course, CancellationToken cancellationToken = default)
    {
        _context.Courses.Remove(course);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteUnitAsync(CurricularUnit unit, CancellationToken cancellationToken = default)
    {
        _context.CurricularUnits.Remove(unit);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteComponentAsync(CurricularUnitComponent component, CancellationToken cancellationToken = default)
    {
        _context.CurricularUnitComponents.Remove(component);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteClassGroupAsync(ClassGroup classGroup, CancellationToken cancellationToken = default)
    {
        _context.ClassGroups.Remove(classGroup);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteClassScheduleAsync(ClassSchedule schedule, CancellationToken cancellationToken = default)
    {
        _context.ClassSchedules.Remove(schedule);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
