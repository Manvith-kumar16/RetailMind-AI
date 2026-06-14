using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using Moq;
using RetailMind.API.Data;
using RetailMind.API.DTOs.Orders;
using RetailMind.API.Models.Inventory;
using RetailMind.API.Models.Orders;
using RetailMind.API.Repositories.Orders;
using RetailMind.API.Services.Orders;
using FluentAssertions;
using Xunit;

namespace RetailMind.Tests.Services
{
    public class OrderServiceTests : IDisposable
    {
        private readonly Mock<IOrderRepository> _repoMock;
        private readonly Mock<ILogger<OrderService>> _loggerMock;
        private readonly AppDbContext _context;

        public OrderServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            _context = new AppDbContext(options);
            _repoMock = new Mock<IOrderRepository>();
            _loggerMock = new Mock<ILogger<OrderService>>();
        }

        [Fact]
        public async Task CreateOrderAsync_SufficientStock_ReturnsSuccess()
        {
            // Arrange
            var customerId = "test-user";
            var productId = 1;
            
            // Seed a product with inventory
            var product = new Product 
            { 
                Id = productId, 
                Name = "Test Product", 
                Price = 100m, 
                SKU = "TEST-SKU",
                CategoryId = 1,
                IsActive = true,
                Inventory = new InventoryItem { ProductId = productId, QuantityOnHand = 10 }
            };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var dto = new CreateOrderDto(
                OrderType.Standard,
                new List<CreateOrderItemDto>
                {
                    new CreateOrderItemDto(productId, 2)
                }
            );

            _repoMock.Setup(r => r.GenerateOrderNumberAsync(It.IsAny<CancellationToken>()))
                     .ReturnsAsync("ORD-001");

            var service = new OrderService(_repoMock.Object, _context, _loggerMock.Object);

            // Act
            var result = await service.CreateOrderAsync(customerId, dto);

            // Assert
            result.Should().NotBeNull();
            result.OrderNumber.Should().Be("ORD-001");
            
            // Verify stock was deducted
            var updatedProduct = await _context.Products.Include(p => p.Inventory).FirstAsync(p => p.Id == productId);
            updatedProduct.Inventory!.QuantityOnHand.Should().Be(8);
        }

        [Fact]
        public async Task CreateOrderAsync_InsufficientStock_ThrowsInvalidOperationException()
        {
            // Arrange
            var customerId = "test-user";
            var productId = 2;

            var product = new Product 
            { 
                Id = productId, 
                Name = "Test Product", 
                Price = 100m, 
                SKU = "TEST-SKU-2",
                CategoryId = 1,
                IsActive = true,
                Inventory = new InventoryItem { ProductId = productId, QuantityOnHand = 1 }
            };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var dto = new CreateOrderDto(
                OrderType.Standard,
                new List<CreateOrderItemDto>
                {
                    new CreateOrderItemDto(productId, 5)
                }
            );

            var service = new OrderService(_repoMock.Object, _context, _loggerMock.Object);


            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => 
                service.CreateOrderAsync(customerId, dto));
        }

        [Fact]
        public async Task CancelOrderAsync_UnauthorizedUser_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var orderId = 1;
            var ownerId = "owner";
            var intruderId = "intruder";

            var order = new Order 
            { 
                Id = orderId, 
                OrderNumber = "ORD-99", 
                CustomerId = ownerId,
                Status = OrderStatus.Pending,
                Type = OrderType.Standard,
                Items = new List<OrderItem>()
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var service = new OrderService(_repoMock.Object, _context, _loggerMock.Object);

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
                service.CancelOrderAsync(orderId, intruderId));
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
