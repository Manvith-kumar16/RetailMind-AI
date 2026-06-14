using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RetailMind.API.Models.Inventory;

namespace RetailMind.API.Data.Configurations;

public sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Description)
            .HasMaxLength(500);

        // ── Self-referencing hierarchy ────────────────────────────────────────
        builder.HasOne(c => c.Parent)
            .WithMany(c => c.Children)
            .HasForeignKey(c => c.ParentId)
            .OnDelete(DeleteBehavior.Restrict)   // prevent cascade delete of entire subtree
            .IsRequired(false);

        // ── Indexes ───────────────────────────────────────────────────────────
        builder.HasIndex(c => c.Name)
            .HasDatabaseName("ix_categories_name");

        builder.HasIndex(c => c.ParentId)
            .HasDatabaseName("ix_categories_parent_id");

        // ── Soft-delete filter ─────────────────────────────────────────────────
        builder.HasQueryFilter(c => !c.IsDeleted);
    }
}
