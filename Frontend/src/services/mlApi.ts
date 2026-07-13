// Mock ML API Service
// In a full production environment, this would call the C# backend API,
// which in turn would call the Python ML microservice.

export interface DemandPredictionRequest {
  productId: number;
  date: string; // YYYY-MM-DD
  price: number;
  promotion: string; // 'Yes' or 'No'
}

export interface DemandPredictionResponse {
  targetProductId: number;
  targetDate: string;
  predictedSalesQuantity: number;
  confidenceInterval: [number, number]; // Added for UI visualization
  historicalContext: { date: string, sales: number }[]; // Added for charting
}

export interface DeliveryPredictionRequest {
  distance: number;
  orderVolume: number;
  trafficLevel: string; // 'Low', 'Medium', 'High'
  weather: string; // 'Clear', 'Rain', 'Snow'
}

export interface DeliveryPredictionResponse {
  predictedDeliveryTimeMinutes: number;
  transitSla: string;
  confidenceScore: number; // Percentage (e.g., 92)
  riskFactors: string[];
}

export const mlApi = {
  predictDemand: async (request: DemandPredictionRequest): Promise<DemandPredictionResponse> => {
    // Simulate network latency (ML inference takes time)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock an intelligent response based on inputs
    let baseSales = 150;
    if (request.price < 50) baseSales += 80;
    if (request.promotion === 'Yes') baseSales *= 1.5;

    // Add some random noise
    const predictedSalesQuantity = Math.floor(baseSales + (Math.random() * 40 - 20));

    // Generate some mock historical chart data leading up to the target date
    const historicalContext = [];
    const targetDate = new Date(request.date);
    for (let i = 7; i > 0; i--) {
      const d = new Date(targetDate);
      d.setDate(d.getDate() - i);
      historicalContext.push({
        date: d.toISOString().split('T')[0],
        sales: Math.floor(predictedSalesQuantity * (0.8 + Math.random() * 0.4))
      });
    }

    return {
      targetProductId: request.productId,
      targetDate: request.date,
      predictedSalesQuantity,
      confidenceInterval: [
        Math.floor(predictedSalesQuantity * 0.85),
        Math.floor(predictedSalesQuantity * 1.15)
      ],
      historicalContext
    };
  },

  predictDelivery: async (request: DeliveryPredictionRequest): Promise<DeliveryPredictionResponse> => {
    // Simulate network latency (ML inference takes time)
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Mock logic based on input
    let baseMinutes = (request.distance / 40) * 60; // Assume 40km/h avg speed
    baseMinutes += (request.orderVolume * 0.5); // Add time for processing volume

    const riskFactors: string[] = [];

    if (request.trafficLevel === 'High') {
      baseMinutes *= 1.4;
      riskFactors.push('High Traffic Multiplier');
    } else if (request.trafficLevel === 'Medium') {
      baseMinutes *= 1.1;
    }

    if (request.weather === 'Snow') {
      baseMinutes *= 1.5;
      riskFactors.push('Severe Weather Delay (Snow)');
    } else if (request.weather === 'Rain') {
      baseMinutes *= 1.2;
      riskFactors.push('Inclement Weather Delay (Rain)');
    }

    const predictedMins = Math.floor(baseMinutes);
    let transitSla = 'Standard';
    if (predictedMins < 60) transitSla = 'Hyper-Local Express';
    else if (predictedMins < 180) transitSla = 'Same-Day Regional';
    else transitSla = 'Next-Day Transit';

    let confidenceScore = 95;
    if (riskFactors.length > 0) confidenceScore -= (riskFactors.length * 8);

    return {
      predictedDeliveryTimeMinutes: predictedMins,
      transitSla,
      confidenceScore,
      riskFactors
    };
  }
};
