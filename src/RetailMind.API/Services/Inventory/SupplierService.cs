using Microsoft.EntityFrameworkCore;
using RetailMind.API.Data;
using RetailMind.API.DTOs.Common;
using RetailMind.API.DTOs.Inventory;
using RetailMind.API.Models.Inventory;
using RetailMind.API.Repositories.Inventory;

namespace RetailMind.API.Services.Inventory;

public sealed class SupplierService : ISupplierService
{
    private readonly ISupplierRepository      _repo;
    private readonly IInventoryRepository     _productRepo;
    private readonly ILogger<SupplierService> _logger;

    public SupplierService(
        ISupplierRepository       repo,
        IInventoryRepository      productRepo,
        ILogger<SupplierService>  logger)
    {
        _repo        = repo;
        _productRepo = productRepo;
        _logger      = logger;
    }

    public async Task<PagedResponse<SupplierResponseDto>> GetAllAsync(
        PaginationQuery query, CancellationToken ct = default)
    {
        var (items, total) = await _repo.GetPagedAsync(query.Page, query.PageSize, query.Search, ct);
        return new PagedResponse<SupplierResponseDto>
        {
            Data       = items.Select(ToResponseDto),
            TotalCount = total,
            Page       = query.Page,
            PageSize   = query.PageSize
        };
    }

    public async Task<IEnumerable<SupplierSummaryDto>> GetActiveSummariesAsync(
        CancellationToken ct = default)
    {
        var suppliers = await _repo.GetActiveAsync(ct);
        return suppliers.Select(s => new SupplierSummaryDto(
            s.Id, s.Name, s.IsActive, s.Products.Count));
    }

    public async Task<SupplierResponseDto> GetByIdAsync(
        int id, CancellationToken ct = default)
    {
        var supplier = await _repo.GetWithProductsAsync(id, ct)
            ?? throw new KeyNotFoundException($"Supplier with ID {id} was not found.");
        return ToResponseDto(supplier);
    }

    public async Task<SupplierResponseDto> CreateAsync(
        CreateSupplierDto dto, CancellationToken ct = default)
    {
        // Guard: duplicate name
        if (await _repo.GetByNameAsync(dto.Name.Trim(), ct) is not null)
            throw new InvalidOperationException(
                $"A supplier named '{dto.Name}' already exists.");

        var supplier = new Supplier
        {
            Name          = dto.Name.Trim(),
            Email         = dto.Email?.Trim().ToLowerInvariant(),
            Phone         = dto.Phone?.Trim(),
            Address       = dto.Address?.Trim(),
            ContactPerson = dto.ContactPerson?.Trim(),
            Website       = dto.Website?.Trim(),
            Notes         = dto.Notes?.Trim(),
            IsActive      = true
        };

        var created = await _repo.AddAsync(supplier, ct);
        _logger.LogInformation(
            "Supplier created. Id: {SupplierId} Name: {Name}", created.Id, created.Name);
        return ToResponseDto(created);
    }

    public async Task<SupplierResponseDto> UpdateAsync(
        int id, UpdateSupplierDto dto, CancellationToken ct = default)
    {
        var supplier = await _repo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Supplier with ID {id} was not found.");

        // Guard: name collision (excluding self)
        if (dto.Name is not null)
        {
            var existing = await _repo.GetByNameAsync(dto.Name.Trim(), ct);
            if (existing is not null && existing.Id != id)
                throw new InvalidOperationException(
                    $"A supplier named '{dto.Name}' already exists.");
        }

        if (dto.Name          is not null) supplier.Name          = dto.Name.Trim();
        if (dto.Email         is not null) supplier.Email         = dto.Email.Trim().ToLowerInvariant();
        if (dto.Phone         is not null) supplier.Phone         = dto.Phone.Trim();
        if (dto.Address       is not null) supplier.Address       = dto.Address.Trim();
        if (dto.ContactPerson is not null) supplier.ContactPerson = dto.ContactPerson.Trim();
        if (dto.Website       is not null) supplier.Website       = dto.Website.Trim();
        if (dto.Notes         is not null) supplier.Notes         = dto.Notes.Trim();
        if (dto.IsActive      is not null) supplier.IsActive      = dto.IsActive.Value;

        supplier.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(supplier, ct);

        _logger.LogInformation("Supplier updated. Id: {SupplierId}", id);
        return ToResponseDto(supplier);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var supplier = await _repo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Supplier with ID {id} was not found.");

        // Guard: don't delete if products reference this supplier
        if (await _repo.HasProductsAsync(id, ct))
            throw new InvalidOperationException(
                "Cannot delete this supplier — they have active products. " +
                "Reassign the products first or deactivate the supplier instead.");

        supplier.IsDeleted = true;
        supplier.IsActive  = false;
        supplier.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(supplier, ct);

        _logger.LogInformation("Supplier soft-deleted. Id: {SupplierId}", id);
    }

    public async Task<IEnumerable<ProductSummaryDto>> GetSupplierProductsAsync(
        int supplierId, CancellationToken ct = default)
    {
        if (!await _repo.ExistsAsync(s => s.Id == supplierId, ct))
            throw new KeyNotFoundException($"Supplier with ID {supplierId} was not found.");

        var products = await _productRepo.GetBySupplierAsync(supplierId, ct);
        return products.Select(p => new ProductSummaryDto(
            p.Id, p.Name, p.SKU, p.Price, p.IsActive,
            p.Category?.Name ?? string.Empty,
            p.Inventory?.QuantityOnHand,
            p.Inventory?.IsLowStock ?? false));
    }

    // ── Private mapper ─────────────────────────────────────────────────────────

    private static SupplierResponseDto ToResponseDto(Supplier s) =>
        new(s.Id, s.Name, s.Email, s.Phone, s.Address, s.ContactPerson,
            s.Website, s.IsActive, s.Products.Count, s.CreatedAt);
}
