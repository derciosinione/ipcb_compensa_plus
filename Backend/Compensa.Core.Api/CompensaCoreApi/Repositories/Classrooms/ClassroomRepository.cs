using CompensaCoreApi.Data;
using CompensaCoreApi.Domain.Classrooms;
using Microsoft.EntityFrameworkCore;

namespace CompensaCoreApi.Repositories.Classrooms;

public sealed class ClassroomRepository : IClassroomRepository
{
    private readonly CoreDbContext _context;

    public ClassroomRepository(CoreDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyCollection<Classroom>> ListAsync(
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Classrooms.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var trimmedSearch = search.Trim();
            var searchPattern = $"%{trimmedSearch}%";
            var matchingTypes = Enum.GetValues<ClassroomType>()
                .Where(type => type.ToString().Contains(trimmedSearch, StringComparison.OrdinalIgnoreCase))
                .ToArray();

            query = query.Where(classroom =>
                EF.Functions.ILike(classroom.Name, searchPattern) ||
                matchingTypes.Contains(classroom.Type));
        }

        return await query
            .OrderBy(classroom => classroom.Name)
            .ToArrayAsync(cancellationToken);
    }

    public Task<Classroom?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.Classrooms.FirstOrDefaultAsync(classroom => classroom.Id == id, cancellationToken);
    }

    public Task<Classroom?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        var normalizedName = name.Trim().ToLower();
        return _context.Classrooms.FirstOrDefaultAsync(
            classroom => classroom.Name.ToLower() == normalizedName,
            cancellationToken);
    }

    public async Task AddAsync(Classroom classroom, CancellationToken cancellationToken = default)
    {
        _context.Classrooms.Add(classroom);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Classroom classroom, CancellationToken cancellationToken = default)
    {
        _context.Classrooms.Remove(classroom);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
