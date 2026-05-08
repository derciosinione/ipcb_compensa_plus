using System.ComponentModel.DataAnnotations;
using CompensaCoreApi.Domain.Classrooms;

namespace CompensaCoreApi.Dtos.Classrooms;

public sealed class UpdateClassroomRequest
{
    [Required]
    [MaxLength(80)]
    public string Name { get; init; } = string.Empty;

    [Required]
    public ClassroomType Type { get; init; }

    [Range(1, 500)]
    public int Capacity { get; init; }

    public string[] Features { get; init; } = [];
    public bool IsActive { get; init; } = true;
}
