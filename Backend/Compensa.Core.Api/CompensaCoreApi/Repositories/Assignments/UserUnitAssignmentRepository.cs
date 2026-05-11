using CompensaCoreApi.Data;
using CompensaCoreApi.Domain.Assignments;
using CompensaCoreApi.Domain.Courses;
using Microsoft.EntityFrameworkCore;

namespace CompensaCoreApi.Repositories.Assignments;

public sealed class UserUnitAssignmentRepository : IUserUnitAssignmentRepository
{
    private readonly CoreDbContext _context;

    public UserUnitAssignmentRepository(CoreDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyCollection<UserUnitAssignment>> ListByUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        return await _context.UserUnitAssignments
            .AsNoTracking()
            .Where(assignment => assignment.UserId == userId)
            .OrderBy(assignment => assignment.CourseId)
            .ThenBy(assignment => assignment.CurricularUnitId)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<CurricularUnit>> ListUnitsByIdsAsync(
        IReadOnlyCollection<Guid> unitIds,
        CancellationToken cancellationToken = default)
    {
        return await _context.CurricularUnits
            .Where(unit => unitIds.Contains(unit.Id))
            .ToArrayAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<CourseTeacherAssignment>> ListCoursesByUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        return await _context.CourseTeacherAssignments
            .AsNoTracking()
            .Where(assignment => assignment.UserId == userId)
            .OrderBy(assignment => assignment.CourseId)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<Course>> ListCoursesByIdsAsync(
        IReadOnlyCollection<Guid> courseIds,
        CancellationToken cancellationToken = default)
    {
        return await _context.Courses
            .Where(course => courseIds.Contains(course.Id))
            .ToArrayAsync(cancellationToken);
    }

    public async Task ReplaceUserAssignmentsAsync(
        string userId,
        IReadOnlyCollection<UserUnitAssignment> unitAssignments,
        IReadOnlyCollection<CourseTeacherAssignment> courseAssignments,
        CancellationToken cancellationToken = default)
    {
        var existingAssignments = await _context.UserUnitAssignments
            .Where(assignment => assignment.UserId == userId)
            .ToArrayAsync(cancellationToken);

        _context.UserUnitAssignments.RemoveRange(existingAssignments);
        _context.UserUnitAssignments.AddRange(unitAssignments);

        var existingCourseAssignments = await _context.CourseTeacherAssignments
            .Where(assignment => assignment.UserId == userId)
            .ToArrayAsync(cancellationToken);

        _context.CourseTeacherAssignments.RemoveRange(existingCourseAssignments);
        _context.CourseTeacherAssignments.AddRange(courseAssignments);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task EnsureUserUnitAssignmentAsync(
        string userId,
        string userEmail,
        CurricularUnit unit,
        bool isResponsible,
        CancellationToken cancellationToken = default)
    {
        var normalizedUserId = userId.Trim();
        var normalizedEmail = userEmail.Trim().ToLowerInvariant();
        var now = DateTimeOffset.UtcNow;

        var unitAssignment = await _context.UserUnitAssignments.FirstOrDefaultAsync(
            assignment => assignment.UserId == normalizedUserId && assignment.CurricularUnitId == unit.Id,
            cancellationToken);

        if (unitAssignment is null)
        {
            _context.UserUnitAssignments.Add(new UserUnitAssignment
            {
                UserId = normalizedUserId,
                UserEmail = normalizedEmail,
                CourseId = unit.CourseId,
                CurricularUnitId = unit.Id,
                IsResponsible = isResponsible,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
        else
        {
            unitAssignment.UserEmail = normalizedEmail;
            unitAssignment.IsResponsible = unitAssignment.IsResponsible || isResponsible;
            unitAssignment.UpdatedAt = now;
        }

        var courseAssignment = await _context.CourseTeacherAssignments.FirstOrDefaultAsync(
            assignment => assignment.UserId == normalizedUserId && assignment.CourseId == unit.CourseId,
            cancellationToken);

        if (courseAssignment is null)
        {
            _context.CourseTeacherAssignments.Add(new CourseTeacherAssignment
            {
                UserId = normalizedUserId,
                UserEmail = normalizedEmail,
                CourseId = unit.CourseId,
                IsCoordinator = false,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
        else
        {
            courseAssignment.UserEmail = normalizedEmail;
            courseAssignment.UpdatedAt = now;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
