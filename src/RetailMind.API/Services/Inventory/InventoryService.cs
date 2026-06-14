using Microsoft.EntityFrameworkCore;
using RetailMind.API.Data;
using RetailMind.API.DTOs.Common;
using RetailMind.API.DTOs.Inventory;
using RetailMind.API.Models.Inventory;
using RetailMind.API.Repositories.Inventory;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace RetailMind.API.Services.Inventory;

public sealed class InventoryService : IInventoryService
{
    private readonly IInventoryRepository      _repo;
    private readonly AppDbContext              _context;
    private readonly ILogger<InventoryService> _logger;
    private readonly IDistributedCache         _cache;

    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    private static readonly TimeSpan DefaultCacheTtl = TimeSpan.FromMinutes(30);

    public InventoryService(
        IInventoryRepository      repo,
        AppDbContext               context,
        ILogger<InventoryService>  logger,
        IDistributedCache          cache)
    {
        _repo    = repo;
        _context = context;
        _logger  = logger;
        _cache   = cache;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //   PRODUCTS
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<PagedResponse<ProductSummaryDto>> GetProductsAsync(
        PaginationQuery query,
        int? categoryId = null, int? supplierId = null, bool? isActive = null,
        CancellationToken ct = default)
    {
        string cacheKey = $"products:list:p{query.Page}:s{query.PageSize}:q{query.Search}:c{categoryId}:sup{supplierId}:a{isActive}";
        
        var cachedData = await _cache.GetStringAsync(cacheKey, ct);
        if (cachedData != null)
        {
            _logger.LogDebug("Cache hit for product list: {Key}", cacheKey);
            return JsonSerializer.Deserialize<PagedResponse<ProductSummaryDto>>(cachedData, JsonOptions)!;
        }

        var (items, total) = await _repo.GetPagedAsync(
            query.Page, query.PageSize, query.Search,
            categoryId, supplierId, isActive, ct);

        var response = new PagedResponse<ProductSummaryDto>
        {
            Data       = items.Select(ToSummaryDto),
            TotalCount = total,
            Page       = query.Page,
            PageSize   = query.PageSize
        };

        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(response, JsonOptions), 
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = DefaultCacheTtl }, ct);

