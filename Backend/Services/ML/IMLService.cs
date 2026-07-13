using RetailMind.API.DTOs.ML;

namespace RetailMind.API.Services.ML
{
    public interface IMLService
    {
        Task<DemandPredictionResponseDto?> PredictDemandAsync(DemandPredictionRequestDto request);
        Task<DeliveryPredictionResponseDto?> PredictDeliveryAsync(DeliveryPredictionRequestDto request);
    }
}
