using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RetailMind.API.Models.Orders;

namespace RetailMind.API.Data.Configurations;

public sealed class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("order_items");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(i => i.Quantity)
            .IsRequired();

        builder.Property(i => i.UnitPrice)
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Property(i => i.Discount)
            .HasColumnType("numeric(18,2)")
            .IsRequired()
            .HasDefaultValue(0);

        // Computed property is not mapped
        builder.Ignore(i => i.LineTotal);

        // ── Indexes ───────────────────────────────────────────────────────────
        builder.HasIndex(i => i.OrderId)
            .HasDatabaseName("ix_order_items_order_id");

        builder.HasIndex(i => i.ProductId)
            .HasDatabaseName("ix_order_items_product_id");

        // ── Relationships ─────────────────────────────────────────────────────
        builder.HasOne(i => i.Product)
            .WithMany()
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent deleting product if it's in an order

        // ── Soft-delete ───────────────────────────────────────────────────────
        builder.HasQueryFilter(i => !i.IsDeleted);
    }
}
