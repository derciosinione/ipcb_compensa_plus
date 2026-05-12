using CompensaCoreApi.Domain.Audit;
using CompensaCoreApi.Domain.Assignments;
using CompensaCoreApi.Domain.AcademicYears;
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
    public DbSet<AcademicYear> AcademicYears => Set<AcademicYear>();
    public DbSet<Classroom> Classrooms => Set<Classroom>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CurricularUnit> CurricularUnits => Set<CurricularUnit>();
    public DbSet<CurricularUnitComponent> CurricularUnitComponents => Set<CurricularUnitComponent>();
    public DbSet<ClassGroup> ClassGroups => Set<ClassGroup>();
    public DbSet<ClassSchedule> ClassSchedules => Set<ClassSchedule>();
    public DbSet<CourseTeacherAssignment> CourseTeacherAssignments => Set<CourseTeacherAssignment>();
    public DbSet<UserUnitAssignment> UserUnitAssignments => Set<UserUnitAssignment>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.EntityName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.EntityId).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Action).HasMaxLength(50).IsRequired();
            entity.Property(e => e.ActorUserId).HasMaxLength(128).IsRequired();
            entity.Property(e => e.PreviousState).HasColumnType("jsonb");
            entity.Property(e => e.NewState).HasColumnType("jsonb");
            
            entity.HasIndex(e => e.EntityName);
            entity.HasIndex(e => e.EntityId);
            entity.HasIndex(e => e.ActorUserId);
            entity.HasIndex(e => e.CreatedAt);
        });

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

            entity.Property(request => request.Semester)
                .HasDefaultValue(0);

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
            entity.HasIndex(request => request.AcademicYearId);
            entity.HasIndex(request => request.CourseId);
            entity.HasIndex(request => request.CurricularUnitId);
            entity.HasIndex(request => request.ClassGroupId);
            entity.HasIndex(request => request.OriginalClassScheduleId);
            entity.HasIndex(request => request.NewClassroomId);
            entity.HasIndex(request => request.NewDate);

            entity.HasOne<AcademicYear>()
                .WithMany()
                .HasForeignKey(request => request.AcademicYearId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne<Course>()
                .WithMany()
                .HasForeignKey(request => request.CourseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne<CurricularUnit>()
                .WithMany()
                .HasForeignKey(request => request.CurricularUnitId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne<ClassGroup>()
                .WithMany()
                .HasForeignKey(request => request.ClassGroupId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne<ClassSchedule>()
                .WithMany()
                .HasForeignKey(request => request.OriginalClassScheduleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne<Classroom>()
                .WithMany()
                .HasForeignKey(request => request.OriginalClassroomId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne<Classroom>()
                .WithMany()
                .HasForeignKey(request => request.NewClassroomId)
                .OnDelete(DeleteBehavior.Restrict);
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

        modelBuilder.Entity<AcademicYear>(entity =>
        {
            entity.ToTable("academic_years");

            entity.HasKey(academicYear => academicYear.Id);

            entity.Property(academicYear => academicYear.Name)
                .HasMaxLength(20)
                .IsRequired();

            entity.HasIndex(academicYear => academicYear.Name)
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

            entity.HasOne<Course>()
                .WithMany()
                .HasForeignKey(unit => unit.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
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

            entity.HasOne<Course>()
                .WithMany()
                .HasForeignKey(component => component.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<CurricularUnit>()
                .WithMany()
                .HasForeignKey(component => component.CurricularUnitId)
                .OnDelete(DeleteBehavior.Cascade);
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

            entity.HasOne<Course>()
                .WithMany()
                .HasForeignKey(group => group.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<CurricularUnit>()
                .WithMany()
                .HasForeignKey(group => group.CurricularUnitId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ClassSchedule>(entity =>
        {
            entity.ToTable("class_schedules");

            entity.HasKey(schedule => schedule.Id);

            entity.Property(schedule => schedule.ComponentType)
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            entity.HasIndex(schedule => schedule.AcademicYearId);
            entity.HasIndex(schedule => schedule.ClassGroupId);
            entity.HasIndex(schedule => new { schedule.AcademicYearId, schedule.Semester, schedule.ClassroomId, schedule.DayOfWeek, schedule.StartTime, schedule.EndTime });

            entity.HasOne<Course>()
                .WithMany()
                .HasForeignKey(schedule => schedule.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<CurricularUnit>()
                .WithMany()
                .HasForeignKey(schedule => schedule.CurricularUnitId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<ClassGroup>()
                .WithMany()
                .HasForeignKey(schedule => schedule.ClassGroupId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<AcademicYear>()
                .WithMany()
                .HasForeignKey(schedule => schedule.AcademicYearId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne<Classroom>()
                .WithMany()
                .HasForeignKey(schedule => schedule.ClassroomId)
                .OnDelete(DeleteBehavior.Restrict);
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

            entity.HasOne<Course>()
                .WithMany()
                .HasForeignKey(assignment => assignment.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<CurricularUnit>()
                .WithMany()
                .HasForeignKey(assignment => assignment.CurricularUnitId)
                .OnDelete(DeleteBehavior.Cascade);
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

            entity.HasOne<Course>()
                .WithMany()
                .HasForeignKey(assignment => assignment.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
