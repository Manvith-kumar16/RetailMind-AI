using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RetailMind.API.Models.Employees;

namespace RetailMind.API.Data.Configurations;

public sealed class WorkLogConfiguration : IEntityTypeConfiguration<WorkLog>
{
    public void Configure(EntityTypeBuilder<WorkLog> builder)
    {
        builder.ToTable("work_logs");
        builder.HasKey(w => w.Id);

        builder.Property(w => w.Notes).HasMaxLength(500);

        // Establish the relationship between WorkLog and Employee
        builder.HasOne(w => w.Employee)
            .WithMany(e => e.WorkLogs)
            .HasForeignKey(w => w.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        // One log per employee per day
        builder.HasIndex(w => new { w.EmployeeId, w.Date }).IsUnique();

        builder.HasQueryFilter(w => !w.IsDeleted);
    }
}
