using System.Text;
using System.Text.Json;
using RetailMind.API.DTOs.ML;
using Microsoft.Extensions.Logging;

namespace RetailMind.API.Services.ML
{
    public class MLService : IMLService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<MLService> _logger;

        public MLService(HttpClient httpClient, ILogger<MLService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<DemandPredictionResponseDto?> PredictDemandAsync(DemandPredictionRequestDto request)
        {
            try
            {
                var jsonContent = JsonSerializer.Serialize(request);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync("/predict-demand", content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning($"ML API Demand Prediction returned status {response.StatusCode}.");
                    return null;
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<DemandPredictionResponseDto>(jsonResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception calling ML API Demand Prediction endpoint.");
                return null;
            }
        }

        public async Task<DeliveryPredictionResponseDto?> PredictDeliveryAsync(DeliveryPredictionRequestDto request)
        {
            try
            {
                var jsonContent = JsonSerializer.Serialize(request);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync("/predict-delivery", content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning($"ML API Delivery Prediction returned status {response.StatusCode}.");
                    return null;
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<DeliveryPredictionResponseDto>(jsonResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception calling ML API Delivery Prediction endpoint.");
                return null;
            }
        }
    }
}
