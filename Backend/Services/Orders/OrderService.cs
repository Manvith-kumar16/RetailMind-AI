using Microsoft.EntityFrameworkCore;
using RetailMind.API.Data;
using RetailMind.API.DTOs.Common;
using RetailMind.API.DTOs.Orders;
using RetailMind.API.Models.Orders;
using RetailMind.API.Repositories.Orders;

namespace RetailMind.API.Services.Orders;

public sealed class OrderService : IOrderService
{
    private readonly IOrderRepository      _repo;
    private readonly AppDbContext          _context;
    private readonly ILogger<OrderService> _logger;

    public OrderService(
        IOrderRepository      repo,
        AppDbContext          context,
        ILogger<OrderService> logger)
    {
        _repo    = repo;
        _context = context;
        _logger  = logger;
    }

    public async Task<PagedResponse<OrderSummaryDto>> GetOrdersAsync(
        PaginationQuery query, OrderStatus? status = null, CancellationToken ct = default)
    {
        var (items, total) = await _repo.GetPagedAsync(query.Page, query.PageSize, status, ct);
        return new PagedResponse<OrderSummaryDto>
        {
            Data       = items.Select(ToSummaryDto),
            TotalCount = total,
            Page       = query.Page,
            PageSize   = query.PageSize
        };
    }

    public async Task<OrderResponseDto> GetOrderByIdAsync(int id, CancellationToken ct = default)
    {
        var order = await _repo.GetWithItemsAsync(id, ct)
            ?? throw new KeyNotFoundException($"Order ID {id} was not found.");
        return ToResponseDto(order);
    }

    public async Task<OrderResponseDto?> GetOrderByNumberAsync(
        string orderNumber, CancellationToken ct = default)
    {
        var order = await _repo.GetByOrderNumberAsync(orderNumber, ct);
        return order is null ? null : ToResponseDto(order);
    }

    public async Task<IEnumerable<OrderSummaryDto>> GetOrdersByUserAsync(
        string customerId, CancellationToken ct = default)
    {
        var orders = await _repo.GetByCustomerAsync(customerId, ct);
        return orders.Select(ToSummaryDto);
    }

