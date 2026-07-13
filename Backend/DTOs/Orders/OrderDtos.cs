using RetailMind.API.Models.Orders;

namespace RetailMind.API.DTOs.Orders;

// ── Request DTOs ─────────────────────────────────────────────────────────────

public sealed record CreateOrderDto(
    OrderType Type,
    IEnumerable<CreateOrderItemDto> Items,
    string?   Notes       = null,
    DateTime? ScheduledAt = null);

public sealed record CreateOrderItemDto(
    int ProductId,
    int Quantity,
    decimal Discount = 0);

public sealed record UpdateOrderStatusDto(
    OrderStatus NewStatus,
    string? Notes = null);

// ── Response DTOs ─────────────────────────────────────────────────────────────

public sealed record OrderResponseDto(
    int         Id,
    string      OrderNumber,
    string      CustomerId,
    OrderStatus Status,
    OrderType   Type,
    decimal     TotalAmount,
    string?     Notes,
    DateTime?   ScheduledAt,
    DateTime?   ShippedAt,
    DateTime?   DeliveredAt,
    DateTime    CreatedAt,
    IEnumerable<OrderItemResponseDto> Items);

public sealed record OrderSummaryDto(
    int         Id,
    string      OrderNumber,
    string      CustomerId,
    OrderStatus Status,
    OrderType   Type,
    decimal     TotalAmount,
    DateTime    CreatedAt);

public sealed record OrderItemResponseDto(
    int     ProductId,
    string  ProductName,
    int     Quantity,
    decimal UnitPrice,
    decimal Discount,
    decimal LineTotal);
