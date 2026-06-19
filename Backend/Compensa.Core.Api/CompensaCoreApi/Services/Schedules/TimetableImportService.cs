using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using CompensaCoreApi.Data;
using CompensaCoreApi.Domain.Classrooms;
using CompensaCoreApi.Domain.Courses;
using CompensaCoreApi.Dtos.Schedules;
using Microsoft.EntityFrameworkCore;

namespace CompensaCoreApi.Services.Schedules;

public sealed class TimetableImportService : ITimetableImportService
{
    private readonly CoreDbContext _context;

    public TimetableImportService(CoreDbContext context)
    {
        _context = context;
    }

    public async Task<TimetableImportPreviewResponse> ProcessTimetablesAsync(
        IEnumerable<(string Filename, byte[] Content)> files,
        Guid? academicYearId,
        CancellationToken cancellationToken = default)
    {
        // 1. Get Academic Year
        var activeYear = academicYearId.HasValue
            ? await _context.AcademicYears.FindAsync([academicYearId.Value], cancellationToken)
            : await _context.AcademicYears.FirstOrDefaultAsync(y => y.IsActive, cancellationToken);

        if (activeYear == null)
        {
            throw new InvalidOperationException("No active academic year found.");
        }

        // 2. Load DB entities for matching
        var dbCourses = await _context.Courses.ToListAsync(cancellationToken);
        var dbClassGroups = await _context.ClassGroups
            .Where(cg => cg.AcademicYearId == activeYear.Id)
            .ToListAsync(cancellationToken);
        var dbUnits = await _context.CurricularUnits.ToListAsync(cancellationToken);
        var dbClassrooms = await _context.Classrooms.ToListAsync(cancellationToken);

        var dbClassroomNames = dbClassrooms.Select(c => c.Name.ToUpperInvariant()).ToHashSet();

        // 3. Prepare response
        var response = new TimetableImportPreviewResponse
        {
            AcademicYearId = activeYear.Id,
            AcademicYearName = activeYear.Name,
            DetectedSemester = 1
        };

        // We will group by Course + Class Group name dynamically
        var coursesMap = new Dictionary<string, CoursePreviewDto>();

        foreach (var file in files)
        {
            var html = DecodeHtml(file.Content);

            // 4. Detect class/turma name
            string className = DetectClassName(file.Filename, html);
            if (string.IsNullOrWhiteSpace(className))
            {
                continue; // Skip files that don't look like timetable exports
            }

            // Detect semester from this file
            int fileSemester = DetectSemester(file.Filename, html);
            response.DetectedSemester = fileSemester; // Keep the last detected semester as default

            // 5. Parse HTML tables
            var tables = ExtractTables(html);
            if (tables.Count == 0) continue;

            // Find Grid and Legend tables
            var gridTable = tables.FirstOrDefault(t => t.Rows.Count > 0 && IsTimetableHeader(t.Rows[0]));
            var legendTable = tables.FirstOrDefault(t => t.Rows.Count > 0 && IsLegendHeader(t.Rows[0]));

            if (gridTable == null) continue;

            // Parse Legend
            var legend = new Dictionary<string, (string UnitName, string TeacherName)>(StringComparer.OrdinalIgnoreCase);
            if (legendTable != null)
            {
                for (int i = 1; i < legendTable.Rows.Count; i++)
                {
                    var row = legendTable.Rows[i];
                    if (row.Count >= 2)
                    {
                        var sigla = row[0].Text.Trim();
                        var disciplina = row[1].Text.Trim();
                        var professores = row.Count >= 3 ? row[2].Text.Trim() : string.Empty;
                        if (!string.IsNullOrWhiteSpace(sigla))
                        {
                            legend[sigla] = (disciplina, professores);
                        }
                    }
                }
            }

            // Parse course abbreviation from class name (e.g. L.EI.1.1 -> LEI)
            string courseAbbrev = ExtractCourseAbbreviation(className);

            // Match Course
            var matchedCourse = FindCourse(courseAbbrev, dbCourses);
            string courseKey = matchedCourse != null ? matchedCourse.Id.ToString() : $"unmatched_{courseAbbrev}";

            if (!coursesMap.TryGetValue(courseKey, out var courseDto))
            {
                courseDto = new CoursePreviewDto
                {
                    TempId = Guid.NewGuid().ToString(),
                    Name = matchedCourse?.Name ?? $"Curso {courseAbbrev}",
                    Abbreviation = matchedCourse?.Abbreviation ?? courseAbbrev,
                    IsMatched = matchedCourse != null,
                    MatchedCourseId = matchedCourse?.Id,
                    Classes = [],
                    AvailableUnits = matchedCourse != null
                        ? dbUnits.Where(u => u.CourseId == matchedCourse.Id)
                            .Select(u => new CurricularUnitLookupDto
                            {
                                Id = u.Id,
                                Name = u.Name,
                                Year = u.Year,
                                Semester = u.Semester
                            }).ToList()
                        : []
                };
                coursesMap[courseKey] = courseDto;
            }

            // Match Class Group
            ClassGroup? matchedClassGroup = null;
            if (matchedCourse != null)
            {
                matchedClassGroup = FindClassGroup(className, matchedCourse.Id, dbClassGroups);
            }

            var classDto = new ClassGroupPreviewDto
            {
                TempId = Guid.NewGuid().ToString(),
                Name = className,
                Year = ExtractYearFromClassName(className),
                IsMatched = matchedClassGroup != null,
                MatchedClassGroupId = matchedClassGroup?.Id,
                Schedules = []
            };

            // Parse Grid slots using Rowspan algorithm
            var rows = gridTable.Rows;
            var rowspanRemaining = new int[rows.Count, 6];
            var gridCells = new ParsedCell?[rows.Count, 6];
            var timeSlots = new string[rows.Count];

            for (int r = 0; r < rows.Count; r++)
            {
                var row = rows[r];
                if (row.Count < 2) continue;

                // First cell is the time slot
                timeSlots[r] = row[0].Text;

                int cellIndex = 1;
                for (int d = 1; d <= 5; d++)
                {
                    if (rowspanRemaining[r, d] > 0)
                    {
                        continue;
                    }

                    if (cellIndex >= row.Count)
                    {
                        break;
                    }

                    var cell = row[cellIndex++];
                    gridCells[r, d] = cell;

                    int span = cell.Rowspan;
                    for (int i = 0; i < span; i++)
                    {
                        if (r + i < rows.Count)
                        {
                            rowspanRemaining[r + i, d] = span - i;
                        }
                    }
                }
            }

            // Read schedules from parsed grid
            for (int r = 0; r < rows.Count; r++)
            {
                string timeText = timeSlots[r];
                if (string.IsNullOrWhiteSpace(timeText)) continue;

                var timeMatch = Regex.Match(timeText, @"(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})");
                if (!timeMatch.Success) continue;

                string startTime = timeMatch.Groups[1].Value;
                string endTime = timeMatch.Groups[2].Value;

                for (int d = 1; d <= 5; d++)
                {
                    var cell = gridCells[r, d];
                    if (cell == null || string.IsNullOrWhiteSpace(cell.Text) || cell.Text.Equals("&nbsp;") || cell.Text.Equals(" "))
                    {
                        continue;
                    }

                    // Parse cell internals
                    var cellLines = cell.Text.Split(['\n'], StringSplitOptions.RemoveEmptyEntries)
                        .Select(l => l.Trim())
                        .ToList();

                    if (cellLines.Count == 0) continue;

                    string sigla = cellLines[0];
                    string compTypeStr = cellLines.Count > 1 ? cellLines[1] : string.Empty;
                    string teacherName = string.Empty;
                    string classroomName = string.Empty;

                    if (cellLines.Count >= 3)
                    {
                        var lastLine = cellLines[^1];
                        if (IsClassroomLike(lastLine, dbClassroomNames))
                        {
                            classroomName = lastLine;
                            teacherName = string.Join(" ", cellLines.Skip(2).Take(cellLines.Count - 3));
                        }
                        else
                        {
                            teacherName = string.Join(" ", cellLines.Skip(2));
                        }
                    }

                    // Look up details in legend
                    string fullUnitName = sigla;
                    if (legend.TryGetValue(sigla, out var legendInfo))
                    {
                        fullUnitName = legendInfo.UnitName;
                    }

                    // Match Curricular Unit
                    CurricularUnit? matchedUnit = null;
                    if (matchedCourse != null)
                    {
                        matchedUnit = FindCurricularUnit(fullUnitName, sigla, matchedCourse.Id, dbUnits);
                    }

                    // Match Classroom
                    var matchedClassroom = FindClassroom(classroomName, dbClassrooms);

                    // Mapped component type
                    // TP = Teórico Prático, PL = Prática Laboratorial, T = Teórico, P = Prático
                    string componentType;
                    var compUpper = compTypeStr.Trim().ToUpperInvariant();
                    if (compUpper == "TP" || compUpper == "T.P" || compUpper == "T.P.")
                    {
                        componentType = "TheoreticalPractical";
                    }
                    else if (compUpper == "PL" || compUpper == "P.L" || compUpper == "P.L.")
                    {
                        componentType = "PracticalLaboratorial";
                    }
                    else if (compUpper.StartsWith("T", StringComparison.OrdinalIgnoreCase) && !compUpper.StartsWith("TP", StringComparison.OrdinalIgnoreCase))
                    {
                        componentType = "Theoretical";
                    }
                    else if (compUpper.StartsWith("P", StringComparison.OrdinalIgnoreCase) && !compUpper.StartsWith("PL", StringComparison.OrdinalIgnoreCase))
                    {
                        componentType = "Practical";
                    }
                    else if (string.IsNullOrWhiteSpace(compUpper))
                    {
                        componentType = "All";
                    }
                    else
                    {
                        componentType = "TheoreticalPractical"; // Default for unrecognised types
                    }

                    // Calculate End Time based on rowspan span if needed
                    // In some exports, a rowspan'd cell spans multiple rows. We should check if we can adjust the end time.
                    // For example, if it spans 2 rows starting from 08:30-09:30, the end time should be the end time of the spanned row (09:30-10:30, so 10:30).
                    int cellSpan = cell.Rowspan;
                    string finalEndTime = endTime;
                    if (cellSpan > 1 && r + cellSpan - 1 < rows.Count)
                    {
                        string spannedTimeText = timeSlots[r + cellSpan - 1];
                        var spannedTimeMatch = Regex.Match(spannedTimeText, @"(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})");
                        if (spannedTimeMatch.Success)
                        {
                            finalEndTime = spannedTimeMatch.Groups[2].Value;
                        }
                    }

                    classDto.Schedules.Add(new SchedulePreviewDto
                    {
                        CurricularUnitName = fullUnitName,
                        CurricularUnitAbbreviation = sigla,
                        IsCurricularUnitMatched = matchedUnit != null,
                        MatchedCurricularUnitId = matchedUnit?.Id,
                        ComponentType = componentType,
                        DayOfWeek = d,
                        StartTime = startTime,
                        EndTime = finalEndTime,
                        ClassroomName = classroomName,
                        IsClassroomMatched = matchedClassroom != null,
                        MatchedClassroomId = matchedClassroom?.Id
                    });
                }
            }

            courseDto.Classes.Add(classDto);
        }

        response.Courses = [.. coursesMap.Values];

        // 6. Global Lookups for Frontend Dropdowns
        response.AvailableCourses = dbCourses.Select(c => new CourseLookupDto
        {
            Id = c.Id,
            Name = c.Name,
            Abbreviation = c.Abbreviation
        }).OrderBy(c => c.Abbreviation).ToList();

        response.AvailableClassrooms = dbClassrooms.Select(r => new ClassroomLookupDto
        {
            Id = r.Id,
            Name = r.Name
        }).OrderBy(r => r.Name).ToList();

        return response;
    }

