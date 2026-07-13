using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RetailMind.API.Models.Inventory;

namespace RetailMind.API.Data.Configurations;

public sealed class InventoryConfiguration : IEntityTypeConfiguration<InventoryItem>
{
    public void Configure(EntityTypeBuilder<InventoryItem> builder)
    {
        builder.ToTable("inventory");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.QuantityOnHand).IsRequired();
        builder.Property(i => i.ReorderLevel).IsRequired().HasDefaultValue(10);
        builder.Property(i => i.ReorderQuantity).IsRequired().HasDefaultValue(50);

        builder.Property(i => i.WarehouseLocation)
            .HasMaxLength(100);

        builder.Property(i => i.LastStockCheck)
            .IsRequired();

        // ── Indexes ───────────────────────────────────────────────────────────
        // Unique product → exactly one inventory record
        builder.HasIndex(i => i.ProductId)
            .IsUnique()
            .HasDatabaseName("ix_inventory_product_id");

        // Quickly find all items below reorder threshold
        builder.HasIndex(i => new { i.QuantityOnHand, i.ReorderLevel })
            .HasDatabaseName("ix_inventory_stock_levels");

        // ── Ignore computed properties ─────────────────────────────────────────
        builder.Ignore(i => i.IsLowStock);
    }
}
