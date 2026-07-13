using Microsoft.EntityFrameworkCore;
using RetailMind.API.Data;
using RetailMind.API.Models.Orders;

namespace RetailMind.API.Repositories.Orders;

public sealed class OrderRepository : BaseRepository<Order>, IOrderRepository
{
    public OrderRepository(AppDbContext context) : base(context) { }

    public async Task<Order?> GetWithItemsAsync(int orderId, CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && !o.IsDeleted, ct);

    public async Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber && !o.IsDeleted, ct);

    public async Task<IEnumerable<Order>> GetByCustomerAsync(string customerId, CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.CustomerId == customerId && !o.IsDeleted)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);

    public async Task<IEnumerable<Order>> GetByStatusAsync(OrderStatus status, CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Where(o => o.Status == status && !o.IsDeleted)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);

    public async Task<(IEnumerable<Order> Items, int Total)> GetPagedAsync(
        int page, int pageSize, OrderStatus? filterStatus = null, CancellationToken ct = default)
    {
        var query = _dbSet.AsNoTracking().Include(o => o.Items).Where(o => !o.IsDeleted);

        if (filterStatus.HasValue)
            query = query.Where(o => o.Status == filterStatus.Value);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<string> GenerateOrderNumberAsync(CancellationToken ct = default)
    {
        var today = DateTime.UtcNow;
        var prefix = $"RM{today:yyyyMMdd}";
        var count = await _dbSet.CountAsync(o => o.OrderNumber.StartsWith(prefix), ct);
        return $"{prefix}{(count + 1):D4}";
    }
}
