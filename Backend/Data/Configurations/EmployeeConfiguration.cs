using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RetailMind.API.Models.Employees;

namespace RetailMind.API.Data.Configurations;

public sealed class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("employees");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.LastName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Email).IsRequired().HasMaxLength(256);
        builder.Property(e => e.Phone).HasMaxLength(30);
        
        builder.Property(e => e.Salary).HasColumnType("numeric(18,2)");

        // Ignore computed properties
        builder.Ignore(e => e.FullName);

        // Indexes
        builder.HasIndex(e => e.Email).IsUnique();

        // Soft-delete
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
