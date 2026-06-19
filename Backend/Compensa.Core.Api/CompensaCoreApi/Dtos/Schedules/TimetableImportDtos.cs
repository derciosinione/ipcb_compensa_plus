using System;
using System.Collections.Generic;
using CompensaCoreApi.Domain.Courses;

namespace CompensaCoreApi.Dtos.Schedules;

public sealed class TimetableImportPreviewResponse
{
    public Guid? AcademicYearId { get; set; }
    public string AcademicYearName { get; set; } = string.Empty;
    public int DetectedSemester { get; set; }
    public List<CoursePreviewDto> Courses { get; set; } = [];
    public List<CourseLookupDto> AvailableCourses { get; set; } = [];
    public List<ClassroomLookupDto> AvailableClassrooms { get; set; } = [];
    public List<ClassGroupLookupDto> AvailableClassGroups { get; set; } = [];
}

public sealed class ClassGroupLookupDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Name { get; set; } = string.Empty;
}

public sealed class CoursePreviewDto
{
    public string TempId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Abbreviation { get; set; } = string.Empty;
    public bool IsMatched { get; set; }
    public Guid? MatchedCourseId { get; set; }
    public List<ClassGroupPreviewDto> Classes { get; set; } = [];
    public List<CurricularUnitLookupDto> AvailableUnits { get; set; } = [];
}

public sealed class ClassGroupPreviewDto
{
    public string TempId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Year { get; set; }
    public bool IsMatched { get; set; }
    public Guid? MatchedClassGroupId { get; set; }
    public List<SchedulePreviewDto> Schedules { get; set; } = [];
}

public sealed class SchedulePreviewDto
{
    public string CurricularUnitName { get; set; } = string.Empty;
    public string CurricularUnitAbbreviation { get; set; } = string.Empty;
    public bool IsCurricularUnitMatched { get; set; }
    public Guid? MatchedCurricularUnitId { get; set; }
    public string ComponentType { get; set; } = "All"; // "Theoretical" or "Practical" or "All"
    public int DayOfWeek { get; set; } // Sunday = 0, Monday = 1 ...
    public string StartTime { get; set; } = string.Empty; // "HH:mm"
    public string EndTime { get; set; } = string.Empty; // "HH:mm"
    public string ClassroomName { get; set; } = string.Empty;
    public bool IsClassroomMatched { get; set; }
    public Guid? MatchedClassroomId { get; set; }
}

public sealed class CourseLookupDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Abbreviation { get; set; } = string.Empty;
}

public sealed class ClassroomLookupDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public sealed class CurricularUnitLookupDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Semester { get; set; }
}

public sealed class TimetableImportConfirmRequest
{
    public Guid AcademicYearId { get; set; }
    public int Semester { get; set; }
    public List<TimetableImportScheduleItem> Schedules { get; set; } = [];
    public bool OverwriteExisting { get; set; } = true;
    public List<CourseCreateDto> CoursesToCreate { get; set; } = [];
    public List<ClassGroupCreateDto> ClassGroupsToCreate { get; set; } = [];
    public List<CurricularUnitCreateDto> CurricularUnitsToCreate { get; set; } = [];
    public List<CurricularUnitCreateDto> CurricularUnitsToUpdate { get; set; } = [];
    public List<ClassroomCreateDto> ClassroomsToCreate { get; set; } = [];
}

public sealed class CourseCreateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Abbreviation { get; set; } = string.Empty;
}

public sealed class ClassroomCreateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public sealed class ClassGroupCreateDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Year { get; set; }
}

public sealed class CurricularUnitCreateDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Abbreviation { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Semester { get; set; }
}


public sealed class TimetableImportScheduleItem
{
    public Guid CourseId { get; set; }
    public Guid ClassGroupId { get; set; }
    public Guid CurricularUnitId { get; set; }
    public Guid? ClassroomId { get; set; }
    public string ComponentType { get; set; } = "All";
    public int DayOfWeek { get; set; }
    public string StartTime { get; set; } = string.Empty; // "HH:mm"
    public string EndTime { get; set; } = string.Empty; // "HH:mm"
}
