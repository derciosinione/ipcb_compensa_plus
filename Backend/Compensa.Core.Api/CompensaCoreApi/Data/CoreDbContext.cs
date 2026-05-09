using CompensaCoreApi.Domain.Assignments;
using CompensaCoreApi.Domain.CompensationRequests;
using CompensaCoreApi.Domain.Classrooms;
using CompensaCoreApi.Domain.Courses;
using Microsoft.EntityFrameworkCore;

namespace CompensaCoreApi.Data;

public sealed class CoreDbContext : DbContext
{
    public CoreDbContext(DbContextOptions<CoreDbContext> options) : base(options)
    {
    }

    public DbSet<CompensationRequest> CompensationRequests => Set<CompensationRequest>();
    public DbSet<Classroom> Classrooms => Set<Classroom>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CurricularUnit> CurricularUnits => Set<CurricularUnit>();
    public DbSet<CurricularUnitComponent> CurricularUnitComponents => Set<CurricularUnitComponent>();
    public DbSet<ClassGroup> ClassGroups => Set<ClassGroup>();
    public DbSet<CourseTeacherAssignment> CourseTeacherAssignments => Set<CourseTeacherAssignment>();
    public DbSet<UserUnitAssignment> UserUnitAssignments => Set<UserUnitAssignment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<CompensationRequest>(entity =>
        {
            entity.ToTable("compensation_requests");

            entity.HasKey(request => request.Id);

            entity.Property(request => request.TeacherUserId)
                .HasMaxLength(128)
                .IsRequired();

            entity.Property(request => request.TeacherName)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(request => request.Course)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(request => request.CurricularUnit)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(request => request.YearGroups)
                .HasColumnType("text[]");

            entity.Property(request => request.ComponentType)
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            entity.Property(request => request.OriginalRoom)
                .HasMaxLength(80)
                .IsRequired();

            entity.Property(request => request.NewRoom)
                .HasMaxLength(80)
                .IsRequired();

            entity.Property(request => request.Justification)
                .HasMaxLength(2000)
                .IsRequired();

            entity.Property(request => request.Status)
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            entity.Property(request => request.DecisionComment)
                .HasMaxLength(2000);

            entity.HasIndex(request => request.Status);
            entity.HasIndex(request => request.TeacherUserId);
            entity.HasIndex(request => request.NewDate);
        });

        modelBuilder.Entity<Classroom>(entity =>
        {
            entity.ToTable("classrooms");

            entity.HasKey(classroom => classroom.Id);

            entity.Property(classroom => classroom.Name)
                .HasMaxLength(80)
                .IsRequired();

            entity.Property(classroom => classroom.Type)
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            entity.Property(classroom => classroom.Features)
                .HasColumnType("text[]");

            entity.HasIndex(classroom => classroom.Name)
                .IsUnique();
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.ToTable("courses");

            entity.HasKey(course => course.Id);

            entity.Property(course => course.Name)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(course => course.Abbreviation)
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(course => course.Type)
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            entity.Property(course => course.Description)
                .HasMaxLength(1000)
                .IsRequired();

            entity.Property(course => course.CoordinatorUserId)
                .HasMaxLength(128);

            entity.Property(course => course.ImageUrl)
                .HasMaxLength(1000)
                .IsRequired();

            entity.HasIndex(course => course.Abbreviation)
                .IsUnique();
        });

        modelBuilder.Entity<CurricularUnit>(entity =>
        {
            entity.ToTable("curricular_units");

            entity.HasKey(unit => unit.Id);

            entity.Property(unit => unit.Name)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(unit => unit.ResponsibleTeacherId)
                .HasMaxLength(128)
                .IsRequired();

            entity.Property(unit => unit.ResponsibleTeacherEmail)
                .HasMaxLength(256)
                .IsRequired();

            entity.HasIndex(unit => new { unit.CourseId, unit.Name })
                .IsUnique();
        });

        modelBuilder.Entity<CurricularUnitComponent>(entity =>
        {
            entity.ToTable("curricular_unit_components");

            entity.HasKey(component => component.Id);

            entity.Property(component => component.Name)
                .HasMaxLength(120)
                .IsRequired();

            entity.Property(component => component.Type)
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            entity.Property(component => component.ResponsibleTeacherId)
                .HasMaxLength(128)
                .IsRequired();

            entity.Property(component => component.ResponsibleTeacherEmail)
                .HasMaxLength(256)
                .IsRequired();

            entity.HasIndex(component => new { component.CurricularUnitId, component.Type, component.Name })
                .IsUnique();
        });

        modelBuilder.Entity<ClassGroup>(entity =>
        {
            entity.ToTable("class_groups");

            entity.HasKey(group => group.Id);

            entity.Property(group => group.Name)
                .HasMaxLength(80)
                .IsRequired();

            entity.Property(group => group.TeacherId)
                .HasMaxLength(128)
                .IsRequired();

            entity.HasIndex(group => new { group.CurricularUnitId, group.Name })
                .IsUnique();
        });

        modelBuilder.Entity<UserUnitAssignment>(entity =>
        {
            entity.ToTable("user_unit_assignments");

            entity.HasKey(assignment => assignment.Id);

            entity.Property(assignment => assignment.UserId)
                .HasMaxLength(128)
                .IsRequired();

            entity.Property(assignment => assignment.UserEmail)
                .HasMaxLength(256)
                .IsRequired();

            entity.HasIndex(assignment => assignment.UserId);
            entity.HasIndex(assignment => new { assignment.UserId, assignment.CurricularUnitId })
                .IsUnique();
        });

        modelBuilder.Entity<CourseTeacherAssignment>(entity =>
        {
            entity.ToTable("course_teacher_assignments");

            entity.HasKey(assignment => assignment.Id);

            entity.Property(assignment => assignment.UserId)
                .HasMaxLength(128)
                .IsRequired();

            entity.Property(assignment => assignment.UserEmail)
                .HasMaxLength(256)
                .IsRequired();

            entity.HasIndex(assignment => assignment.UserId);
            entity.HasIndex(assignment => new { assignment.UserId, assignment.CourseId })
                .IsUnique();
        });
    }
}
