using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RetailMind.API.Models.Inventory;

namespace RetailMind.API.Data.Configurations;

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.SKU)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.Description)
            .HasMaxLength(2000);

        builder.Property(p => p.Price)
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Property(p => p.CostPrice)
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Property(p => p.ImageUrl)
            .HasMaxLength(500);

        // ── Indexes ───────────────────────────────────────────────────────────
        builder.HasIndex(p => p.SKU)
            .IsUnique()
            .HasDatabaseName("ix_products_sku");

        builder.HasIndex(p => p.Name)
            .HasDatabaseName("ix_products_name");

        builder.HasIndex(p => p.IsDeleted)
            .HasDatabaseName("ix_products_is_deleted");

        builder.HasIndex(p => new { p.CategoryId, p.IsDeleted })
            .HasDatabaseName("ix_products_category_deleted");

        // ── Relationships ─────────────────────────────────────────────────────
        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);  // prevent accidental cascade deletes

        builder.HasOne(p => p.Supplier)
            .WithMany(s => s.Products)
            .HasForeignKey(p => p.SupplierId)
            .OnDelete(DeleteBehavior.SetNull)    // removing a supplier NULLs the FK, keeps products
            .IsRequired(false);

        // 1-to-1 with Inventory (owned side declares FK)
        builder.HasOne(p => p.Inventory)
            .WithOne(i => i.Product)
            .HasForeignKey<InventoryItem>(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);   // deleting product removes its inventory record

        // ── Soft-delete query filter ──────────────────────────────────────────
        builder.HasQueryFilter(p => !p.IsDeleted);
    }
}
