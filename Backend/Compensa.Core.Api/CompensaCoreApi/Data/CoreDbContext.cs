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
    public DbSet<ClassGroup> ClassGroups => Set<ClassGroup>();

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

            entity.Property(unit => unit.TeacherIds)
                .HasColumnType("text[]");

            entity.Property(unit => unit.RegentId)
                .HasMaxLength(128);

            entity.Property(unit => unit.TheoreticalTeacherId)
                .HasMaxLength(128);

            entity.Property(unit => unit.PracticalTeacherId)
                .HasMaxLength(128);

            entity.Property(unit => unit.Component)
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            entity.HasIndex(unit => new { unit.CourseId, unit.Name })
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
    }
}
