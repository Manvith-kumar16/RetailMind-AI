using AutoMapper;
using RetailMind.API.DTOs.Employees;
using RetailMind.API.DTOs.Inventory;
using RetailMind.API.DTOs.Orders;
using RetailMind.API.Models.Employees;
using RetailMind.API.Models.Inventory;
using RetailMind.API.Models.Orders;

namespace RetailMind.API.Helpers;

/// <summary>
/// AutoMapper profile — maps between domain models and DTOs.
/// Note: InventoryService uses explicit record constructors for complex projections.
/// AutoMapper is used for simpler 1:1 entity-to-DTO mappings.
/// </summary>
public sealed class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ── Inventory ────────────────────────────────────────────────────────
        CreateMap<Product, ProductSummaryDto>()
            .ForMember(d => d.CategoryName,  o => o.MapFrom(s => s.Category != null ? s.Category.Name : string.Empty))
            .ForMember(d => d.StockQuantity, o => o.MapFrom(s => s.Inventory != null ? s.Inventory.QuantityOnHand : (int?)null))
            .ForMember(d => d.IsLowStock,    o => o.MapFrom(s => s.Inventory != null && s.Inventory.IsLowStock));

        CreateMap<Supplier, SupplierSummaryDto>()
            .ForMember(d => d.ProductCount, o => o.MapFrom(s => s.Products.Count));

        CreateMap<Category, CategoryTreeDto>()
            .ForMember(d => d.Children, o => o.MapFrom(s => s.Children));

        // ── Orders ───────────────────────────────────────────────────────────
        // (Orders use explicit projection in OrderService for better performance and explicit control)

        // ── Employees ────────────────────────────────────────────────────────
        CreateMap<CreateEmployeeDto, Employee>();
        CreateMap<UpdateEmployeeDto, Employee>()
            .ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null));
        CreateMap<Employee, EmployeeResponseDto>();
    }
}

