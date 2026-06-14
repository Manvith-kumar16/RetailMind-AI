using RetailMind.API.DTOs.Common;
using RetailMind.API.DTOs.Employees;

namespace RetailMind.API.Services.Employees;

public interface IEmployeeService
{
    Task<PagedResponse<EmployeeResponseDto>> GetEmployeesAsync(PaginationQuery query, CancellationToken ct = default);
    Task<EmployeeResponseDto>                GetEmployeeByIdAsync(int id, CancellationToken ct = default);
    Task<EmployeeResponseDto>                CreateEmployeeAsync(CreateEmployeeDto dto, CancellationToken ct = default);
    Task<EmployeeResponseDto>                UpdateEmployeeAsync(int id, UpdateEmployeeDto dto, CancellationToken ct = default);
    Task                                     DeleteEmployeeAsync(int id, CancellationToken ct = default);

    Task<WorkLogResponseDto>                 AddWorkLogAsync(CreateWorkLogDto dto, CancellationToken ct = default);
    Task<IEnumerable<WorkLogResponseDto>>    GetWorkLogsAsync(int employeeId, DateTime from, DateTime to, CancellationToken ct = default);
}
