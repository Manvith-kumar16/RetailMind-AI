using RetailMind.API.Models.Employees;

namespace RetailMind.API.DTOs.Employees;

// ── Request DTOs ─────────────────────────────────────────────────────────────

public sealed record CreateEmployeeDto(
    string       FirstName,
    string       LastName,
    string       Email,
    string?      Phone,
    EmployeeRole Role,
    decimal      Salary,
    DateTime     HireDate);

public sealed record UpdateEmployeeDto(
    string?       FirstName,
    string?       LastName,
    string?       Phone,
    EmployeeRole? Role,
    decimal?      Salary,
    bool?         IsActive);

public sealed record CreateWorkLogDto(
    int      EmployeeId,
    DateTime Date,
    double   HoursWorked,
    string?  Notes = null);

// ── Response DTOs ─────────────────────────────────────────────────────────────

public sealed record EmployeeResponseDto(
    int          Id,
    string       FullName,
    string       Email,
    string?      Phone,
    EmployeeRole Role,
    decimal      Salary,
    DateTime     HireDate,
    bool         IsActive,
    double?      TotalHoursWorked = null,
    double?      TotalOvertimeHours = null);

public sealed record WorkLogResponseDto(
    int      Id,
    int      EmployeeId,
    string   EmployeeName,
    DateTime Date,
    double   HoursWorked,
    bool     IsOvertime,
    string?  Notes);
