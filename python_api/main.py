from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, validator
import joblib
import pandas as pd
import os
from datetime import datetime
import uvicorn

app = FastAPI(
    title="RetailMind AI - Machine Learning API",
    description="REST API to serve Demand Forecasting and Delivery Prediction models natively in Python.",
    version="1.0.0"
)

# Load Models globally so they stay in memory on server start
try:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DEMAND_MODEL_PATH = os.path.join(BASE_DIR, 'models', 'demand_rf_model.joblib')
    DELIVERY_MODEL_PATH = os.path.join(BASE_DIR, 'models', 'delivery_gb_model.joblib')
    
    demand_model = joblib.load(DEMAND_MODEL_PATH)
    delivery_model = joblib.load(DELIVERY_MODEL_PATH)
    print("Machine Learning Models loaded successfully into memory.")
except Exception as e:
    print(f"Error loading models: {str(e)}")
    demand_model = None
    delivery_model = None

# --------------------------------------------------------------------------
# Pydantic Schemas for Input Validation
# --------------------------------------------------------------------------

class DemandRequest(BaseModel):
    ProductId: int = Field(..., gt=0, description="SKU / Product Identifier")
    Date: str = Field(..., description="Target Date in YYYY-MM-DD format")
    Price: float = Field(..., gt=0, description="Current price of the product target")
    Promotion: str = Field(..., description="Is promotion active? 'Yes' or 'No'")

    @validator('Date')
    def validate_date(cls, v):
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Date MUST be precisely in YYYY-MM-DD format")
        return v
        
    @validator('Promotion')
    def validate_promotion(cls, v):
        if v not in ["Yes", "No"]:
            raise ValueError("Promotion MUST be exactly 'Yes' or 'No'")
        return v

class DeliveryRequest(BaseModel):
    Distance: float = Field(..., gt=0, description="Delivery route distance in kilometers")
    OrderVolume: int = Field(..., gt=0, description="Number of items being shipped")
    TrafficLevel: str = Field(..., description="Severity of traffic. Valid: 'Low', 'Medium', 'High'")
    Weather: str = Field(..., description="Expected weather. Valid: 'Clear', 'Rainy'")

    @validator('TrafficLevel')
    def validate_traffic(cls, v):
        if v not in ["Low", "Medium", "High"]:
            raise ValueError("TrafficLevel MUST be one of: Low, Medium, High")
        return v

    @validator('Weather')
    def validate_weather(cls, v):
        if v not in ["Clear", "Rainy"]:
            raise ValueError("Weather MUST be one of: Clear, Rainy")
        return v


# --------------------------------------------------------------------------
# Helper / Feature Engineering Logic
# --------------------------------------------------------------------------

def get_season(month: int) -> str:
    if month in [12, 1, 2]:
        return "Winter"
    elif month in [3, 4, 5]:
        return "Spring"
    elif month in [6, 7, 8]:
        return "Summer"
    else:
        return "Autumn"

# --------------------------------------------------------------------------
# Endpoints
# --------------------------------------------------------------------------

@app.post("/predict-demand", tags=["Demand Forecasting"])
def predict_demand(request: DemandRequest):
    """
    Given basic product logic (ProductId, Date, Price, Promotion),
    this generates a high-accuracy inventory sales demand prediction.
    """
    if not demand_model:
        raise HTTPException(status_code=500, detail="Demand model is temporarily unavailable or not loaded.")
    
    try:
        # 1. Parse string Date into internal components for the Pipeline
        dt = datetime.strptime(request.Date, "%Y-%m-%d")
        
        # 2. Construct the exact dictionary structure the DataFrame requires
        input_data = {
            "ProductId": [request.ProductId],
            "Price": [request.Price],
            "Promotion": [request.Promotion],
            "DayOfWeek": [dt.strftime("%A")],
            "Season": [get_season(dt.month)],
            "Year": [dt.year],
            "Month": [dt.month],
            "Day": [dt.day]
        }
        
        # 3. Create DataFrame (the Scikit-Learn Pipeline will map these by standard string identity)
        df_input = pd.DataFrame(input_data)
        
        # 4. Score Request via Pipeline 
        prediction = demand_model.predict(df_input)
        
        # Clean output minimum bounds
        predicted_quantity = max(0, int(round(prediction[0])))
        
        return {
            "TargetProductId": request.ProductId,
            "TargetDate": request.Date,
            "PredictedSalesQuantity": predicted_quantity
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Inference pipeline execution error: {str(e)}")


@app.post("/predict-delivery", tags=["Supply Chain Routes"])
def predict_delivery(request: DeliveryRequest):
    """
    Calculates estimated Transit Service Level Agreement limits (Delivery Time in minutes). 
    Account for physical constraints plus environmental conditions.
    """
    if not delivery_model:
        raise HTTPException(status_code=500, detail="Delivery model is temporarily unavailable or not loaded.")
        
    try:
        # NOTE: Model expected feature exact name "Distance (km)"
        input_data = {
            "Distance (km)": [request.Distance],
            "OrderVolume": [request.OrderVolume],
            "TrafficLevel": [request.TrafficLevel],
            "Weather": [request.Weather]
        }
        
        df_input = pd.DataFrame(input_data)
        
        prediction = delivery_model.predict(df_input)
        
        # Delivery times should bottom out at ~10 mins realistically
        predicted_time = max(10, int(round(prediction[0])))
        
        return {
            "PredictedDeliveryTimeMinutes": predicted_time,
            "TransitSLA": "Met" if predicted_time < 60 else "At Risk" 
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Inference pipeline execution error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
