using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailMind.API.DTOs.Common;
using RetailMind.API.DTOs.Employees;
using RetailMind.API.Services.Employees;

namespace RetailMind.API.Controllers;

/// <summary>
/// Core HR features: Employee demographics, roles, and compensation.
/// </summary>
[Route("api/v1/employees")]
[Authorize(Roles = "Admin,Manager")]
public sealed class EmployeesController : BaseController
{
    private readonly IEmployeeService _service;

    public EmployeesController(IEmployeeService service) => _service = service;

    /// <summary>Get paginated list of employees with optional search.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<EmployeeResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEmployees(
        [FromQuery] PaginationQuery query, CancellationToken ct)
    {
        var result = await _service.GetEmployeesAsync(query, ct);
        return Ok(result);
    }

    /// <summary>Get a single employee with complete history stats.</summary>
    [HttpGet("{id:int}", Name = "GetEmployee")]
    [ProducesResponseType(typeof(EmployeeResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEmployee(int id, CancellationToken ct)
    {
        var emp = await _service.GetEmployeeByIdAsync(id, ct);
        return Ok(emp);
    }

    /// <summary>Register a new employee. Admin only.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(EmployeeResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateEmployee(
        [FromBody] CreateEmployeeDto dto, CancellationToken ct)
    {
        var emp = await _service.CreateEmployeeAsync(dto, ct);
        return Created("GetEmployee", new { id = emp.Id }, emp);
    }

    /// <summary>Partially update an employee. Admin only.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(EmployeeResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateEmployee(
        int id, [FromBody] UpdateEmployeeDto dto, CancellationToken ct)
    {
        var emp = await _service.UpdateEmployeeAsync(id, dto, ct);
        return Ok(emp, "Employee updated.");
    }

    /// <summary>Terminates an employee (soft-delete). Admin only.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteEmployee(int id, CancellationToken ct)
    {
        await _service.DeleteEmployeeAsync(id, ct);
        return NoContent();
    }
}
