using FluentValidation;
using RetailMind.API.DTOs.Orders;
using RetailMind.API.Models.Orders;

namespace RetailMind.API.Validators.Orders;

public sealed class CreateOrderValidator : AbstractValidator<CreateOrderDto>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid order type.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("An order must contain at least one item.");

        RuleForEach(x => x.Items).SetValidator(new CreateOrderItemValidator());

        RuleFor(x => x.Notes)
            .MaximumLength(2000).When(x => x.Notes is not null);

        RuleFor(x => x.ScheduledAt)
            .GreaterThan(DateTime.UtcNow).When(x => x.Type == OrderType.PreOrder)
            .WithMessage("Pre-orders must be scheduled for a future date.");

        RuleFor(x => x.ScheduledAt)
            .NotNull().When(x => x.Type == OrderType.PreOrder)
            .WithMessage("Scheduled date is required for pre-orders.");
            
        RuleFor(x => x.ScheduledAt)
            .Null().When(x => x.Type == OrderType.Standard)
            .WithMessage("Scheduled date is not allowed for standard orders.");
    }
}

public sealed class CreateOrderItemValidator : AbstractValidator<CreateOrderItemDto>
{
    public CreateOrderItemValidator()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0).WithMessage("Product ID must be a positive integer.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be at least 1.");

        RuleFor(x => x.Discount)
            .GreaterThanOrEqualTo(0).WithMessage("Discount cannot be negative.");
    }
}

public sealed class UpdateOrderStatusValidator : AbstractValidator<UpdateOrderStatusDto>
{
    public UpdateOrderStatusValidator()
    {
        RuleFor(x => x.NewStatus)
            .IsInEnum().WithMessage("Invalid order status.");

        RuleFor(x => x.Notes)
            .MaximumLength(2000).When(x => x.Notes is not null);
    }
}
