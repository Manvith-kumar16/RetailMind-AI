using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RetailMind.API.Models.Identity;

namespace RetailMind.API.Data.Configurations;

/// <summary>
/// EF Core Fluent API configuration for RefreshToken.
/// Defines indexes for token lookup performance and cascade delete from user.
/// </summary>
public sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_tokens");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Token)
            .IsRequired()
            .HasMaxLength(512);

        builder.Property(t => t.UserId)
            .IsRequired();

        builder.Property(t => t.CreatedByIp)
            .HasMaxLength(45);   // IPv6 max length

        builder.Property(t => t.RevokedByIp)
            .HasMaxLength(45);

        builder.Property(t => t.ReplacedByToken)
            .HasMaxLength(512);

        // Performance: token lookups happen on every request
        builder.HasIndex(t => t.Token)
            .IsUnique()
            .HasDatabaseName("ix_refresh_tokens_token");

        // Performance: fetching all tokens for a user
        builder.HasIndex(t => t.UserId)
            .HasDatabaseName("ix_refresh_tokens_user_id");

        // Cascade delete: removing a user removes all their tokens
        builder.HasOne(t => t.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Ignore computed properties — not stored in DB
        builder.Ignore(t => t.IsExpired);
        builder.Ignore(t => t.IsActive);
    }
}