    public async Task<int> ConfirmImportAsync(
        TimetableImportConfirmRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Schedules.Count == 0)
        {
            return 0;
        }

        var now = DateTimeOffset.UtcNow;

        // 1. Create missing Courses (safe: also check by Abbreviation to avoid unique constraint violations)
        var courseIdRemap = new Dictionary<Guid, Guid>();

        if (request.CoursesToCreate != null && request.CoursesToCreate.Count > 0)
        {
            var requestCourseIds = request.CoursesToCreate.Select(x => x.Id).ToList();
            var requestCourseAbbrevs = request.CoursesToCreate.Select(x => x.Abbreviation.Trim()).ToList();

            // Load existing courses matching either GUID or Abbreviation
            var existingCourses = await _context.Courses
                .Where(c => requestCourseIds.Contains(c.Id) || requestCourseAbbrevs.Contains(c.Abbreviation))
                .ToListAsync(cancellationToken);

            var existingByGuidSet = existingCourses
                .Where(c => requestCourseIds.Contains(c.Id))
                .Select(c => c.Id)
                .ToHashSet();

            var coursesToInsert = new List<Course>();

            foreach (var c in request.CoursesToCreate)
            {
                if (existingByGuidSet.Contains(c.Id))
                {
                    courseIdRemap[c.Id] = c.Id;
                    continue;
                }

                var matchByAbbrev = existingCourses
                    .FirstOrDefault(e => string.Equals(e.Abbreviation, c.Abbreviation.Trim(), StringComparison.OrdinalIgnoreCase));

                if (matchByAbbrev != null)
                {
                    courseIdRemap[c.Id] = matchByAbbrev.Id;
                    continue;
                }

                var type = c.Abbreviation.Contains("CTeSP", StringComparison.OrdinalIgnoreCase) 
                    ? CourseDegreeType.CTeSP 
                    : c.Abbreviation.Contains("Mestrado", StringComparison.OrdinalIgnoreCase)
                        ? CourseDegreeType.Mestrado
                        : CourseDegreeType.Licenciatura;

                coursesToInsert.Add(new Course
                {
                    Id = c.Id,
                    Name = c.Name.Trim(),
                    Abbreviation = c.Abbreviation.Trim(),
                    Type = type,
                    DurationYears = 3,
                    TotalCredits = 180,
                    IsActive = true,
                    CreatedAt = now,
                    UpdatedAt = now
                });
            }

            if (coursesToInsert.Count > 0)
            {
                _context.Courses.AddRange(coursesToInsert);
            }
        }

