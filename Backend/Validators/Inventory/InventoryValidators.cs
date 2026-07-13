using FluentValidation;
using RetailMind.API.DTOs.Inventory;

namespace RetailMind.API.Validators.Inventory;

// ── Product ──────────────────────────────────────────────────────────────────

public sealed class CreateProductValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required.")
            .MaximumLength(200);

        RuleFor(x => x.SKU)
            .NotEmpty().WithMessage("SKU is required.")
            .MaximumLength(50)
            .Matches(@"^[A-Za-z0-9\-_]+$")
            .WithMessage("SKU may only contain letters, digits, hyphens, and underscores.");

        RuleFor(x => x.Description)
            .MaximumLength(2000).When(x => x.Description is not null);

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be a non-negative value.");

        RuleFor(x => x.CostPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Cost price must be a non-negative value.");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("A valid category is required.");

        RuleFor(x => x.SupplierId)
            .GreaterThan(0).When(x => x.SupplierId.HasValue)
            .WithMessage("Supplier ID must be a positive integer.");

        RuleFor(x => x.InitialStock)
            .GreaterThanOrEqualTo(0).WithMessage("Initial stock cannot be negative.");

        RuleFor(x => x.ReorderLevel)
            .GreaterThanOrEqualTo(0).WithMessage("Reorder level cannot be negative.");

        RuleFor(x => x.ReorderQuantity)
            .GreaterThan(0).WithMessage("Reorder quantity must be greater than zero.");
    }
}

public sealed class UpdateProductValidator : AbstractValidator<UpdateProductDto>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Name)
            .MaximumLength(200).When(x => x.Name is not null)
            .NotEmpty().When(x => x.Name is not null).WithMessage("Name cannot be empty.");

        RuleFor(x => x.Description)
            .MaximumLength(2000).When(x => x.Description is not null);

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).When(x => x.Price.HasValue)
            .WithMessage("Price must be non-negative.");

        RuleFor(x => x.CostPrice)
            .GreaterThanOrEqualTo(0).When(x => x.CostPrice.HasValue)
            .WithMessage("Cost price must be non-negative.");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).When(x => x.CategoryId.HasValue)
            .WithMessage("Category ID must be a positive integer.");

        RuleFor(x => x.SupplierId)
            .GreaterThan(0).When(x => x.SupplierId.HasValue)
            .WithMessage("Supplier ID must be a positive integer.");
    }
}

// ── Stock / Inventory ────────────────────────────────────────────────────────

public sealed class UpdateInventoryValidator : AbstractValidator<UpdateInventoryDto>
{
    public UpdateInventoryValidator()
    {
        RuleFor(x => x.QuantityOnHand)
            .GreaterThanOrEqualTo(0).WithMessage("Quantity on hand cannot be negative.");

        RuleFor(x => x.ReorderLevel)
            .GreaterThanOrEqualTo(0).When(x => x.ReorderLevel.HasValue)
            .WithMessage("Reorder level cannot be negative.");

        RuleFor(x => x.ReorderQuantity)
            .GreaterThan(0).When(x => x.ReorderQuantity.HasValue)
            .WithMessage("Reorder quantity must be greater than zero.");

        RuleFor(x => x.WarehouseLocation)
            .MaximumLength(100).When(x => x.WarehouseLocation is not null);
    }
}

public sealed class AdjustStockValidator : AbstractValidator<AdjustStockDto>
{
    public AdjustStockValidator()
    {
        RuleFor(x => x.Delta)
            .NotEqual(0).WithMessage("Delta must be non-zero.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("A reason for stock adjustment is required.")
            .MaximumLength(500);
    }
}

// ── Supplier ─────────────────────────────────────────────────────────────────

public sealed class CreateSupplierValidator : AbstractValidator<CreateSupplierDto>
{
    public CreateSupplierValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Supplier name is required.")
            .MaximumLength(200);

        RuleFor(x => x.Email)
            .EmailAddress().When(x => x.Email is not null)
            .MaximumLength(256).When(x => x.Email is not null)
            .WithMessage("A valid email address is required.");

        RuleFor(x => x.Phone)
            .MaximumLength(30).When(x => x.Phone is not null);

        RuleFor(x => x.Address)
            .MaximumLength(500).When(x => x.Address is not null);

        RuleFor(x => x.ContactPerson)
            .MaximumLength(100).When(x => x.ContactPerson is not null);

        RuleFor(x => x.Notes)
            .MaximumLength(2000).When(x => x.Notes is not null);
    }
}

public sealed class UpdateSupplierValidator : AbstractValidator<UpdateSupplierDto>
{
    public UpdateSupplierValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().When(x => x.Name is not null)
            .MaximumLength(200).When(x => x.Name is not null);

        RuleFor(x => x.Email)
            .EmailAddress().When(x => x.Email is not null)
            .MaximumLength(256).When(x => x.Email is not null);

        RuleFor(x => x.Phone)
            .MaximumLength(30).When(x => x.Phone is not null);

        RuleFor(x => x.Notes)
            .MaximumLength(2000).When(x => x.Notes is not null);
    }
}

// ── Category ─────────────────────────────────────────────────────────────────

public sealed class CreateCategoryValidator : AbstractValidator<CreateCategoryDto>
{
    public CreateCategoryValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Category name is required.")
            .MaximumLength(100);

        RuleFor(x => x.Description)
            .MaximumLength(500).When(x => x.Description is not null);

        RuleFor(x => x.ParentId)
            .GreaterThan(0).When(x => x.ParentId.HasValue)
            .WithMessage("Parent ID must be a positive integer.");
    }
}

public sealed class UpdateCategoryValidator : AbstractValidator<UpdateCategoryDto>
{
    public UpdateCategoryValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().When(x => x.Name is not null)
            .MaximumLength(100).When(x => x.Name is not null);

        RuleFor(x => x.Description)
            .MaximumLength(500).When(x => x.Description is not null);

        RuleFor(x => x.ParentId)
            .GreaterThan(0).When(x => x.ParentId.HasValue)
            .WithMessage("Parent ID must be a positive integer.");
    }
}
