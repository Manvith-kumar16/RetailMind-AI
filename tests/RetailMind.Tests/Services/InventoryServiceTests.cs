using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using RetailMind.API.Data;
using RetailMind.API.DTOs.Inventory;
using RetailMind.API.Models.Inventory;
using RetailMind.API.Repositories.Inventory;
using RetailMind.API.Services.Inventory;
using FluentAssertions;
using Xunit;
using Microsoft.Extensions.Caching.Distributed;

namespace RetailMind.Tests.Services
{
    public class InventoryServiceTests : IDisposable
    {
        private readonly Mock<IInventoryRepository> _repoMock;
        private readonly Mock<ILogger<InventoryService>> _loggerMock;
        private readonly Mock<IDistributedCache> _cacheMock;
        private readonly AppDbContext _context;

        public InventoryServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _repoMock = new Mock<IInventoryRepository>();
            _loggerMock = new Mock<ILogger<InventoryService>>();
            _cacheMock = new Mock<IDistributedCache>();
            _cacheMock.Setup(c => c.GetAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                      .ReturnsAsync((byte[]?)null);
        }

        [Fact]
        public async Task GetStockAsync_ProductExists_ReturnsInventoryDto()
        {
            // Arrange
            var productId = 1;
            var inventory = new InventoryItem 
            { 
                ProductId = productId, 
                QuantityOnHand = 50, 
                ReorderLevel = 10,
                Product = new Product { Id = productId, Name = "Test Product", SKU = "TSKU" }
            };

            _repoMock.Setup(r => r.GetInventoryByProductAsync(productId, It.IsAny<CancellationToken>()))
                     .ReturnsAsync(inventory);

            var service = new InventoryService(_repoMock.Object, _context, _loggerMock.Object, _cacheMock.Object);

            // Act
            var result = await service.GetStockAsync(productId);

            // Assert
            result.Should().NotBeNull();
            result.QuantityOnHand.Should().Be(50);
            result.ProductName.Should().Be("Test Product");
        }

        [Fact]
        public async Task GetLowStockAlertsAsync_ReturnsOnlyLowStockProducts()
        {
            // Arrange
            var lowStockProduct = new Product 
            { 
                Id = 1, 
                Name = "Low Stock", 
                Inventory = new InventoryItem { QuantityOnHand = 5, ReorderLevel = 10 } 
            };
            
            var products = new List<Product> { lowStockProduct };

            _repoMock.Setup(r => r.GetLowStockProductsAsync(It.IsAny<CancellationToken>()))
                     .ReturnsAsync(products);

            var service = new InventoryService(_repoMock.Object, _context, _loggerMock.Object, _cacheMock.Object);

            // Act
            var result = await service.GetLowStockAlertsAsync();

            // Assert
            result.Should().HaveCount(1);
            result.First().IsLowStock.Should().BeTrue();
        }

        [Fact]
        public async Task GetStockAsync_ProductNotFound_ThrowsKeyNotFoundException()
        {
            // Arrange
            var productId = 999;
            _repoMock.Setup(r => r.GetInventoryByProductAsync(productId, It.IsAny<CancellationToken>()))
                     .ReturnsAsync((InventoryItem?)null);

            var service = new InventoryService(_repoMock.Object, _context, _loggerMock.Object, _cacheMock.Object);

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => 
                service.GetStockAsync(productId));
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
