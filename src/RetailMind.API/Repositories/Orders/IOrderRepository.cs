using RetailMind.API.Models.Orders;

namespace RetailMind.API.Repositories.Orders;

public interface IOrderRepository : IRepository<Order>
{
    Task<Order?> GetWithItemsAsync(int orderId, CancellationToken ct = default);
    Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken ct = default);
    Task<IEnumerable<Order>> GetByCustomerAsync(string customerId, CancellationToken ct = default);
    Task<IEnumerable<Order>> GetByStatusAsync(OrderStatus status, CancellationToken ct = default);
    Task<(IEnumerable<Order> Items, int Total)> GetPagedAsync(
        int page, int pageSize, OrderStatus? filterStatus = null, CancellationToken ct = default);
    Task<string> GenerateOrderNumberAsync(CancellationToken ct = default);
}
