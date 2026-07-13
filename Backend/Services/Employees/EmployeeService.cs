using Microsoft.EntityFrameworkCore;
using RetailMind.API.Data;
using RetailMind.API.DTOs.Common;
using RetailMind.API.DTOs.Employees;
using RetailMind.API.Models.Employees;
using RetailMind.API.Repositories.Employees;

namespace RetailMind.API.Services.Employees;

public sealed class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository     _repo;
    private readonly AppDbContext            _context;
    private readonly ILogger<EmployeeService> _logger;

    public EmployeeService(
        IEmployeeRepository     repo,
        AppDbContext            context,
        ILogger<EmployeeService> logger)
    {
        _repo    = repo;
        _context = context;
        _logger  = logger;
    }

    public async Task<PagedResponse<EmployeeResponseDto>> GetEmployeesAsync(
        PaginationQuery query, CancellationToken ct = default)
    {
        var dbQuery = _context.Employees.AsNoTracking().Where(e => !e.IsDeleted);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            dbQuery = dbQuery.Where(e => 
                e.FirstName.Contains(query.Search) || 
                e.LastName.Contains(query.Search) || 
                e.Email.Contains(query.Search));
        }

        var total = await dbQuery.CountAsync(ct);
        var items = await dbQuery
            .OrderByDescending(e => e.HireDate)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return new PagedResponse<EmployeeResponseDto>
        {
            Data       = items.Select(e => ToResponseDto(e)),
            TotalCount = total,
            Page       = query.Page,
            PageSize   = query.PageSize
        };
    }

    public async Task<EmployeeResponseDto> GetEmployeeByIdAsync(int id, CancellationToken ct = default)
    {
        var emp = await _repo.GetWithLogsAsync(id, ct)
            ?? throw new KeyNotFoundException($"Employee {id} not found.");
        return ToResponseDto(emp, includeStats: true);
    }

    public async Task<EmployeeResponseDto> CreateEmployeeAsync(
        CreateEmployeeDto dto, CancellationToken ct = default)
    {
        if (await _repo.ExistsAsync(e => e.Email == dto.Email, ct))
            throw new InvalidOperationException($"Employee with email '{dto.Email}' already exists.");

        var emp = new Employee
        {
            FirstName  = dto.FirstName,
            LastName   = dto.LastName,
            Email      = dto.Email,
            Phone      = dto.Phone,
            Role       = dto.Role,
            Salary     = dto.Salary,
            HireDate   = dto.HireDate,
            IsActive   = true
        };

        await _repo.AddAsync(emp, ct);
        _logger.LogInformation("Employee created: {Email}", emp.Email);

        return ToResponseDto(emp);
    }

    public async Task<EmployeeResponseDto> UpdateEmployeeAsync(
        int id, UpdateEmployeeDto dto, CancellationToken ct = default)
    {
        var emp = await _repo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Employee {id} not found.");

        emp.FirstName  = dto.FirstName ?? emp.FirstName;
        emp.LastName   = dto.LastName ?? emp.LastName;
        emp.Phone      = dto.Phone ?? emp.Phone;
        emp.Role       = dto.Role ?? emp.Role;
        emp.Salary     = dto.Salary ?? emp.Salary;
        emp.IsActive   = dto.IsActive ?? emp.IsActive;
        emp.UpdatedAt  = DateTime.UtcNow;

        await _repo.UpdateAsync(emp, ct);
        return ToResponseDto(emp);
    }

    public async Task DeleteEmployeeAsync(int id, CancellationToken ct = default)
    {
        var emp = await _repo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Employee {id} not found.");
        
        emp.IsDeleted = true;
        emp.IsActive  = false;
        emp.UpdatedAt = DateTime.UtcNow;
        
        await _repo.UpdateAsync(emp, ct);
    }

    public async Task<WorkLogResponseDto> AddWorkLogAsync(
        CreateWorkLogDto dto, CancellationToken ct = default)
    {
        var emp = await _repo.GetByIdAsync(dto.EmployeeId, ct)
            ?? throw new KeyNotFoundException($"Employee {dto.EmployeeId} not found.");

        // Check for duplicate date log
        if (await _context.WorkLogs.AnyAsync(w => w.EmployeeId == dto.EmployeeId && w.Date.Date == dto.Date.Date, ct))
            throw new InvalidOperationException($"A work log already exists for {dto.Date:yyyy-MM-dd}.");

        var isOvertime = dto.HoursWorked > 8.0;

        var log = new WorkLog
        {
            EmployeeId  = dto.EmployeeId,
            Date        = dto.Date.Date,
            HoursWorked = dto.HoursWorked,
            IsOvertime  = isOvertime,
            Notes       = dto.Notes
        };

        await _context.WorkLogs.AddAsync(log, ct);
        await _context.SaveChangesAsync(ct);

        return ToWorkLogResponse(log, emp.FullName);
    }

    public async Task<IEnumerable<WorkLogResponseDto>> GetWorkLogsAsync(
        int employeeId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        var emp = await _repo.GetByIdAsync(employeeId, ct)
            ?? throw new KeyNotFoundException($"Employee {employeeId} not found.");

        var logs = await _repo.GetWorkLogsAsync(employeeId, from, to, ct);
        return logs.Select(l => ToWorkLogResponse(l, emp.FullName));
    }

    // ── Projections ─────────────────────────────────────────────────────────────

    private static EmployeeResponseDto ToResponseDto(Employee e, bool includeStats = false)
    {
        double? totalHours = null;
        double? overtimeHours = null;

        if (includeStats && e.WorkLogs != null)
        {
            totalHours = e.WorkLogs.Sum(w => w.HoursWorked);
            // Anything > 8 hours on a day counts as overtime for that day
            overtimeHours = e.WorkLogs.Where(w => w.IsOvertime).Sum(w => w.HoursWorked - 8.0);
        }

        return new EmployeeResponseDto(
            e.Id,
            e.FullName,
            e.Email,
            e.Phone,
            e.Role,
            e.Salary,
            e.HireDate,
            e.IsActive,
            totalHours,
            overtimeHours);
    }

    private static WorkLogResponseDto ToWorkLogResponse(WorkLog w, string empName) =>
        new(w.Id, w.EmployeeId, empName, w.Date, w.HoursWorked, w.IsOvertime, w.Notes);
}