        // 2. Create missing Class Groups (safe: also check by CourseId + Name to avoid unique constraint violations)
        var classGroupIdRemap = new Dictionary<Guid, Guid>();

        if (request.ClassGroupsToCreate != null && request.ClassGroupsToCreate.Count > 0)
        {
            var requestGroupIds = request.ClassGroupsToCreate.Select(x => x.Id).ToList();
            
            // Map CourseIds for database query using courseIdRemap
            var queryCourseIds = request.ClassGroupsToCreate
                .Select(cg => courseIdRemap.TryGetValue(cg.CourseId, out var rId) ? rId : cg.CourseId)
                .Distinct()
                .ToList();

            // Load existing class groups for these course IDs and academic year
            var existingClassGroups = await _context.ClassGroups
                .Where(cg => queryCourseIds.Contains(cg.CourseId) && cg.AcademicYearId == request.AcademicYearId)
                .ToListAsync(cancellationToken);

            var existingByGuidSet = existingClassGroups
                .Where(cg => requestGroupIds.Contains(cg.Id))
                .Select(cg => cg.Id)
                .ToHashSet();

            var groupsToInsert = new List<ClassGroup>();

            foreach (var cg in request.ClassGroupsToCreate)
            {
                if (existingByGuidSet.Contains(cg.Id))
                {
                    classGroupIdRemap[cg.Id] = cg.Id;
                    continue;
                }

                var resolvedCourseId = courseIdRemap.TryGetValue(cg.CourseId, out var rId) ? rId : cg.CourseId;

                var match = existingClassGroups
                    .FirstOrDefault(e => e.CourseId == resolvedCourseId &&
                                         e.AcademicYearId == request.AcademicYearId &&
                                         e.Year == cg.Year &&
                                         string.Equals(e.Name, cg.Name.Trim(), StringComparison.OrdinalIgnoreCase));

                if (match != null)
                {
                    classGroupIdRemap[cg.Id] = match.Id;
                    continue;
                }

                groupsToInsert.Add(new ClassGroup
                {
                    Id = cg.Id,
                    CourseId = resolvedCourseId,
                    AcademicYearId = request.AcademicYearId,
                    Year = cg.Year,
                    Name = cg.Name.Trim(),
                    TeacherId = string.Empty,
                    IsActive = true,
                    CreatedAt = now,
                    UpdatedAt = now
                });
            }

            if (groupsToInsert.Count > 0)
            {
                _context.ClassGroups.AddRange(groupsToInsert);
            }
        }

