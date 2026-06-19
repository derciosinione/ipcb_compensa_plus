using CompensaCoreApi.Domain.Classrooms;
using CompensaCoreApi.Dtos.Classrooms;
using CompensaCoreApi.Exceptions;
using CompensaCoreApi.Repositories.Classrooms;

namespace CompensaCoreApi.Services.Classrooms;

public sealed class ClassroomService : IClassroomService
{
    private readonly IClassroomRepository _repository;

    public ClassroomService(IClassroomRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyCollection<ClassroomResponse>> ListAsync(
        string? search,
        CancellationToken cancellationToken = default)
    {
        var classrooms = await _repository.ListAsync(search, cancellationToken);
        return classrooms.Select(ToResponse).ToArray();
    }

    public async Task<ClassroomResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var classroom = await GetRequiredClassroomAsync(id, cancellationToken);
        return ToResponse(classroom);
    }

    public async Task<ClassroomResponse> CreateAsync(
        CreateClassroomRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureUniqueNameAsync(request.Name, excludedClassroomId: null, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var classroom = new Classroom
        {
            Name = request.Name.Trim(),
            Type = request.Type,
            Capacity = request.Capacity,
            Features = NormalizeFeatures(request.Features),
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _repository.AddAsync(classroom, cancellationToken);
        return ToResponse(classroom);
    }

    public async Task<ClassroomResponse> UpdateAsync(
        Guid id,
        UpdateClassroomRequest request,
        CancellationToken cancellationToken = default)
    {
        var classroom = await GetRequiredClassroomAsync(id, cancellationToken);
        await EnsureUniqueNameAsync(request.Name, classroom.Id, cancellationToken);

        classroom.Name = request.Name.Trim();
        classroom.Type = request.Type;
        classroom.Capacity = request.Capacity;
        classroom.Features = NormalizeFeatures(request.Features);
        classroom.IsActive = request.IsActive;
        classroom.UpdatedAt = DateTimeOffset.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        return ToResponse(classroom);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var classroom = await GetRequiredClassroomAsync(id, cancellationToken);
        await _repository.DeleteAsync(classroom, cancellationToken);
    }

    public async Task DeleteBulkAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default)
    {
        foreach (var id in ids)
        {
            var classroom = await _repository.GetByIdAsync(id, cancellationToken);
            if (classroom != null)
            {
                await _repository.DeleteAsync(classroom, cancellationToken);
            }
        }
    }

    public Task<int> GetSchedulesCountAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _repository.GetSchedulesCountAsync(id, cancellationToken);
    }

    private async Task<Classroom> GetRequiredClassroomAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Classroom '{id}' was not found.");
    }

    private async Task EnsureUniqueNameAsync(
        string name,
        Guid? excludedClassroomId,
        CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByNameAsync(name, cancellationToken);

        if (existing != null && existing.Id != excludedClassroomId)
            throw new InvalidOperationException($"Classroom '{name}' already exists.");
    }

    private static string[] NormalizeFeatures(IEnumerable<string> features)
    {
        return features
            .Select(feature => feature.Trim())
            .Where(feature => feature.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    private static ClassroomResponse ToResponse(Classroom classroom)
    {
        return new ClassroomResponse(
            classroom.Id,
            classroom.Name,
            classroom.Type,
            classroom.Capacity,
            classroom.Features,
            classroom.IsActive,
            classroom.CreatedAt,
            classroom.UpdatedAt);
    }
}