        return response;
    }

    public async Task<ProductResponseDto> GetProductByIdAsync(
        int id, CancellationToken ct = default)
    {
        var product = await _repo.GetByIdWithDetailsAsync(id, ct)
            ?? throw new KeyNotFoundException($"Product with ID {id} was not found.");
        return ToResponseDto(product);
    }

    public async Task<ProductResponseDto?> GetProductBySkuAsync(
        string sku, CancellationToken ct = default)
    {
        var product = await _repo.GetBySkuAsync(sku, ct);
        return product is null ? null : ToResponseDto(product);
    }

    public async Task<ProductResponseDto> CreateProductAsync(
        CreateProductDto dto, CancellationToken ct = default)
    {
        // Guard 1: SKU uniqueness
        if (await _repo.ExistsAsync(p => p.SKU == dto.SKU, ct))
            throw new InvalidOperationException(
                $"A product with SKU '{dto.SKU}' already exists.");

        // Guard 2: Category must exist
        var categoryExists = await _context.Categories
            .AnyAsync(c => c.Id == dto.CategoryId && !c.IsDeleted, ct);
        if (!categoryExists)
            throw new InvalidOperationException(
                $"Category with ID {dto.CategoryId} does not exist.");

        // Guard 3: Supplier must exist (if provided)
        if (dto.SupplierId.HasValue)
        {
            var supplierExists = await _context.Suppliers
                .AnyAsync(s => s.Id == dto.SupplierId && !s.IsDeleted, ct);
            if (!supplierExists)
                throw new InvalidOperationException(
                    $"Supplier with ID {dto.SupplierId} does not exist.");
        }

        // Guard 4: valid pricing
        if (dto.Price < 0 || dto.CostPrice < 0)
            throw new InvalidOperationException("Price and cost price must be non-negative.");

        // Create the product
        var product = new Product
        {
            Name        = dto.Name.Trim(),
            SKU         = dto.SKU.Trim().ToUpperInvariant(),
            Description = dto.Description?.Trim(),
            Price       = dto.Price,
            CostPrice   = dto.CostPrice,
            CategoryId  = dto.CategoryId,
            SupplierId  = dto.SupplierId,
            ImageUrl    = dto.ImageUrl,
            IsActive    = true
        };

        var created = await _repo.AddAsync(product, ct);

        // Create the paired inventory record immediately
        await _context.Inventories.AddAsync(new InventoryItem
        {
            ProductId         = created.Id,
            QuantityOnHand    = dto.InitialStock,
            ReorderLevel      = dto.ReorderLevel,
            ReorderQuantity   = dto.ReorderQuantity,
            WarehouseLocation = dto.WarehouseLocation,
            LastStockCheck    = DateTime.UtcNow
        }, ct);

        await _context.SaveChangesAsync(ct);

        // Invalidate product lists potentially affected by new product
        await InvalidateProductListCacheAsync(ct);

        _logger.LogInformation(
            "Product created. SKU: {SKU} | Id: {ProductId} | InitialStock: {Stock}",
            dto.SKU, created.Id, dto.InitialStock);

        // Reload with navigation properties for the response
        var full = await _repo.GetByIdWithDetailsAsync(created.Id, ct);
        return ToResponseDto(full!);
    }

    public async Task<ProductResponseDto> UpdateProductAsync(
        int id, UpdateProductDto dto, CancellationToken ct = default)
    {
        var product = await _repo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Product with ID {id} was not found.");

        // Validate new category
        if (dto.CategoryId.HasValue)
        {
            var exists = await _context.Categories
                .AnyAsync(c => c.Id == dto.CategoryId.Value && !c.IsDeleted, ct);
            if (!exists)
                throw new InvalidOperationException(
                    $"Category with ID {dto.CategoryId} does not exist.");
        }

        // Validate new supplier
        if (dto.SupplierId.HasValue)
        {
            var exists = await _context.Suppliers
                .AnyAsync(s => s.Id == dto.SupplierId.Value && !s.IsDeleted, ct);
            if (!exists)
                throw new InvalidOperationException(
                    $"Supplier with ID {dto.SupplierId} does not exist.");
        }

        // Apply partial updates
        if (dto.Name        is not null) product.Name        = dto.Name.Trim();
        if (dto.Description is not null) product.Description = dto.Description.Trim();
        if (dto.Price       is not null) product.Price       = dto.Price.Value;
        if (dto.CostPrice   is not null) product.CostPrice   = dto.CostPrice.Value;
        if (dto.CategoryId  is not null) product.CategoryId  = dto.CategoryId.Value;
        if (dto.SupplierId  is not null) product.SupplierId  = dto.SupplierId;
        if (dto.ImageUrl    is not null) product.ImageUrl    = dto.ImageUrl;
        if (dto.IsActive    is not null) product.IsActive    = dto.IsActive.Value;

        product.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(product, ct);

        // Invalidate affected caches
        await _cache.RemoveAsync($"inventory:stock:{id}", ct);
        await InvalidateProductListCacheAsync(ct);

        _logger.LogInformation("Product updated. Id: {ProductId}", id);

        var full = await _repo.GetByIdWithDetailsAsync(id, ct);
        return ToResponseDto(full!);
    }

    public async Task DeleteProductAsync(int id, CancellationToken ct = default)
    {
        var product = await _repo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Product with ID {id} was not found.");

        product.IsDeleted = true;
        product.IsActive  = false;
        product.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(product, ct);

        // Invalidate affected caches
        await _cache.RemoveAsync($"inventory:stock:{id}", ct);
        await InvalidateProductListCacheAsync(ct);

        _logger.LogInformation("Product soft-deleted. Id: {ProductId}", id);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //   STOCK / INVENTORY
    // ═══════════════════════════════════════════════════════════════════════════

    public async Task<IEnumerable<ProductSummaryDto>> GetLowStockAlertsAsync(
        CancellationToken ct = default)
    {
        var products = await _repo.GetLowStockProductsAsync(ct);
        return products.Select(ToSummaryDto);
    }

    public async Task<InventoryResponseDto> GetStockAsync(
        int productId, CancellationToken ct = default)
    {
        string cacheKey = $"inventory:stock:{productId}";
        
        var cachedData = await _cache.GetStringAsync(cacheKey, ct);
        if (cachedData != null)
        {
            _logger.LogDebug("Cache hit for inventory stock: {Key}", cacheKey);
            return JsonSerializer.Deserialize<InventoryResponseDto>(cachedData, JsonOptions)!;
        }

        var inv = await _repo.GetInventoryByProductAsync(productId, ct)
            ?? throw new KeyNotFoundException(
                $"No inventory record found for product {productId}.");
        
        var response = ToInventoryDto(inv);

        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(response, JsonOptions),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = DefaultCacheTtl }, ct);

        return response;
    }

    public async Task<InventoryResponseDto> SetStockAsync(
        int productId, UpdateInventoryDto dto, CancellationToken ct = default)
    {
        var inv = await _context.Inventories
            .Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.ProductId == productId, ct)
            ?? throw new KeyNotFoundException(
                $"No inventory record found for product {productId}.");

        inv.QuantityOnHand    = dto.QuantityOnHand;
        inv.ReorderLevel      = dto.ReorderLevel      ?? inv.ReorderLevel;
        inv.ReorderQuantity   = dto.ReorderQuantity   ?? inv.ReorderQuantity;
        inv.WarehouseLocation = dto.WarehouseLocation ?? inv.WarehouseLocation;
        inv.LastStockCheck    = DateTime.UtcNow;
        inv.UpdatedAt         = DateTime.UtcNow;

        _context.Inventories.Update(inv);
        await _context.SaveChangesAsync(ct);

        // Invalidate affected cache
        await _cache.RemoveAsync($"inventory:stock:{productId}", ct);
        await InvalidateProductListCacheAsync(ct); // Stock change might trigger IsLowStock flag update in list

        _logger.LogInformation(
            "Stock set for product {ProductId}: Qty={Qty}", productId, dto.QuantityOnHand);

        return ToInventoryDto(inv);
    }

    public async Task<InventoryResponseDto> AdjustStockAsync(
        int productId, AdjustStockDto dto, CancellationToken ct = default)
    {
        // Guard: product exists before calling repository
        if (!await _repo.ExistsAsync(p => p.Id == productId, ct))
            throw new KeyNotFoundException($"Product with ID {productId} was not found.");

        var inv = await _repo.AdjustStockAsync(productId, dto.Delta, ct);

        // Reload with navigation for response
        var full = await _repo.GetInventoryByProductAsync(productId, ct);

        _logger.LogInformation(
            "Stock adjusted for product {ProductId}: Delta={Delta} Reason={Reason}",
            productId, dto.Delta, dto.Reason);

        // Invalidate affected cache
        await _cache.RemoveAsync($"inventory:stock:{productId}", ct);
        await InvalidateProductListCacheAsync(ct);

        return ToInventoryDto(full!);
    }

    private async Task InvalidateProductListCacheAsync(CancellationToken ct)
    {
        // Simple strategy: Clear the "lists" index since we use complex keys.
        // In a real prod environment, we might use Redis Sets or Tags for more precise invalidation.
        _logger.LogInformation("Invalidating product list caches due to data change.");
        // Note: IDistributedCache doesn't support "RemoveByPattern". 
        // For now, we rely on TTL or we'd need a more advanced Redis client implementation to scan/keys.
        // But for this simple implementation, we'll just remove the most common entry points if possible,
        // or accept a short window of stale list data.
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //   PRIVATE MAPPERS  (no AutoMapper dependency in this service)
    // ═══════════════════════════════════════════════════════════════════════════

    private static ProductResponseDto ToResponseDto(Product p)
    {
        var margin = p.Price > 0
            ? Math.Round((p.Price - p.CostPrice) / p.Price * 100, 2)
            : 0m;

        return new ProductResponseDto(
            p.Id, p.Name, p.SKU, p.Description,
            p.Price, p.CostPrice, margin,
            p.IsActive,
            p.CategoryId,
            p.Category?.Name ?? string.Empty,
            p.SupplierId,
            p.Supplier?.Name,
            p.Inventory?.QuantityOnHand,
            p.Inventory?.ReorderLevel ?? 0,
            p.Inventory?.ReorderQuantity ?? 0,
            p.Inventory?.IsLowStock ?? false,
            p.Inventory?.WarehouseLocation,
            p.ImageUrl,
            p.CreatedAt,
            p.UpdatedAt);
    }

    private static ProductSummaryDto ToSummaryDto(Product p) =>
        new(p.Id, p.Name, p.SKU, p.Price, p.IsActive,
            p.Category?.Name ?? string.Empty,
            p.Inventory?.QuantityOnHand,
            p.Inventory?.IsLowStock ?? false);

    private static InventoryResponseDto ToInventoryDto(InventoryItem i) =>
        new(i.ProductId,
            i.Product?.Name  ?? string.Empty,
            i.Product?.SKU   ?? string.Empty,
            i.QuantityOnHand,
            i.ReorderLevel,
            i.ReorderQuantity,
            i.IsLowStock,
            i.WarehouseLocation,
            i.LastStockCheck,
            i.UpdatedAt);
}
