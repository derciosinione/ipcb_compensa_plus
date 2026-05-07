using CompensaCoreApi.Domain.CompensationRequests;
using Microsoft.EntityFrameworkCore;

namespace CompensaCoreApi.Data;

public sealed class CoreDbContext : DbContext
{
    public CoreDbContext(DbContextOptions<CoreDbContext> options) : base(options)
    {
    }

    public DbSet<CompensationRequest> CompensationRequests => Set<CompensationRequest>();

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
    }
}
