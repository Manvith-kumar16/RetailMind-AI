using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RetailMind.API.Models.Orders;

namespace RetailMind.API.Data.Configurations;

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(o => o.CustomerId)
            .IsRequired()
            .HasMaxLength(450); // Matches default Identity user ID length

        builder.Property(o => o.Status)
            .IsRequired();

        builder.Property(o => o.Type)
            .IsRequired();

        builder.Property(o => o.TotalAmount)
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Property(o => o.Notes)
            .HasMaxLength(2000);

        // ── Indexes ───────────────────────────────────────────────────────────
        builder.HasIndex(o => o.OrderNumber)
            .IsUnique()
            .HasDatabaseName("ix_orders_order_number");

        builder.HasIndex(o => o.CustomerId)
            .HasDatabaseName("ix_orders_customer_id");

        builder.HasIndex(o => o.Status)
            .HasDatabaseName("ix_orders_status");

        // ── Relationships ─────────────────────────────────────────────────────
        builder.HasMany(o => o.Items)
            .WithOne(i => i.Order)
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade); // Deleting order deletes items

        // ── Soft-delete ───────────────────────────────────────────────────────
        builder.HasQueryFilter(o => !o.IsDeleted);
    }
}
