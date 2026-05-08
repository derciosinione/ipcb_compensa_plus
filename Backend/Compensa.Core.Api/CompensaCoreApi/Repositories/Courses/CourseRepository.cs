using CompensaCoreApi.Data;
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

    public async Task AddAsync(Course course, CancellationToken cancellationToken = default)
    {
        _context.Courses.Add(course);
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
}
