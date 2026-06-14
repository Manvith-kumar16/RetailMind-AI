using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RetailMind.API.Models.Inventory;

namespace RetailMind.API.Data.Configurations;

public sealed class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.ToTable("suppliers");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Email)
            .HasMaxLength(256);

        builder.Property(s => s.Phone)
            .HasMaxLength(30);

        builder.Property(s => s.Address)
            .HasMaxLength(500);

        builder.Property(s => s.ContactPerson)
            .HasMaxLength(100);

        builder.Property(s => s.Website)
            .HasMaxLength(300);

        builder.Property(s => s.Notes)
            .HasMaxLength(2000);

        // ── Indexes ───────────────────────────────────────────────────────────
        builder.HasIndex(s => s.Name)
            .HasDatabaseName("ix_suppliers_name");

        builder.HasIndex(s => s.Email)
            .HasDatabaseName("ix_suppliers_email");

        builder.HasIndex(s => s.IsDeleted)
            .HasDatabaseName("ix_suppliers_is_deleted");

        // ── Soft-delete filter ─────────────────────────────────────────────────
        builder.HasQueryFilter(s => !s.IsDeleted);
    }
}
