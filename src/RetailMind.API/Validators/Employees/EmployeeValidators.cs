using FluentValidation;
using RetailMind.API.DTOs.Employees;
using RetailMind.API.Models.Employees;

namespace RetailMind.API.Validators.Employees;

public sealed class CreateEmployeeValidator : AbstractValidator<CreateEmployeeDto>
{
    public CreateEmployeeValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Phone).MaximumLength(30).When(x => x.Phone is not null);
        RuleFor(x => x.Role).IsInEnum();
        RuleFor(x => x.Salary).GreaterThanOrEqualTo(0);
        RuleFor(x => x.HireDate).NotEmpty();
    }
}

public sealed class UpdateEmployeeValidator : AbstractValidator<UpdateEmployeeDto>
{
    public UpdateEmployeeValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100).When(x => x.FirstName is not null);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100).When(x => x.LastName is not null);
        RuleFor(x => x.Phone).MaximumLength(30).When(x => x.Phone is not null);
        RuleFor(x => x.Role).IsInEnum().When(x => x.Role is not null);
        RuleFor(x => x.Salary).GreaterThanOrEqualTo(0).When(x => x.Salary is not null);
    }
}

public sealed class CreateWorkLogValidator : AbstractValidator<CreateWorkLogDto>
{
    public CreateWorkLogValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Valid Employee ID required.");

        RuleFor(x => x.Date)
            .NotEmpty()
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1))
            .WithMessage("Cannot log hours for future dates uncontrollably.");

        RuleFor(x => x.HoursWorked)
            .GreaterThan(0)
            .LessThanOrEqualTo(24)
            .WithMessage("Hours worked must be between 0 and 24.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).When(x => x.Notes is not null);
    }
}
