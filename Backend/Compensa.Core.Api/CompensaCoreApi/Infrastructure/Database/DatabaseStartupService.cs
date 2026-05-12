using CompensaCoreApi.Data;
using CompensaCoreApi.Domain.AcademicYears;
using CompensaCoreApi.Domain.Courses;
using System.Data;
using Microsoft.EntityFrameworkCore;

namespace CompensaCoreApi.Infrastructure.Database;

public sealed class DatabaseStartupService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DatabaseStartupService> _logger;

    public DatabaseStartupService(IServiceProvider serviceProvider, ILogger<DatabaseStartupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<CoreDbContext>();

        await ApplyMigrationsOrUseLegacySchemaAsync(context, cancellationToken);
        await EnsureAcademicYearsTableAsync(context, cancellationToken);
        await EnsureClassroomsTableAsync(context, cancellationToken);
        await EnsureCoursesTableAsync(context, cancellationToken);
        await SeedAcademicYearsAsync(context, cancellationToken);
        await EnsureCourseDetailsTablesAsync(context, cancellationToken);
        await EnsureCompensationRequestsSchemaAsync(context, cancellationToken);
        await EnsureUserAssignmentsTableAsync(context, cancellationToken);
        await SeedClassroomsAsync(context, cancellationToken);
        await SeedCoursesAsync(context, cancellationToken);
        await SeedCourseDetailsAsync(context, cancellationToken);
        _logger.LogInformation("Core database schema is ready.");
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private async Task ApplyMigrationsOrUseLegacySchemaAsync(CoreDbContext context, CancellationToken cancellationToken)
    {
        var hasMigrationHistory = await TableExistsAsync(context, "__EFMigrationsHistory", cancellationToken);
        var hasLegacySchema = await TableExistsAsync(context, "courses", cancellationToken);

        if (hasMigrationHistory || !hasLegacySchema)
        {
            await context.Database.MigrateAsync(cancellationToken);
            return;
        }

        _logger.LogWarning(
            "Core database already has tables without EF migration history. Keeping legacy schema compatibility path.");
    }

    private static async Task<bool> TableExistsAsync(
        CoreDbContext context,
        string tableName,
        CancellationToken cancellationToken)
    {
        var connection = context.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync(cancellationToken);
        }

        await using var command = connection.CreateCommand();
        command.CommandText = "select to_regclass(@tableName) is not null";
        var parameter = command.CreateParameter();
        parameter.ParameterName = "tableName";
        parameter.Value = "public.\"" + tableName.Replace("\"", "\"\"") + "\"";
        command.Parameters.Add(parameter);

        var result = await command.ExecuteScalarAsync(cancellationToken);
        return result is true;
    }

    private static async Task EnsureAcademicYearsTableAsync(CoreDbContext context, CancellationToken cancellationToken)
    {
        await context.Database.ExecuteSqlRawAsync(
            """
            create table if not exists academic_years (
                "Id" uuid primary key,
                "Name" varchar(20) not null,
                "StartsOn" date not null,
                "EndsOn" date not null,
                "IsActive" boolean not null default false,
                "CreatedAt" timestamp with time zone not null,
                "UpdatedAt" timestamp with time zone not null
            );
            create unique index if not exists "IX_academic_years_Name" on academic_years ("Name");
            create unique index if not exists "IX_academic_years_Active" on academic_years ("IsActive") where "IsActive" = true;
            """,
            cancellationToken);
    }

    private static async Task SeedAcademicYearsAsync(CoreDbContext context, CancellationToken cancellationToken)
    {
        if (await context.AcademicYears.AnyAsync(year => year.IsActive, cancellationToken))
            return;

        var now = DateTimeOffset.UtcNow;
        var defaultAcademicYear = await context.AcademicYears
            .FirstOrDefaultAsync(year => year.Name == "2025/26", cancellationToken);

        if (defaultAcademicYear is null)
        {
            context.AcademicYears.Add(new AcademicYear
            {
                Name = "2025/26",
                StartsOn = new DateOnly(2025, 9, 1),
                EndsOn = new DateOnly(2026, 8, 31),
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
        else
        {
            defaultAcademicYear.IsActive = true;
            defaultAcademicYear.UpdatedAt = now;
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureClassroomsTableAsync(CoreDbContext context, CancellationToken cancellationToken)
    {
        await context.Database.ExecuteSqlRawAsync(
            """
            create table if not exists classrooms (
                "Id" uuid primary key,
                "Name" varchar(80) not null,
                "Type" varchar(32) not null,
                "Capacity" integer not null,
                "Features" text[] not null default ARRAY[]::text[],
                "IsActive" boolean not null default true,
                "CreatedAt" timestamp with time zone not null,
                "UpdatedAt" timestamp with time zone not null
            );
            create unique index if not exists "IX_classrooms_Name" on classrooms ("Name");
            """,
            cancellationToken);
    }

    private static async Task SeedClassroomsAsync(CoreDbContext context, CancellationToken cancellationToken)
    {
        if (await context.Classrooms.AnyAsync(cancellationToken))
            return;

        var now = DateTimeOffset.UtcNow;
        context.Classrooms.AddRange(
            new()
            {
                Name = "C1.01",
                Type = Domain.Classrooms.ClassroomType.Amphitheater,
                Capacity = 120,
                Features = ["Projector", "Microphone"],
                CreatedAt = now,
                UpdatedAt = now
            },
            new()
            {
                Name = "C1.02",
                Type = Domain.Classrooms.ClassroomType.Standard,
                Capacity = 40,
                Features = ["Projector", "Whiteboard"],
                CreatedAt = now,
                UpdatedAt = now
            },
            new()
            {
                Name = "C2.05",
                Type = Domain.Classrooms.ClassroomType.Standard,
                Capacity = 35,
                Features = ["TV", "Whiteboard"],
                CreatedAt = now,
                UpdatedAt = now
            },
            new()
            {
                Name = "Lab 1",
                Type = Domain.Classrooms.ClassroomType.PcLab,
                Capacity = 25,
                Features = ["25 PCs", "Projector"],
                CreatedAt = now,
                UpdatedAt = now
            },
            new()
            {
                Name = "Lab 3",
                Type = Domain.Classrooms.ClassroomType.PcLab,
                Capacity = 30,
                Features = ["30 PCs", "Projector"],
                CreatedAt = now,
                UpdatedAt = now
            },
            new()
            {
                Name = "Lab 4",
                Type = Domain.Classrooms.ClassroomType.MacLab,
                Capacity = 20,
                Features = ["20 iMacs", "Projector"],
                CreatedAt = now,
                UpdatedAt = now
            });

        await context.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureCoursesTableAsync(CoreDbContext context, CancellationToken cancellationToken)
    {
        await context.Database.ExecuteSqlRawAsync(
            """
            create table if not exists courses (
                "Id" uuid primary key,
                "Name" varchar(200) not null,
                "Abbreviation" varchar(20) not null,
                "Type" varchar(32) not null,
                "Description" varchar(1000) not null,
                "DurationYears" integer not null,
                "TotalCredits" integer not null,
                "CoordinatorUserId" varchar(128) null,
                "ImageUrl" varchar(1000) not null,
                "IsActive" boolean not null default true,
                "CreatedAt" timestamp with time zone not null,
                "UpdatedAt" timestamp with time zone not null
            );
            create unique index if not exists "IX_courses_Abbreviation" on courses ("Abbreviation");
            """,
            cancellationToken);
    }

    private static async Task SeedCoursesAsync(CoreDbContext context, CancellationToken cancellationToken)
    {
        if (await context.Courses.AnyAsync(cancellationToken))
            return;

        var now = DateTimeOffset.UtcNow;
        context.Courses.AddRange(
            new Course
            {
                Name = "Computer Science Engineering",
                Abbreviation = "LEI",
                Type = CourseDegreeType.Licenciatura,
                Description = "A comprehensive degree focused on software engineering, algorithms, and systems architecture.",
                DurationYears = 3,
                TotalCredits = 180,
                CoordinatorUserId = "user-coord-1",
                ImageUrl = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop",
                CreatedAt = now,
                UpdatedAt = now
            },
            new Course
            {
                Name = "Digital Design",
                Abbreviation = "LD",
                Type = CourseDegreeType.Licenciatura,
                Description = "Focuses on user interface design, user experience, and visual communication.",
                DurationYears = 3,
                TotalCredits = 180,
                CoordinatorUserId = "user-coord-1",
                ImageUrl = "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=1000&auto=format&fit=crop",
                CreatedAt = now,
                UpdatedAt = now
            });

        await context.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureCourseDetailsTablesAsync(CoreDbContext context, CancellationToken cancellationToken)
    {
        await context.Database.ExecuteSqlRawAsync(
            """
            create table if not exists curricular_units (
                "Id" uuid primary key,
                "CourseId" uuid not null,
                "Name" varchar(200) not null,
                "Year" integer not null,
                "Semester" integer not null,
                "Ects" integer not null,
                "ResponsibleTeacherId" varchar(128) not null default '',
                "ResponsibleTeacherEmail" varchar(256) not null default '',
                "IsActive" boolean not null default true,
                "CreatedAt" timestamp with time zone not null,
                "UpdatedAt" timestamp with time zone not null,
                constraint "FK_curricular_units_courses_CourseId" foreign key ("CourseId") references courses ("Id") on delete cascade
            );
            alter table curricular_units add column if not exists "ResponsibleTeacherId" varchar(128) not null default '';
            alter table curricular_units add column if not exists "ResponsibleTeacherEmail" varchar(256) not null default '';
            create unique index if not exists "IX_curricular_units_CourseId_Name" on curricular_units ("CourseId", "Name");
            create index if not exists "IX_curricular_units_CourseId" on curricular_units ("CourseId");

            create table if not exists curricular_unit_components (
                "Id" uuid primary key,
                "CourseId" uuid not null,
                "CurricularUnitId" uuid not null,
                "Name" varchar(120) not null,
                "Type" varchar(32) not null,
                "ResponsibleTeacherId" varchar(128) not null,
                "ResponsibleTeacherEmail" varchar(256) not null,
                "IsActive" boolean not null default true,
                "CreatedAt" timestamp with time zone not null,
                "UpdatedAt" timestamp with time zone not null,
                constraint "FK_curricular_unit_components_courses_CourseId" foreign key ("CourseId") references courses ("Id") on delete cascade,
                constraint "FK_curricular_unit_components_curricular_units_CurricularUnitId" foreign key ("CurricularUnitId") references curricular_units ("Id") on delete cascade
            );
            create unique index if not exists "IX_curricular_unit_components_CurricularUnitId_Type_Name" on curricular_unit_components ("CurricularUnitId", "Type", "Name");
            create index if not exists "IX_curricular_unit_components_CourseId" on curricular_unit_components ("CourseId");

            create table if not exists class_groups (
                "Id" uuid primary key,
                "CourseId" uuid not null,
                "CurricularUnitId" uuid not null,
                "Name" varchar(80) not null,
                "TeacherId" varchar(128) not null,
                "IsActive" boolean not null default true,
                "CreatedAt" timestamp with time zone not null,
                "UpdatedAt" timestamp with time zone not null,
                constraint "FK_class_groups_courses_CourseId" foreign key ("CourseId") references courses ("Id") on delete cascade,
                constraint "FK_class_groups_curricular_units_CurricularUnitId" foreign key ("CurricularUnitId") references curricular_units ("Id") on delete cascade
            );
            create unique index if not exists "IX_class_groups_CurricularUnitId_Name" on class_groups ("CurricularUnitId", "Name");
            create index if not exists "IX_class_groups_CourseId" on class_groups ("CourseId");

            create table if not exists class_schedules (
                "Id" uuid primary key,
                "CourseId" uuid not null,
                "CurricularUnitId" uuid not null,
                "ClassGroupId" uuid not null,
                "AcademicYearId" uuid not null,
                "Semester" integer not null default 1,
                "ComponentType" varchar(32) not null,
                "DayOfWeek" integer not null,
                "StartTime" time without time zone not null,
                "EndTime" time without time zone not null,
                "ClassroomId" uuid not null,
                "IsActive" boolean not null default true,
                "CreatedAt" timestamp with time zone not null,
                "UpdatedAt" timestamp with time zone not null,
                constraint "FK_class_schedules_courses_CourseId" foreign key ("CourseId") references courses ("Id") on delete cascade,
                constraint "FK_class_schedules_curricular_units_CurricularUnitId" foreign key ("CurricularUnitId") references curricular_units ("Id") on delete cascade,
                constraint "FK_class_schedules_class_groups_ClassGroupId" foreign key ("ClassGroupId") references class_groups ("Id") on delete cascade,
                constraint "FK_class_schedules_academic_years_AcademicYearId" foreign key ("AcademicYearId") references academic_years ("Id") on delete restrict,
                constraint "FK_class_schedules_classrooms_ClassroomId" foreign key ("ClassroomId") references classrooms ("Id") on delete restrict
            );
            alter table class_schedules add column if not exists "AcademicYearId" uuid null;
            alter table class_schedules add column if not exists "Semester" integer not null default 1;
            create index if not exists "IX_class_schedules_ClassGroupId" on class_schedules ("ClassGroupId");
            create index if not exists "IX_class_schedules_AcademicYearId" on class_schedules ("AcademicYearId");
            create index if not exists "IX_class_schedules_AcademicYearId_Semester_ClassroomId_DayOfWeek_StartTime_EndTime" on class_schedules ("AcademicYearId", "Semester", "ClassroomId", "DayOfWeek", "StartTime", "EndTime");
            """,
            cancellationToken);

        var activeAcademicYearId = await context.AcademicYears
            .Where(year => year.IsActive)
            .Select(year => year.Id)
            .FirstAsync(cancellationToken);

        await context.Database.ExecuteSqlInterpolatedAsync(
            $"""
            update class_schedules set "AcademicYearId" = {activeAcademicYearId} where "AcademicYearId" is null;
            alter table class_schedules alter column "AcademicYearId" set not null;
            """,
            cancellationToken);
    }

    private static async Task EnsureUserAssignmentsTableAsync(CoreDbContext context, CancellationToken cancellationToken)
    {
        await context.Database.ExecuteSqlRawAsync(
            """
            create table if not exists user_unit_assignments (
                "Id" uuid primary key,
                "UserId" varchar(128) not null,
                "UserEmail" varchar(256) not null,
                "CourseId" uuid not null,
                "CurricularUnitId" uuid not null,
                "IsResponsible" boolean not null default false,
                "CreatedAt" timestamp with time zone not null,
                "UpdatedAt" timestamp with time zone not null,
                constraint "FK_user_unit_assignments_courses_CourseId" foreign key ("CourseId") references courses ("Id") on delete cascade,
                constraint "FK_user_unit_assignments_curricular_units_CurricularUnitId" foreign key ("CurricularUnitId") references curricular_units ("Id") on delete cascade
            );
            alter table user_unit_assignments add column if not exists "IsResponsible" boolean not null default false;
            create index if not exists "IX_user_unit_assignments_UserId" on user_unit_assignments ("UserId");
            create unique index if not exists "IX_user_unit_assignments_UserId_CurricularUnitId" on user_unit_assignments ("UserId", "CurricularUnitId");

            create table if not exists course_teacher_assignments (
                "Id" uuid primary key,
                "UserId" varchar(128) not null,
                "UserEmail" varchar(256) not null,
                "CourseId" uuid not null,
                "IsCoordinator" boolean not null default false,
                "CreatedAt" timestamp with time zone not null,
                "UpdatedAt" timestamp with time zone not null,
                constraint "FK_course_teacher_assignments_courses_CourseId" foreign key ("CourseId") references courses ("Id") on delete cascade
            );
            create index if not exists "IX_course_teacher_assignments_UserId" on course_teacher_assignments ("UserId");
            create unique index if not exists "IX_course_teacher_assignments_UserId_CourseId" on course_teacher_assignments ("UserId", "CourseId");
            """,
            cancellationToken);
    }

    private static async Task EnsureCompensationRequestsSchemaAsync(CoreDbContext context, CancellationToken cancellationToken)
    {
        await context.Database.ExecuteSqlRawAsync(
            """
            alter table compensation_requests add column if not exists "AcademicYearId" uuid null;
            alter table compensation_requests add column if not exists "Semester" integer not null default 0;
            alter table compensation_requests add column if not exists "CourseId" uuid null;
            alter table compensation_requests add column if not exists "CurricularUnitId" uuid null;
            alter table compensation_requests add column if not exists "ClassGroupId" uuid null;
            alter table compensation_requests add column if not exists "OriginalClassScheduleId" uuid null;
            alter table compensation_requests add column if not exists "OriginalClassroomId" uuid null;
            alter table compensation_requests add column if not exists "NewClassroomId" uuid null;

            create index if not exists "IX_compensation_requests_AcademicYearId" on compensation_requests ("AcademicYearId");
            create index if not exists "IX_compensation_requests_CourseId" on compensation_requests ("CourseId");
            create index if not exists "IX_compensation_requests_CurricularUnitId" on compensation_requests ("CurricularUnitId");
            create index if not exists "IX_compensation_requests_ClassGroupId" on compensation_requests ("ClassGroupId");
            create index if not exists "IX_compensation_requests_OriginalClassScheduleId" on compensation_requests ("OriginalClassScheduleId");
            create index if not exists "IX_compensation_requests_NewClassroomId" on compensation_requests ("NewClassroomId");

            do $$
            begin
                if not exists (select 1 from pg_constraint where conname = 'FK_compensation_requests_academic_years_AcademicYearId') then
                    alter table compensation_requests add constraint "FK_compensation_requests_academic_years_AcademicYearId" foreign key ("AcademicYearId") references academic_years ("Id") on delete restrict;
                end if;

                if not exists (select 1 from pg_constraint where conname = 'FK_compensation_requests_courses_CourseId') then
                    alter table compensation_requests add constraint "FK_compensation_requests_courses_CourseId" foreign key ("CourseId") references courses ("Id") on delete restrict;
                end if;

                if not exists (select 1 from pg_constraint where conname = 'FK_compensation_requests_curricular_units_CurricularUnitId') then
                    alter table compensation_requests add constraint "FK_compensation_requests_curricular_units_CurricularUnitId" foreign key ("CurricularUnitId") references curricular_units ("Id") on delete restrict;
                end if;

                if not exists (select 1 from pg_constraint where conname = 'FK_compensation_requests_class_groups_ClassGroupId') then
                    alter table compensation_requests add constraint "FK_compensation_requests_class_groups_ClassGroupId" foreign key ("ClassGroupId") references class_groups ("Id") on delete restrict;
                end if;

                if not exists (select 1 from pg_constraint where conname = 'FK_compensation_requests_class_schedules_OriginalClassScheduleId') then
                    alter table compensation_requests add constraint "FK_compensation_requests_class_schedules_OriginalClassScheduleId" foreign key ("OriginalClassScheduleId") references class_schedules ("Id") on delete restrict;
                end if;

                if not exists (select 1 from pg_constraint where conname = 'FK_compensation_requests_classrooms_OriginalClassroomId') then
                    alter table compensation_requests add constraint "FK_compensation_requests_classrooms_OriginalClassroomId" foreign key ("OriginalClassroomId") references classrooms ("Id") on delete restrict;
                end if;

                if not exists (select 1 from pg_constraint where conname = 'FK_compensation_requests_classrooms_NewClassroomId') then
                    alter table compensation_requests add constraint "FK_compensation_requests_classrooms_NewClassroomId" foreign key ("NewClassroomId") references classrooms ("Id") on delete restrict;
                end if;
            end $$;
            """,
            cancellationToken);
    }

    private static async Task SeedCourseDetailsAsync(CoreDbContext context, CancellationToken cancellationToken)
    {
        var lei = await context.Courses.FirstOrDefaultAsync(course => course.Abbreviation == "LEI", cancellationToken);
        var ld = await context.Courses.FirstOrDefaultAsync(course => course.Abbreviation == "LD", cancellationToken);

        if (lei == null || ld == null)
            return;

        var now = DateTimeOffset.UtcNow;

        if (!await context.CurricularUnits.AnyAsync(cancellationToken))
        {
            context.CurricularUnits.AddRange(
                new CurricularUnit
                {
                    CourseId = lei.Id,
                    Name = "Programming Fundamentals",
                    Year = 1,
                    Semester = 1,
                    Ects = 6,
                    ResponsibleTeacherId = "t1",
                    ResponsibleTeacherEmail = "dercio.domingos@ipcbcampus.pt",
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new CurricularUnit
                {
                    CourseId = lei.Id,
                    Name = "Mathematics I",
                    Year = 1,
                    Semester = 1,
                    Ects = 6,
                    ResponsibleTeacherId = "t3",
                    ResponsibleTeacherEmail = "monicac@ipcb.pt",
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new CurricularUnit
                {
                    CourseId = lei.Id,
                    Name = "Software Architecture",
                    Year = 2,
                    Semester = 1,
                    Ects = 6,
                    ResponsibleTeacherId = "t1",
                    ResponsibleTeacherEmail = "dercio.domingos@ipcbcampus.pt",
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new CurricularUnit
                {
                    CourseId = lei.Id,
                    Name = "Web Development",
                    Year = 2,
                    Semester = 2,
                    Ects = 6,
                    ResponsibleTeacherId = "t4",
                    ResponsibleTeacherEmail = "matias@ipcb.pt",
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new CurricularUnit
                {
                    CourseId = lei.Id,
                    Name = "Final Project",
                    Year = 3,
                    Semester = 2,
                    Ects = 15,
                    ResponsibleTeacherId = "t5",
                    ResponsibleTeacherEmail = "matias@ipcb.pt",
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new CurricularUnit
                {
                    CourseId = ld.Id,
                    Name = "Design Principles",
                    Year = 1,
                    Semester = 1,
                    Ects = 6,
                    ResponsibleTeacherId = "t5",
                    ResponsibleTeacherEmail = "matias@ipcb.pt",
                    CreatedAt = now,
                    UpdatedAt = now
                });

            await context.SaveChangesAsync(cancellationToken);
        }

        var units = await context.CurricularUnits
            .Where(unit => unit.CourseId == lei.Id || unit.CourseId == ld.Id)
            .ToArrayAsync(cancellationToken);

        foreach (var unit in units.Where(unit => string.IsNullOrWhiteSpace(unit.ResponsibleTeacherId)))
        {
            var (responsibleId, responsibleEmail) = unit.Name switch
            {
                "Mathematics I" => ("t3", "monicac@ipcb.pt"),
                "Web Development" => ("t4", "matias@ipcb.pt"),
                "Final Project" => ("t5", "matias@ipcb.pt"),
                "Design Principles" => ("t5", "matias@ipcb.pt"),
                _ => ("t1", "dercio.domingos@ipcbcampus.pt")
            };

            unit.ResponsibleTeacherId = responsibleId;
            unit.ResponsibleTeacherEmail = responsibleEmail;
            unit.UpdatedAt = now;
        }

        if (!await context.CurricularUnitComponents.AnyAsync(cancellationToken))
        {
            foreach (var unit in units)
            {
                context.CurricularUnitComponents.AddRange(
                    new CurricularUnitComponent
                    {
                        CourseId = unit.CourseId,
                        CurricularUnitId = unit.Id,
                        Name = "Theoretical",
                        Type = UnitComponentType.Theoretical,
                        ResponsibleTeacherId = unit.ResponsibleTeacherId,
                        ResponsibleTeacherEmail = unit.ResponsibleTeacherEmail,
                        CreatedAt = now,
                        UpdatedAt = now
                    },
                    new CurricularUnitComponent
                    {
                        CourseId = unit.CourseId,
                        CurricularUnitId = unit.Id,
                        Name = "Practical",
                        Type = UnitComponentType.Practical,
                        ResponsibleTeacherId = unit.ResponsibleTeacherId,
                        ResponsibleTeacherEmail = unit.ResponsibleTeacherEmail,
                        CreatedAt = now,
                        UpdatedAt = now
                    });
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        if (await context.ClassGroups.AnyAsync(cancellationToken))
            return;

        var architecture = await context.CurricularUnits.FirstOrDefaultAsync(
            unit => unit.CourseId == lei.Id && unit.Name == "Software Architecture",
            cancellationToken);

        if (architecture == null)
            return;

        context.ClassGroups.AddRange(
            new ClassGroup
            {
                CourseId = lei.Id,
                CurricularUnitId = architecture.Id,
                Name = "Class A",
                TeacherId = "u1",
                CreatedAt = now,
                UpdatedAt = now
            },
            new ClassGroup
            {
                CourseId = lei.Id,
                CurricularUnitId = architecture.Id,
                Name = "PL1",
                TeacherId = "u1",
                CreatedAt = now,
                UpdatedAt = now
            },
            new ClassGroup
            {
                CourseId = lei.Id,
                CurricularUnitId = architecture.Id,
                Name = "PL2",
                TeacherId = "t5",
                CreatedAt = now,
                UpdatedAt = now
            });

        await context.SaveChangesAsync(cancellationToken);
    }
}
