using System.Text.Json.Serialization;

namespace RetailMind.API.DTOs.ML
{
    public class DemandPredictionRequestDto
    {
        [JsonPropertyName("ProductId")]
        public int ProductId { get; set; }
        
        [JsonPropertyName("Date")]
        public string Date { get; set; } = string.Empty; // Format: YYYY-MM-DD
        
        [JsonPropertyName("Price")]
        public decimal Price { get; set; }
        
        [JsonPropertyName("Promotion")]
        public string Promotion { get; set; } = "No"; // "Yes" or "No"
    }

    public class DemandPredictionResponseDto
    {
        [JsonPropertyName("TargetProductId")]
        public int TargetProductId { get; set; }

        [JsonPropertyName("TargetDate")]
        public string TargetDate { get; set; } = string.Empty;

        [JsonPropertyName("PredictedSalesQuantity")]
        public int PredictedSalesQuantity { get; set; }
    }

    public class DeliveryPredictionRequestDto
    {
        [JsonPropertyName("Distance")]
        public double Distance { get; set; }
        
        [JsonPropertyName("OrderVolume")]
        public int OrderVolume { get; set; }
        
        [JsonPropertyName("TrafficLevel")]
        public string TrafficLevel { get; set; } = "Medium"; 
        
        [JsonPropertyName("Weather")]
        public string Weather { get; set; } = "Clear"; 
    }

    public class DeliveryPredictionResponseDto
    {
        [JsonPropertyName("PredictedDeliveryTimeMinutes")]
        public int PredictedDeliveryTimeMinutes { get; set; }

        [JsonPropertyName("TransitSLA")]
        public string TransitSLA { get; set; } = string.Empty;
    }
}
