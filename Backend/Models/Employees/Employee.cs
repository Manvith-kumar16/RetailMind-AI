namespace RetailMind.API.Models.Employees;

/// <summary>
/// Represents a member of staff or vendor.
/// </summary>
public sealed class Employee : BaseEntity
{
    public string  FirstName    { get; set; } = string.Empty;
    public string  LastName     { get; set; } = string.Empty;
    public string  Email        { get; set; } = string.Empty;
    public string? Phone        { get; set; }
    public EmployeeRole Role    { get; set; } = EmployeeRole.Staff;
    
    // User requested "Salary", replacing HourlyRate with Salary (base pay rate metric)
    public decimal Salary       { get; set; }
    
    public DateTime HireDate    { get; set; } = DateTime.UtcNow;
    public bool    IsActive     { get; set; } = true;

    public string FullName => $"{FirstName} {LastName}";

    // Navigation
    public ICollection<WorkLog> WorkLogs { get; set; } = [];
}

public enum EmployeeRole
{
    Admin   = 0,
    Manager = 1,
    Staff   = 2,
    Vendor  = 3
}