        // 3. Create missing Curricular Units (safe UPSERT: check by GUID and by (CourseId, Name/Abbreviation))
        // ucIdRemap: maps a frontend-generated UC GUID → existing DB UC GUID when a match is found
        var ucIdRemap = new Dictionary<Guid, Guid>();

        if (request.CurricularUnitsToCreate != null && request.CurricularUnitsToCreate.Count > 0)
        {
            var requestUcIds = request.CurricularUnitsToCreate.Select(x => x.Id).ToList();
            
            // Map CourseIds for database query using courseIdRemap
            var requestCourseIds = request.CurricularUnitsToCreate
                .Select(x => courseIdRemap.TryGetValue(x.CourseId, out var rId) ? rId : x.CourseId)
                .Distinct()
                .ToList();

            // Load all existing UCs in the affected courses (to detect name/abbreviation duplicates)
            var existingInCourses = await _context.CurricularUnits
                .Where(cu => requestCourseIds.Contains(cu.CourseId))
                .ToListAsync(cancellationToken);

            var existingByGuidIds = existingInCourses
                .Where(cu => requestUcIds.Contains(cu.Id))
                .Select(cu => cu.Id)
                .ToHashSet();

            var unitsToInsert = new List<CurricularUnit>();

            foreach (var cu in request.CurricularUnitsToCreate)
            {
                var resolvedCourseId = courseIdRemap.TryGetValue(cu.CourseId, out var rId) ? rId : cu.CourseId;

                // Already exists by GUID → remap to itself (no insert needed)
                if (existingByGuidIds.Contains(cu.Id))
                {
                    ucIdRemap[cu.Id] = cu.Id;
                    continue;
                }

                var unitName   = !string.IsNullOrWhiteSpace(cu.Name) ? cu.Name.Trim() : cu.Abbreviation.Trim();
                var unitAbbrev = cu.Abbreviation?.Trim() ?? string.Empty;

                // Check if an existing UC with the same (CourseId + Name) already exists
                var matchByName = existingInCourses
                    .FirstOrDefault(e => e.CourseId == resolvedCourseId &&
                                         string.Equals(e.Name, unitName, StringComparison.OrdinalIgnoreCase));

                if (matchByName != null)
                {
                    // Remap frontend GUID → real existing GUID
                    ucIdRemap[cu.Id] = matchByName.Id;

                    // Update abbreviation if not yet set
                    if (!string.IsNullOrWhiteSpace(unitAbbrev) && matchByName.Abbreviation != unitAbbrev)
                    {
                        matchByName.Abbreviation = unitAbbrev;
                        matchByName.UpdatedAt = now;
                    }
                    continue;
                }

                // Check by (CourseId + Abbreviation) as fallback
                if (!string.IsNullOrWhiteSpace(unitAbbrev))
                {
                    var matchByAbbrev = existingInCourses
                        .FirstOrDefault(e => e.CourseId == resolvedCourseId &&
                                             !string.IsNullOrWhiteSpace(e.Abbreviation) &&
                                             string.Equals(e.Abbreviation, unitAbbrev, StringComparison.OrdinalIgnoreCase));

                    if (matchByAbbrev != null)
                    {
                        ucIdRemap[cu.Id] = matchByAbbrev.Id;

                        // Update full name if currently empty
                        if (!string.IsNullOrWhiteSpace(unitName) && string.IsNullOrWhiteSpace(matchByAbbrev.Name))
                        {
                            matchByAbbrev.Name = unitName;
                            matchByAbbrev.UpdatedAt = now;
                        }
                        continue;
                    }
                }

                // Truly new UC — insert it
                unitsToInsert.Add(new CurricularUnit
                {
                    Id = cu.Id,
                    CourseId = resolvedCourseId,
                    Name = unitName,
                    Abbreviation = unitAbbrev,
                    Year = cu.Year,
                    Semester = cu.Semester,
                    Ects = 6,
                    IsActive = true,
                    CreatedAt = now,
                    UpdatedAt = now
                });
            }

            if (unitsToInsert.Count > 0)
            {
                _context.CurricularUnits.AddRange(unitsToInsert);
            }
        }

