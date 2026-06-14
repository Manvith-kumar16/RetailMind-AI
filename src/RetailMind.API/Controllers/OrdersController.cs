using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailMind.API.DTOs.Common;
using RetailMind.API.DTOs.Orders;
using RetailMind.API.Models.Identity;
using RetailMind.API.Models.Orders;
using RetailMind.API.Services.Orders;

namespace RetailMind.API.Controllers;

/// <summary>
/// Manages customer orders: place, track, and update status.
/// </summary>
[Route("api/v1/orders")]
[Authorize]
public sealed class OrdersController : BaseController
{
    private readonly IOrderService _service;

    public OrdersController(IOrderService service) => _service = service;

    /// <summary>Get all orders (Admin / Manager only) with optional status filter.</summary>
    [HttpGet]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Manager}")]
    [ProducesResponseType(typeof(PagedResponse<OrderSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrders(
        [FromQuery] PaginationQuery query,
        [FromQuery] OrderStatus?    status,
        CancellationToken ct)
    {
        var result = await _service.GetOrdersAsync(query, status, ct);
        return Ok(result);
    }

    /// <summary>Get a specific order by ID.</summary>
    [HttpGet("{id:int}", Name = "GetOrder")]
    [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrder(int id, CancellationToken ct)
    {
        var order = await _service.GetOrderByIdAsync(id, ct);
        return Ok(order);
    }

    /// <summary>Get a specific order by its public Order Number.</summary>
    [HttpGet("number/{orderNumber}")]
    [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrderByNumber(string orderNumber, CancellationToken ct)
    {
        var order = await _service.GetOrderByNumberAsync(orderNumber, ct);
        return order is null ? NotFound($"Order '{orderNumber}' not found.") : Ok(order);
    }

    /// <summary>Get the authenticated customer's own orders.</summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(IEnumerable<OrderSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyOrders(CancellationToken ct)
    {
        // For standard "customer" contexts, CurrentUserId represents them.
        var orders = await _service.GetOrdersByUserAsync(CurrentUserId, ct);
        return Ok(orders);
    }

    /// <summary>Get orders by a specific User ID. Admin / Manager only.</summary>
    [HttpGet("user/{userId}")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Manager}")]
    [ProducesResponseType(typeof(IEnumerable<OrderSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrdersByUser(string userId, CancellationToken ct)
    {
        var orders = await _service.GetOrdersByUserAsync(userId, ct);
        return Ok(orders);
    }

    /// <summary>Place a new order on behalf of the current user.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOrder(
        [FromBody] CreateOrderDto dto, CancellationToken ct)
    {
        var order = await _service.CreateOrderAsync(CurrentUserId, dto, ct);
        return Created("GetOrder", new { id = order.Id }, order);
    }

    /// <summary>Update order status (Admin / Manager / Staff only).</summary>
    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Manager},{AppRoles.Staff}")]
    [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(
        int id, [FromBody] UpdateOrderStatusDto dto, CancellationToken ct)
    {
        var order = await _service.UpdateStatusAsync(id, dto, ct);
        return Ok(order, "Order status updated.");
    }

    /// <summary>Cancel an order (owner only, before shipment).</summary>
    [HttpPost("{id:int}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelOrder(int id, CancellationToken ct)
    {
        await _service.CancelOrderAsync(id, CurrentUserId, ct);
        return Ok<object>(null!, "Order cancelled successfully.");
    }
}
