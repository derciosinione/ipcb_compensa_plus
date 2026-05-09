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

    public async Task ReplaceUserAssignmentsAsync(
        string userId,
        IReadOnlyCollection<UserUnitAssignment> assignments,
        CancellationToken cancellationToken = default)
    {
        var existingAssignments = await _context.UserUnitAssignments
            .Where(assignment => assignment.UserId == userId)
            .ToArrayAsync(cancellationToken);

        _context.UserUnitAssignments.RemoveRange(existingAssignments);
        _context.UserUnitAssignments.AddRange(assignments);

        var existingCourseAssignments = await _context.CourseTeacherAssignments
            .Where(assignment => assignment.UserId == userId)
            .ToArrayAsync(cancellationToken);

        _context.CourseTeacherAssignments.RemoveRange(existingCourseAssignments);

        var now = DateTimeOffset.UtcNow;
        var courseAssignments = assignments
            .GroupBy(assignment => assignment.CourseId)
            .Select(group => new CourseTeacherAssignment
            {
                UserId = userId,
                UserEmail = group.First().UserEmail,
                CourseId = group.Key,
                IsCoordinator = false,
                CreatedAt = now,
                UpdatedAt = now
            });

        _context.CourseTeacherAssignments.AddRange(courseAssignments);

        await _context.SaveChangesAsync(cancellationToken);
    }
}
