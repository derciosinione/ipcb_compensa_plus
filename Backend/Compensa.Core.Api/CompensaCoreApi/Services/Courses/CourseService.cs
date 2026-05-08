using CompensaCoreApi.Domain.Courses;
using CompensaCoreApi.Dtos.Courses;
using CompensaCoreApi.Exceptions;
using CompensaCoreApi.Repositories.Courses;

namespace CompensaCoreApi.Services.Courses;

public sealed class CourseService : ICourseService
{
    private const string DefaultCourseImageUrl = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop";

    private readonly ICourseRepository _repository;

    public CourseService(ICourseRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyCollection<CourseResponse>> ListAsync(
        string? search,
        CancellationToken cancellationToken = default)
    {
        var courses = await _repository.ListAsync(search, cancellationToken);
        return courses.Select(ToResponse).ToArray();
    }

    public async Task<CourseResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var course = await GetRequiredCourseAsync(id, cancellationToken);
        return ToResponse(course);
    }

    public async Task<CourseDetailsResponse> GetDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var course = await GetRequiredCourseAsync(id, cancellationToken);
        var units = await _repository.ListUnitsAsync(id, cancellationToken);
        var classes = await _repository.ListClassGroupsAsync(id, cancellationToken);

        return new CourseDetailsResponse(
            ToResponse(course),
            units.Select(ToUnitResponse).ToArray(),
            classes.Select(ToClassGroupResponse).ToArray());
    }

    public async Task<CourseResponse> CreateAsync(
        CreateCourseRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureUniqueAbbreviationAsync(request.Abbreviation, excludedCourseId: null, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var course = new Course
        {
            Name = request.Name.Trim(),
            Abbreviation = request.Abbreviation.Trim().ToUpperInvariant(),
            Type = request.Type,
            Description = request.Description.Trim(),
            DurationYears = request.DurationYears,
            TotalCredits = request.TotalCredits,
            CoordinatorUserId = NormalizeOptional(request.CoordinatorUserId),
            ImageUrl = NormalizeImageUrl(request.ImageUrl, request.Type),
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _repository.AddAsync(course, cancellationToken);
        return ToResponse(course);
    }

    public async Task<CourseResponse> UpdateAsync(
        Guid id,
        UpdateCourseRequest request,
        CancellationToken cancellationToken = default)
    {
        var course = await GetRequiredCourseAsync(id, cancellationToken);
        await EnsureUniqueAbbreviationAsync(request.Abbreviation, course.Id, cancellationToken);

        course.Name = request.Name.Trim();
        course.Abbreviation = request.Abbreviation.Trim().ToUpperInvariant();
        course.Type = request.Type;
        course.Description = request.Description.Trim();
        course.DurationYears = request.DurationYears;
        course.TotalCredits = request.TotalCredits;
        course.CoordinatorUserId = NormalizeOptional(request.CoordinatorUserId);
        course.ImageUrl = NormalizeImageUrl(request.ImageUrl, request.Type);
        course.IsActive = request.IsActive;
        course.UpdatedAt = DateTimeOffset.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        return ToResponse(course);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var course = await GetRequiredCourseAsync(id, cancellationToken);
        await _repository.DeleteAsync(course, cancellationToken);
    }

    private async Task<Course> GetRequiredCourseAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Course '{id}' was not found.");
    }

    private async Task EnsureUniqueAbbreviationAsync(
        string abbreviation,
        Guid? excludedCourseId,
        CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByAbbreviationAsync(abbreviation, cancellationToken);

        if (existing != null && existing.Id != excludedCourseId)
            throw new InvalidOperationException($"Course abbreviation '{abbreviation}' already exists.");
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static string NormalizeImageUrl(string? imageUrl, CourseDegreeType type)
    {
        if (!string.IsNullOrWhiteSpace(imageUrl))
            return imageUrl.Trim();

        return type switch
        {
            CourseDegreeType.Mestrado => "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop",
            CourseDegreeType.CTeSP => "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop",
            _ => DefaultCourseImageUrl
        };
    }

    private static CourseResponse ToResponse(Course course)
    {
        return new CourseResponse(
            course.Id,
            course.Name,
            course.Abbreviation,
            course.Type,
            course.Description,
            course.DurationYears,
            course.TotalCredits,
            course.CoordinatorUserId,
            course.ImageUrl,
            course.IsActive,
            course.CreatedAt,
            course.UpdatedAt);
    }

    private static CurricularUnitResponse ToUnitResponse(CurricularUnit unit)
    {
        return new CurricularUnitResponse(
            unit.Id,
            unit.CourseId,
            unit.Name,
            unit.Year,
            unit.Semester,
            unit.Ects,
            unit.TeacherIds,
            unit.RegentId,
            unit.TheoreticalTeacherId,
            unit.PracticalTeacherId,
            unit.Component,
            unit.IsActive);
    }

    private static ClassGroupResponse ToClassGroupResponse(ClassGroup group)
    {
        return new ClassGroupResponse(
            group.Id,
            group.CourseId,
            group.CurricularUnitId,
            group.Name,
            group.TeacherId,
            group.IsActive);
    }
}
