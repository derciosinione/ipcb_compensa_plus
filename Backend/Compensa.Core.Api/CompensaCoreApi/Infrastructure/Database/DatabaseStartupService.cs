using CompensaCoreApi.Data;
using CompensaCoreApi.Domain.Courses;
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

        await context.Database.EnsureCreatedAsync(cancellationToken);
        await EnsureClassroomsTableAsync(context, cancellationToken);
        await EnsureCoursesTableAsync(context, cancellationToken);
        await EnsureCourseDetailsTablesAsync(context, cancellationToken);
        await SeedClassroomsAsync(context, cancellationToken);
        await SeedCoursesAsync(context, cancellationToken);
        await SeedCourseDetailsAsync(context, cancellationToken);
        _logger.LogInformation("Core database schema is ready.");
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

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
                "TeacherIds" text[] not null default ARRAY[]::text[],
                "RegentId" varchar(128) null,
                "TheoreticalTeacherId" varchar(128) null,
                "PracticalTeacherId" varchar(128) null,
                "Component" varchar(32) not null,
                "IsActive" boolean not null default true,
                "CreatedAt" timestamp with time zone not null,
                "UpdatedAt" timestamp with time zone not null,
                constraint "FK_curricular_units_courses_CourseId" foreign key ("CourseId") references courses ("Id") on delete cascade
            );
            create unique index if not exists "IX_curricular_units_CourseId_Name" on curricular_units ("CourseId", "Name");
            create index if not exists "IX_curricular_units_CourseId" on curricular_units ("CourseId");

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
                    TeacherIds = ["t1", "t2", "u1"],
                    RegentId = "t1",
                    TheoreticalTeacherId = "t1",
                    PracticalTeacherId = "u1",
                    Component = UnitComponentType.All,
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
                    TeacherIds = ["t3", "u1"],
                    RegentId = "t3",
                    TheoreticalTeacherId = "t3",
                    PracticalTeacherId = "u1",
                    Component = UnitComponentType.All,
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
                    TeacherIds = ["t1"],
                    RegentId = "t1",
                    TheoreticalTeacherId = "t1",
                    PracticalTeacherId = "t1",
                    Component = UnitComponentType.All,
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
                    TeacherIds = ["t1", "t4"],
                    RegentId = "t4",
                    TheoreticalTeacherId = "t4",
                    PracticalTeacherId = "t1",
                    Component = UnitComponentType.All,
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
                    TeacherIds = ["t1", "t2", "t5"],
                    RegentId = "t5",
                    TheoreticalTeacherId = "t5",
                    PracticalTeacherId = "t2",
                    Component = UnitComponentType.All,
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
                    TeacherIds = ["t5"],
                    RegentId = "t5",
                    TheoreticalTeacherId = "t5",
                    PracticalTeacherId = "t5",
                    Component = UnitComponentType.All,
                    CreatedAt = now,
                    UpdatedAt = now
                });

            await context.SaveChangesAsync(cancellationToken);
        }

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
