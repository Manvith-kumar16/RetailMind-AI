using RetailMind.API.Models.Employees;

namespace RetailMind.API.Repositories.Employees;

public interface IEmployeeRepository : IRepository<Employee>
{
    Task<Employee?> GetWithLogsAsync(int id, CancellationToken ct = default);
    Task<IEnumerable<WorkLog>> GetWorkLogsAsync(
        int employeeId, DateTime from, DateTime to, CancellationToken ct = default);
}