        // 4. Create missing Classrooms (safe: also check by Name to avoid unique constraint violations)
        var classroomIdRemap = new Dictionary<Guid, Guid>();

        if (request.ClassroomsToCreate != null && request.ClassroomsToCreate.Count > 0)
        {
            var requestRoomIds = request.ClassroomsToCreate.Select(x => x.Id).ToList();
            var requestRoomNames = request.ClassroomsToCreate.Select(x => x.Name.Trim()).ToList();

            // Load existing rooms matching either GUID or Name
            var existingRooms = await _context.Classrooms
                .Where(r => requestRoomIds.Contains(r.Id) || requestRoomNames.Contains(r.Name))
                .ToListAsync(cancellationToken);

            var existingByGuidSet = existingRooms
                .Where(r => requestRoomIds.Contains(r.Id))
                .Select(r => r.Id)
                .ToHashSet();

            var roomsToInsert = new List<Classroom>();

            foreach (var r in request.ClassroomsToCreate)
            {
                if (existingByGuidSet.Contains(r.Id))
                {
                    classroomIdRemap[r.Id] = r.Id;
                    continue;
                }

                var matchByName = existingRooms
                    .FirstOrDefault(e => string.Equals(e.Name, r.Name.Trim(), StringComparison.OrdinalIgnoreCase));

                if (matchByName != null)
                {
                    classroomIdRemap[r.Id] = matchByName.Id;
                    continue;
                }

                var type = ClassroomType.Standard;
                if (r.Name.StartsWith("LAB", StringComparison.OrdinalIgnoreCase) ||
                    r.Name.StartsWith("L.", StringComparison.OrdinalIgnoreCase))
                {
                    type = ClassroomType.PcLab;
                }
                else if (r.Name.StartsWith("ANF", StringComparison.OrdinalIgnoreCase))
                {
                    type = ClassroomType.Amphitheater;
                }

                roomsToInsert.Add(new Classroom
                {
                    Id = r.Id,
                    Name = r.Name.Trim(),
                    Type = type,
                    Capacity = 30,
                    Features = [],
                    IsActive = true,
                    CreatedAt = now,
                    UpdatedAt = now
                });
            }

            if (roomsToInsert.Count > 0)
            {
                _context.Classrooms.AddRange(roomsToInsert);
            }
        }

        // 3b. Update abbreviation on existing Curricular Units (if they were matched but have no abbreviation)
        if (request.CurricularUnitsToUpdate != null && request.CurricularUnitsToUpdate.Count > 0)
        {
            var updateIds = request.CurricularUnitsToUpdate.Select(u => u.Id).ToList();
            var existingUnits = await _context.CurricularUnits
                .Where(cu => updateIds.Contains(cu.Id))
                .ToListAsync(cancellationToken);

            foreach (var existing in existingUnits)
            {
                var dto = request.CurricularUnitsToUpdate.FirstOrDefault(u => u.Id == existing.Id);
                if (dto == null) continue;

                // Only update abbreviation if not already set or different
                bool changed = false;
                if (!string.IsNullOrWhiteSpace(dto.Abbreviation) && existing.Abbreviation != dto.Abbreviation)
                {
                    existing.Abbreviation = dto.Abbreviation;
                    changed = true;
                }
                if (changed)
                {
                    existing.UpdatedAt = now;
                }
            }
        }

