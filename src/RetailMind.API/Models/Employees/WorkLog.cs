namespace RetailMind.API.Models.Employees;

/// <summary>
/// Records the hours worked by an employee on a specific date.
/// Replaces the legacy clock-in/clock-out shift system for a simplified daily manual log.
/// </summary>
public sealed class WorkLog : BaseEntity
{
    public int      EmployeeId  { get; set; }
    public DateTime Date        { get; set; }
    public double   HoursWorked { get; set; }
    public bool     IsOvertime  { get; set; }

    /// <summary>Any extra context for this logging entry.</summary>
    public string?  Notes       { get; set; }

    // Navigation
    public Employee Employee { get; set; } = null!;
}
