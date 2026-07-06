using CompensaCoreApi.Domain.AcademicYears;

namespace CompensaCoreApi.Domain.Courses;

public sealed class CourseOffering
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Guid AcademicYearId { get; set; }
    
    public string? CoordinatorUserId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    
    public bool IsActive { get; set; } = true;
    
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    
    // Navigation properties
    public Course? Course { get; set; }
    public AcademicYear? AcademicYear { get; set; }
}
