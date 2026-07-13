namespace RetailMind.API.DTOs.Inventory;

// ─────────────────────────────────────────────────────────────────────────────
//   PRODUCT DTOs
// ─────────────────────────────────────────────────────────────────────────────

/// <summary>Payload for creating a new product in the catalog.</summary>
public sealed record CreateProductDto(
    string  Name,
    string  SKU,
    string? Description,
    decimal Price,
    decimal CostPrice,
    int     CategoryId,
    int?    SupplierId,
    string? ImageUrl,
    int     InitialStock     = 0,
    int     ReorderLevel     = 10,
    int     ReorderQuantity  = 50,
    string? WarehouseLocation = null);

/// <summary>Partial update — only provided (non-null) fields are applied.</summary>
public sealed record UpdateProductDto(
    string?  Name,
    string?  Description,
    decimal? Price,
    decimal? CostPrice,
    int?     CategoryId,
    int?     SupplierId,
    string?  ImageUrl,
    bool?    IsActive);

/// <summary>Full product detail including stock and supplier info.</summary>
public sealed record ProductResponseDto(
    int      Id,
    string   Name,
    string   SKU,
    string?  Description,
    decimal  Price,
    decimal  CostPrice,
    decimal  Margin,           // computed: ((Price - CostPrice) / Price) * 100
    bool     IsActive,
    int      CategoryId,
    string   CategoryName,
    int?     SupplierId,
    string?  SupplierName,
    int?     StockQuantity,
    int      ReorderLevel,
    int      ReorderQuantity,
    bool     IsLowStock,
    string?  WarehouseLocation,
    string?  ImageUrl,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

/// <summary>Lightweight product card for list views.</summary>
public sealed record ProductSummaryDto(
    int      Id,
    string   Name,
    string   SKU,
    decimal  Price,
    bool     IsActive,
    string   CategoryName,
    int?     StockQuantity,
    bool     IsLowStock);

// ─────────────────────────────────────────────────────────────────────────────
//   INVENTORY / STOCK DTOs
// ─────────────────────────────────────────────────────────────────────────────

/// <summary>Adjust stock levels for a product.</summary>
public sealed record UpdateInventoryDto(
    int     QuantityOnHand,
    int?    ReorderLevel,
    int?    ReorderQuantity,
    string? WarehouseLocation,
    string? AdjustmentReason = null);

/// <summary>Adjust stock by a delta (positive = receive, negative = consume).</summary>
public sealed record AdjustStockDto(
    int    Delta,
    string Reason);

public sealed record InventoryResponseDto(
    int      ProductId,
    string   ProductName,
    string   ProductSku,
    int      QuantityOnHand,
    int      ReorderLevel,
    int      ReorderQuantity,
    bool     IsLowStock,
    string?  WarehouseLocation,
    DateTime LastStockCheck,
    DateTime? UpdatedAt);

// ─────────────────────────────────────────────────────────────────────────────
//   SUPPLIER DTOs
// ─────────────────────────────────────────────────────────────────────────────

public sealed record CreateSupplierDto(
    string  Name,
    string? Email,
    string? Phone,
    string? Address,
    string? ContactPerson,
    string? Website,
    string? Notes);

public sealed record UpdateSupplierDto(
    string? Name,
    string? Email,
    string? Phone,
    string? Address,
    string? ContactPerson,
    string? Website,
    string? Notes,
    bool?   IsActive);

public sealed record SupplierResponseDto(
    int      Id,
    string   Name,
    string?  Email,
    string?  Phone,
    string?  Address,
    string?  ContactPerson,
    string?  Website,
    bool     IsActive,
    int      ProductCount,
    DateTime CreatedAt);

public sealed record SupplierSummaryDto(
    int    Id,
    string Name,
    bool   IsActive,
    int    ProductCount);

// ─────────────────────────────────────────────────────────────────────────────
//   CATEGORY DTOs
// ─────────────────────────────────────────────────────────────────────────────

public sealed record CreateCategoryDto(
    string  Name,
    string? Description,
    int?    ParentId);

public sealed record UpdateCategoryDto(
    string? Name,
    string? Description,
    int?    ParentId);

public sealed record CategoryResponseDto(
    int      Id,
    string   Name,
    string?  Description,
    int?     ParentId,
    string?  ParentName,
    int      ProductCount,
    int      ChildCount,
    DateTime CreatedAt);

public sealed record CategoryTreeDto(
    int      Id,
    string   Name,
    string?  Description,
    IEnumerable<CategoryTreeDto> Children);
