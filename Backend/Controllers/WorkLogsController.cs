using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailMind.API.DTOs.Employees;
using RetailMind.API.Services.Employees;

namespace RetailMind.API.Controllers;

/// <summary>
/// Specialized endpoints for mapping hours worked and tracking temporal expenses.
/// </summary>
[Route("api/v1/worklogs")]
[Authorize(Roles = "Admin,Manager")]
public sealed class WorkLogsController : BaseController
{
    private readonly IEmployeeService _service;

    public WorkLogsController(IEmployeeService service) => _service = service;

    /// <summary>Submit a daily timesheet for a given employee.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(WorkLogResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddWorkLog(
        [FromBody] CreateWorkLogDto dto, CancellationToken ct)
    {
        var log = await _service.AddWorkLogAsync(dto, ct);
        return Ok(log, "Work log submitted successfully.");
    }

    /// <summary>Fetch the historical hours worked bounded by a given date frame.</summary>
    [HttpGet("employee/{employeeId:int}")]
    [ProducesResponseType(typeof(IEnumerable<WorkLogResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetWorkLogs(
        int employeeId,
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        CancellationToken ct)
    {
        var logs = await _service.GetWorkLogsAsync(employeeId, from, to, ct);
        return Ok(logs);
    }
}
