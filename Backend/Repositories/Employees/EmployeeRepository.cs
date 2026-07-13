using Microsoft.EntityFrameworkCore;
using RetailMind.API.Data;
using RetailMind.API.Models.Employees;

namespace RetailMind.API.Repositories.Employees;

public sealed class EmployeeRepository : BaseRepository<Employee>, IEmployeeRepository
{
    public EmployeeRepository(AppDbContext context) : base(context) { }

    public async Task<Employee?> GetWithLogsAsync(int id, CancellationToken ct = default) =>
        await _dbSet
            .AsNoTracking()
            .Include(e => e.WorkLogs)
            .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted, ct);

    public async Task<IEnumerable<WorkLog>> GetWorkLogsAsync(
        int employeeId, DateTime from, DateTime to, CancellationToken ct = default) =>
        await _context.WorkLogs
            .AsNoTracking()
            .Where(w => w.EmployeeId == employeeId 
                     && w.Date >= from 
                     && w.Date <= to 
                     && !w.IsDeleted)
            .OrderByDescending(w => w.Date)
            .ToListAsync(ct);
}
