using CompensaCoreApi.Domain.AcademicYears;

namespace CompensaCoreApi.Domain.Courses;

public sealed class CurricularUnitOffering
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CurricularUnitId { get; set; }
    public Guid AcademicYearId { get; set; }
    
    public string ResponsibleTeacherId { get; set; } = string.Empty;
    public string ResponsibleTeacherEmail { get; set; } = string.Empty;
    
    public int Year { get; set; }
    public int Semester { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    
    // Navigation properties
    public CurricularUnit? CurricularUnit { get; set; }
    public AcademicYear? AcademicYear { get; set; }
}