    public async Task<OrderResponseDto> CreateOrderAsync(
        string customerId, CreateOrderDto dto, CancellationToken ct = default)
    {
        await using var tx = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
            
            // Lock and load products with their inventory
            var products = await _context.Products
                .Include(p => p.Inventory)
                .Where(p => productIds.Contains(p.Id) && !p.IsDeleted)
                .ToDictionaryAsync(p => p.Id, ct);

            var items = new List<OrderItem>();
            foreach (var reqItem in dto.Items)
            {
                if (!products.TryGetValue(reqItem.ProductId, out var product))
                    throw new KeyNotFoundException($"Product ID {reqItem.ProductId} not found or deleted.");

                // Validate stock for Standard/Bulk orders
                if (dto.Type != OrderType.PreOrder)
                {
                    if (product.Inventory == null)
                        throw new InvalidOperationException($"Inventory tracking missing for Product '{product.Name}'.");
                    
                    if (product.Inventory.QuantityOnHand < reqItem.Quantity)
                        throw new InvalidOperationException(
                            $"Insufficient stock for '{product.Name}'. Available: {product.Inventory.QuantityOnHand}, Requested: {reqItem.Quantity}");
                    
                    // Deduct stock
                    product.Inventory.QuantityOnHand -= reqItem.Quantity;
                    product.Inventory.LastStockCheck = DateTime.UtcNow;
                    product.Inventory.UpdatedAt = DateTime.UtcNow;
                    _context.Inventories.Update(product.Inventory);
                }

                items.Add(new OrderItem
                {
                    ProductId   = reqItem.ProductId,
                    ProductName = product.Name,
                    Quantity    = reqItem.Quantity,
                    UnitPrice   = product.Price,
                    Discount    = reqItem.Discount
                });
            }

            var orderNumber = await _repo.GenerateOrderNumberAsync(ct);
            var order = new Order
            {
                OrderNumber = orderNumber,
                CustomerId  = customerId,
                Type        = dto.Type,
                Notes       = dto.Notes,
                ScheduledAt = dto.ScheduledAt,
                Items       = items,
                TotalAmount = items.Sum(i => i.LineTotal),
                Status      = OrderStatus.Pending
            };

            await _context.Orders.AddAsync(order, ct);
            await _context.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            _logger.LogInformation("Order {OrderNumber} created securely. {ItemCount} items.", orderNumber, items.Count);
            return ToResponseDto(order);
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            _logger.LogError(ex, "Transaction rolled back during order creation for user {CustomerId}.", customerId);
            throw; // Let middleware catch and format the problem.
        }
    }

    public async Task<OrderResponseDto> UpdateStatusAsync(
        int id, UpdateOrderStatusDto dto, CancellationToken ct = default)
    {
        await using var tx = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            var order = await _context.Orders.Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id, ct)
                ?? throw new KeyNotFoundException($"Order ID {id} not found.");

            // Standard status transition guards
            if (order.Status is OrderStatus.Cancelled or OrderStatus.Refunded)
                throw new InvalidOperationException("Cannot change status of a cancelled or refunded order.");

            if (dto.NewStatus is OrderStatus.Cancelled or OrderStatus.Refunded)
            {
                // Restore inventory if this order was already deducting it
                if (order.Type != OrderType.PreOrder)
                {
                    await RestoreStockAsync(order.Items, ct);
                }
            }

            order.Status    = dto.NewStatus;
            order.Notes     = dto.Notes ?? order.Notes;
            order.UpdatedAt = DateTime.UtcNow;

            if (dto.NewStatus == OrderStatus.Shipped)
                order.ShippedAt = DateTime.UtcNow;
            else if (dto.NewStatus == OrderStatus.Delivered)
                order.DeliveredAt = DateTime.UtcNow;

            _context.Orders.Update(order);
            await _context.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            _logger.LogInformation("Order ID {OrderId} updated to {Status}", id, dto.NewStatus);
            return ToResponseDto(order);
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    public async Task CancelOrderAsync(int id, string customerId, CancellationToken ct = default)
    {
        await using var tx = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            var order = await _context.Orders.Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id, ct)
                ?? throw new KeyNotFoundException($"Order ID {id} not found.");

            if (order.CustomerId != customerId)
                throw new UnauthorizedAccessException("You do not have permission to cancel this order.");

            if (order.Status is OrderStatus.Shipped or OrderStatus.Delivered)
                throw new InvalidOperationException("Cannot cancel an order that has already been shipped or delivered.");

            if (order.Status is OrderStatus.Cancelled or OrderStatus.Refunded)
                throw new InvalidOperationException("Order is already cancelled.");

            // Restore inventory
            if (order.Type != OrderType.PreOrder)
            {
                await RestoreStockAsync(order.Items, ct);
            }

            order.Status    = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;

            _context.Orders.Update(order);
            await _context.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            _logger.LogInformation("Order {OrderNumber} cancelled by customer {CustomerId}", order.OrderNumber, customerId);
        }
        catch
        {
            await tx.RollbackAsync(ct);
            throw;
        }
    }

    // ── Internal Helpers ───────────────────────────────────────────────────────

    private async Task RestoreStockAsync(IEnumerable<OrderItem> items, CancellationToken ct)
    {
        var productIds = items.Select(i => i.ProductId).Distinct().ToList();
        var inventories = await _context.Inventories
            .Where(i => productIds.Contains(i.ProductId))
            .ToDictionaryAsync(i => i.ProductId, ct);

        foreach (var item in items)
        {
            if (inventories.TryGetValue(item.ProductId, out var inv))
            {
                inv.QuantityOnHand += item.Quantity;
                inv.UpdatedAt = DateTime.UtcNow;
                _context.Inventories.Update(inv);
            }
        }
    }

    // ── Manual Projection ──────────────────────────────────────────────────────
    private static OrderResponseDto ToResponseDto(Order o) =>
        new(o.Id, o.OrderNumber, o.CustomerId, o.Status, o.Type,
            o.TotalAmount, o.Notes, o.ScheduledAt, o.ShippedAt, o.DeliveredAt,
            o.CreatedAt, o.Items.Select(i => new OrderItemResponseDto(
                i.ProductId, i.ProductName, i.Quantity, i.UnitPrice, i.Discount, i.LineTotal)));

    private static OrderSummaryDto ToSummaryDto(Order o) =>
        new(o.Id, o.OrderNumber, o.CustomerId, o.Status, o.Type, o.TotalAmount, o.CreatedAt);
}
