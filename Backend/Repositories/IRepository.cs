using System.Linq.Expressions;

namespace RetailMind.API.Repositories;

/// <summary>
/// Generic repository contract — provides type-safe CRUD abstraction over EF Core.
/// </summary>
public interface IRepository<T> where T : class
{
    Task<T?>                GetByIdAsync(int id, CancellationToken ct = default);
    Task<IEnumerable<T>>    GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<T>>    FindAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default);
    Task<T>                 AddAsync(T entity, CancellationToken ct = default);
    Task                    UpdateAsync(T entity, CancellationToken ct = default);
    Task                    DeleteAsync(int id, CancellationToken ct = default);
    Task<bool>              ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default);
    Task<int>               CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken ct = default);
}
