using RetailMind.API.DTOs.Common;
using RetailMind.API.DTOs.Orders;
using RetailMind.API.Models.Orders;

namespace RetailMind.API.Services.Orders;

/// <summary>
/// Business logic for managing customer orders, integrating with inventory stock,
/// and navigating the order state machine.
/// </summary>
public interface IOrderService
{
    Task<PagedResponse<OrderSummaryDto>> GetOrdersAsync(PaginationQuery query, OrderStatus? status = null, CancellationToken ct = default);
    Task<OrderResponseDto>               GetOrderByIdAsync(int id, CancellationToken ct = default);
    Task<OrderResponseDto?>              GetOrderByNumberAsync(string orderNumber, CancellationToken ct = default);
    Task<IEnumerable<OrderSummaryDto>>   GetOrdersByUserAsync(string customerId, CancellationToken ct = default);

    Task<OrderResponseDto>               CreateOrderAsync(string customerId, CreateOrderDto dto, CancellationToken ct = default);
    Task<OrderResponseDto>               UpdateStatusAsync(int id, UpdateOrderStatusDto dto, CancellationToken ct = default);
    Task                                 CancelOrderAsync(int id, string customerId, CancellationToken ct = default);
}