        // Save new entities and updates to database
        if ((request.CoursesToCreate != null && request.CoursesToCreate.Count > 0) || 
            (request.ClassGroupsToCreate != null && request.ClassGroupsToCreate.Count > 0) || 
            (request.CurricularUnitsToCreate != null && request.CurricularUnitsToCreate.Count > 0) ||
            (request.CurricularUnitsToUpdate != null && request.CurricularUnitsToUpdate.Count > 0) ||
            (request.ClassroomsToCreate != null && request.ClassroomsToCreate.Count > 0))
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Delete existing schedules for the imported class groups and semester if overwrite is enabled
        if (request.OverwriteExisting)
        {
            var targetClassGroupIds = request.Schedules.Select(s => s.ClassGroupId).Distinct().ToList();
            
            var existing = await _context.ClassSchedules
                .Where(s => s.AcademicYearId == request.AcademicYearId && 
                            s.Semester == request.Semester && 
                            targetClassGroupIds.Contains(s.ClassGroupId))
                .ToListAsync(cancellationToken);

            if (existing.Count > 0)
            {
                _context.ClassSchedules.RemoveRange(existing);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        var newSchedules = new List<ClassSchedule>();

        foreach (var item in request.Schedules)
        {
            var componentType = Enum.TryParse<UnitComponentType>(item.ComponentType, out var compEnum)
                ? compEnum
                : UnitComponentType.Practical;

            // Apply UC ID remapping: if the frontend-generated GUID was matched to an existing UC, use the real ID
            var resolvedUnitId = ucIdRemap.TryGetValue(item.CurricularUnitId, out var remappedId)
                ? remappedId
                : item.CurricularUnitId;

            // Apply Course ID remapping
            var resolvedCourseId = courseIdRemap.TryGetValue(item.CourseId, out var remappedCourseId)
                ? remappedCourseId
                : item.CourseId;

            // Apply ClassGroup ID remapping
            var resolvedClassGroupId = classGroupIdRemap.TryGetValue(item.ClassGroupId, out var remappedGroupId)
                ? remappedGroupId
                : item.ClassGroupId;

            // Apply Classroom ID remapping
            var resolvedClassroomId = item.ClassroomId.HasValue && item.ClassroomId.Value != Guid.Empty
                ? (classroomIdRemap.TryGetValue(item.ClassroomId.Value, out var remappedRoomId) ? remappedRoomId : item.ClassroomId.Value)
                : (Guid?)null;

            var schedule = new ClassSchedule
            {
                Id = Guid.NewGuid(),
                CourseId = resolvedCourseId,
                ClassGroupId = resolvedClassGroupId,
                CurricularUnitId = resolvedUnitId,
                AcademicYearId = request.AcademicYearId,
                Semester = request.Semester,
                ClassroomId = resolvedClassroomId,
                ComponentType = componentType,
                DayOfWeek = item.DayOfWeek,
                StartTime = TimeOnly.Parse(item.StartTime),
                EndTime = TimeOnly.Parse(item.EndTime),
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            };

            newSchedules.Add(schedule);
        }

        _context.ClassSchedules.AddRange(newSchedules);
        await _context.SaveChangesAsync(cancellationToken);

        return newSchedules.Count;
    }

    #region Helper Methods

    private static string DecodeHtml(byte[] bytes)
    {
        if (bytes.Length >= 2 && bytes[0] == 0xFF && bytes[1] == 0xFE)
        {
            return Encoding.Unicode.GetString(bytes); // UTF-16LE
        }
        if (bytes.Length >= 2 && bytes[0] == 0xFE && bytes[1] == 0xFF)
        {
            return Encoding.BigEndianUnicode.GetString(bytes); // UTF-16BE
        }
        if (bytes.Length >= 3 && bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF)
        {
            return Encoding.UTF8.GetString(bytes); // UTF-8 with BOM
        }

        // Try detecting UTF-16 without BOM (ASCII characters will have alternating zero bytes)
        int zeroCount = 0;
        for (int i = 1; i < Math.Min(bytes.Length, 100); i += 2)
        {
            if (bytes[i] == 0) zeroCount++;
        }
        if (zeroCount > 30)
        {
            return Encoding.Unicode.GetString(bytes);
        }

        try
        {
            // Register Provider should be called globally
            return Encoding.GetEncoding("iso-8859-1").GetString(bytes);
        }
        catch
        {
            return Encoding.UTF8.GetString(bytes);
        }
    }

    private static string DetectClassName(string filename, string html)
    {
        // 1. Try body text "Turma: L.EI.1.1" or "Turma: Class A"
        var bodyMatch = Regex.Match(html, @"Turma:\s*([^<\r\n&]+)", RegexOptions.IgnoreCase);
        if (bodyMatch.Success)
        {
            var name = Regex.Replace(bodyMatch.Groups[1].Value, @"<[^>]+>", "").Trim();
            name = System.Net.WebUtility.HtmlDecode(name);
            if (!string.IsNullOrWhiteSpace(name))
            {
                return name;
            }
        }

        // 2. Try HTML title tag
        var titleMatch = Regex.Match(html, @"<title>\s*Turma:\s*([^<]+)\s*</title>", RegexOptions.IgnoreCase);
        if (titleMatch.Success)
        {
            var name = titleMatch.Groups[1].Value.Trim();
            name = System.Net.WebUtility.HtmlDecode(name);
            if (!string.IsNullOrWhiteSpace(name))
            {
                return name;
            }
        }

        // 3. Try filename pattern "Turmas_L.EI.1.1.htm"
        var fileMatch = Regex.Match(filename, @"Turmas_([a-zA-Z0-9_\.\-]+)", RegexOptions.IgnoreCase);
        if (fileMatch.Success)
        {
            return fileMatch.Groups[1].Value.Trim();
        }

        return string.Empty;
    }

    private static int DetectSemester(string filename, string html)
    {
        var fnMatch = Regex.Match(filename, @"\b(1|2)[Ss]\b");
        if (fnMatch.Success) return int.Parse(fnMatch.Groups[1].Value);

        var textMatch = Regex.Match(html, @"Hor\d{4}\d{2}_(1|2)[Ss]");
        if (textMatch.Success) return int.Parse(textMatch.Groups[1].Value);

        return 1; // Default
    }

    private static string ExtractCourseAbbreviation(string className)
    {
        // E.g. L.EI.1.1 -> LEI. CTeSP.TPSI.1 -> TPSI.
        // We find the part of the name containing letters before the year number.
        // Or if it starts with L., CTeSP.
        var parts = className.Split(['.'], StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length > 1)
        {
            if (parts[0].Equals("L", StringComparison.OrdinalIgnoreCase) || 
                parts[0].Equals("CTeSP", StringComparison.OrdinalIgnoreCase) ||
                parts[0].Equals("M", StringComparison.OrdinalIgnoreCase))
            {
                return parts[1].ToUpperInvariant();
            }
            return parts[0].ToUpperInvariant();
        }
        
        // Remove trailing numbers e.g. TPSI1 -> TPSI
        var lettersMatch = Regex.Match(className, @"^[a-zA-Z_]+");
        if (lettersMatch.Success) return lettersMatch.Value.ToUpperInvariant();

        return className;
    }

    private static int ExtractYearFromClassName(string className)
    {
        // Search for numbers in class name.
        // E.g. L.EI.1.1 -> 1. CTeSP.TPSI.2 -> 2.
        var match = Regex.Match(className, @"\.(\d)\.");
        if (match.Success)
        {
            return int.Parse(match.Groups[1].Value);
        }

        var matchTrailing = Regex.Match(className, @"\d");
        if (matchTrailing.Success)
        {
            return int.Parse(matchTrailing.Value);
        }

        return 1; // Default to year 1
    }

    private static Course? FindCourse(string nameOrAbbrev, List<Course> dbCourses)
    {
        var cleanTarget = new string(nameOrAbbrev.Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant();
        
        var matched = dbCourses.FirstOrDefault(c => 
            new string(c.Abbreviation.Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant() == cleanTarget);
        if (matched != null) return matched;
        
        matched = dbCourses.FirstOrDefault(c => 
            cleanTarget.Contains(new string(c.Abbreviation.Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant()) ||
            new string(c.Abbreviation.Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant().Contains(cleanTarget));
        if (matched != null) return matched;

        matched = dbCourses.FirstOrDefault(c => 
            c.Name.Contains(nameOrAbbrev, StringComparison.OrdinalIgnoreCase));
        
        return matched;
    }

    private static ClassGroup? FindClassGroup(string name, Guid courseId, List<ClassGroup> dbClasses)
    {
        return dbClasses.FirstOrDefault(c => 
            c.CourseId == courseId && 
            (string.Equals(c.Name, name, StringComparison.OrdinalIgnoreCase) ||
             name.EndsWith("." + c.Name, StringComparison.OrdinalIgnoreCase) ||
             c.Name.EndsWith("." + name, StringComparison.OrdinalIgnoreCase) ||
             string.Equals(new string(c.Name.Where(char.IsLetterOrDigit).ToArray()), new string(name.Where(char.IsLetterOrDigit).ToArray()), StringComparison.OrdinalIgnoreCase)));
    }

    private static CurricularUnit? FindCurricularUnit(string name, string abbrev, Guid courseId, List<CurricularUnit> dbUnits)
    {
        var courseUnits = dbUnits.Where(u => u.CourseId == courseId).ToList();

        // 1. Match by abbreviation/sigla prefix
        if (!string.IsNullOrWhiteSpace(abbrev))
        {
            var abbrevMatch = courseUnits.FirstOrDefault(u => 
                u.Name.StartsWith(abbrev + " -", StringComparison.OrdinalIgnoreCase) ||
                u.Name.Equals(abbrev, StringComparison.OrdinalIgnoreCase));
            if (abbrevMatch != null) return abbrevMatch;
        }

        // 2. Exact or suffix name match
        var match = courseUnits.FirstOrDefault(u => 
            string.Equals(u.Name, name, StringComparison.OrdinalIgnoreCase) ||
            u.Name.EndsWith(" - " + name, StringComparison.OrdinalIgnoreCase));
        if (match != null) return match;

        // 3. Try fuzzy name match (e.g. "Programação Orientada a Objetos" vs "Programming Oriented Objects" or "Programação Orientada a Objectos")
        // Clean words and match
        var cleanTarget = CleanUnitName(name);
        match = courseUnits.FirstOrDefault(u => CleanUnitName(u.Name) == cleanTarget);
        if (match != null) return match;

        // Common translations mapping
        var translationMap = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
        {
            { "Programação Orientada a Objetos", ["Object-Oriented Programming", "Object Oriented Programming", "Programming II"] },
            { "Bases de Dados", ["Database", "Databases", "Introduction to Databases"] },
            { "Algoritmos e Estruturas de Dados", ["Algorithms and Data Structures", "Data Structures", "Algorithms"] },
            { "Interfaces e Tecnologias Web", ["Web Development", "Web Technologies", "Web Design"] },
            { "Fundamentos de Programação", ["Programming Fundamentals", "Introduction to Programming", "Programming I"] },
            { "Sistemas Operativos", ["Operating Systems"] },
            { "Interfaces Pessoa Máquina", ["Human-Computer Interaction", "User Interfaces", "Design Principles"] }
        };

        foreach (var entry in translationMap)
        {
            if (string.Equals(entry.Key, name, StringComparison.OrdinalIgnoreCase))
            {
                foreach (var engName in entry.Value)
                {
                    match = courseUnits.FirstOrDefault(u => string.Equals(u.Name, engName, StringComparison.OrdinalIgnoreCase));
                    if (match != null) return match;
                }
            }
        }

        // Partial contains match
        match = courseUnits.FirstOrDefault(u => 
            u.Name.Contains(name, StringComparison.OrdinalIgnoreCase) || 
            name.Contains(u.Name, StringComparison.OrdinalIgnoreCase));
        
        return match;
    }

    private static string CleanUnitName(string name)
    {
        // Keep letters only, convert to lowercase, normalize spelling
        var cleaned = new string(name.Where(char.IsLetter).ToArray()).ToLowerInvariant();
        return cleaned.Replace("objects", "objetos").Replace("objectos", "objetos");
    }

    private static Classroom? FindClassroom(string name, List<Classroom> dbClassrooms)
    {
        if (string.IsNullOrWhiteSpace(name)) return null;

        var match = dbClassrooms.FirstOrDefault(r => string.Equals(r.Name, name, StringComparison.OrdinalIgnoreCase));
        if (match != null) return match;

        // Try fuzzy e.g. "ANF B" matches "Anfiteatro B" or "A.1" matches "Sala A.1" or "Lab 1"
        match = dbClassrooms.FirstOrDefault(r => 
            r.Name.Contains(name, StringComparison.OrdinalIgnoreCase) || 
            name.Contains(r.Name, StringComparison.OrdinalIgnoreCase));

        return match;
    }

    private static bool IsClassroomLike(string line, HashSet<string> dbClassroomNames)
    {
        var upperLine = line.ToUpperInvariant().Trim();
        if (dbClassroomNames.Contains(upperLine)) return true;

        // Matches letter + optional dot + digits (e.g. B2, D7, A8, B.1.1)
        if (Regex.IsMatch(upperLine, @"^[A-Z]\.?\d+(\.\d+)*$")) return true;
        
        return upperLine.StartsWith("A.") ||
               upperLine.StartsWith("B.") ||
               upperLine.StartsWith("C.") ||
               upperLine.StartsWith("D.") ||
               upperLine.StartsWith("E.") ||
               upperLine.StartsWith("LAB") ||
               upperLine.StartsWith("ANF") ||
               upperLine.StartsWith("SALA") ||
               upperLine.StartsWith("AUDI") ||
               upperLine.Equals("ANF B") ||
               upperLine.Equals("ANF A");
    }

    private static bool IsTimetableHeader(List<ParsedCell> row)
    {
        return row.Any(c => 
            c.Text.Contains("Segunda", StringComparison.OrdinalIgnoreCase) ||
            c.Text.Contains("Terça", StringComparison.OrdinalIgnoreCase) ||
            c.Text.Contains("Quarta", StringComparison.OrdinalIgnoreCase) ||
            c.Text.Contains("Quinta", StringComparison.OrdinalIgnoreCase) ||
            c.Text.Contains("Sexta", StringComparison.OrdinalIgnoreCase));
    }

    private static bool IsLegendHeader(List<ParsedCell> row)
    {
        return row.Any(c => c.Text.Equals("Sigla", StringComparison.OrdinalIgnoreCase)) &&
               row.Any(c => c.Text.Equals("Disciplina", StringComparison.OrdinalIgnoreCase));
    }

    private static List<ParsedTable> ExtractTables(string html)
    {
        var tables = new List<ParsedTable>();
        var tableMatches = Regex.Matches(html, @"<table[^>]*>([\s\S]*?)</table>", RegexOptions.IgnoreCase);
        
        foreach (Match tableMatch in tableMatches)
        {
            var parsedTable = new ParsedTable();
            var tableContent = tableMatch.Groups[1].Value;
            
            var rowMatches = Regex.Matches(tableContent, @"<tr[^>]*>([\s\S]*?)</tr>", RegexOptions.IgnoreCase);
            foreach (Match rowMatch in rowMatches)
            {
                var parsedRow = new List<ParsedCell>();
                var rowContent = rowMatch.Groups[1].Value;
                
                var cellMatches = Regex.Matches(rowContent, @"<(td|th)[^>]*>([\s\S]*?)</\1>", RegexOptions.IgnoreCase);
                foreach (Match cellMatch in cellMatches)
                {
                    var cellTag = cellMatch.Value;
                    var cellContent = cellMatch.Groups[2].Value;
                    
                    int rowspan = 1;
                    var rowspanMatch = Regex.Match(cellTag, @"rowspan\s*=\s*""?(\d+)""?", RegexOptions.IgnoreCase);
                    if (rowspanMatch.Success)
                    {
                        int.TryParse(rowspanMatch.Groups[1].Value, out rowspan);
                    }
                    
                    var textWithBreaks = Regex.Replace(cellContent, @"(?i)<br\s*/?>", "\n");
                    var cleanText = Regex.Replace(textWithBreaks, @"<[^>]+>", "").Trim();
                    cleanText = System.Net.WebUtility.HtmlDecode(cleanText);
                    
                    parsedRow.Add(new ParsedCell
                    {
                        Html = cellContent,
                        Text = cleanText,
                        Rowspan = rowspan
                    });
                }
                if (parsedRow.Count > 0)
                {
                    parsedTable.Rows.Add(parsedRow);
                }
            }
            if (parsedTable.Rows.Count > 0)
            {
                tables.Add(parsedTable);
            }
        }
        return tables;
    }

    private sealed class ParsedTable
    {
        public List<List<ParsedCell>> Rows { get; } = [];
    }

    private sealed class ParsedCell
    {
        public string Html { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public int Rowspan { get; set; } = 1;
    }

    #endregion
}
