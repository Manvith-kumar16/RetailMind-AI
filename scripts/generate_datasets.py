import pandas as pd
import numpy as np
import os
from datetime import timedelta, date

# Set random seed for reproducibility
np.random.seed(42)

# Create output directory
output_dir = "datasets"
os.makedirs(output_dir, exist_ok=True)

# -------------------------------------------------------------------------
# Dataset 1: Demand Forecasting
# Columns: Date, ProductId, SalesQuantity, Price, Promotion (Yes/No), DayOfWeek, Season
# -------------------------------------------------------------------------
print("Generating Demand Forecasting Dataset...")

num_rows_demand = 8000

# Generate Dates spanning roughly 2 years
start_date = date(2023, 1, 1)
dates = [start_date + timedelta(days=int(np.random.randint(0, 730))) for _ in range(num_rows_demand)]

# Helper functional to extract season
def get_season(d):
    month = d.month
    if month in [12, 1, 2]:
        return "Winter"
    elif month in [3, 4, 5]:
        return "Spring"
    elif month in [6, 7, 8]:
        return "Summer"
    else:
        return "Autumn"

day_of_week = [d.strftime("%A") for d in dates]
seasons = [get_season(d) for d in dates]

# Generate ProductIds (1 to 50)
product_ids = np.random.randint(1, 51, num_rows_demand)

# Generate Base Price for each product
base_prices = {pid: np.round(np.random.uniform(10.0, 500.0), 2) for pid in range(1, 51)}
prices = np.array([base_prices[pid] for pid in product_ids])

# Promotions (Yes/No) - 20% chance
promotions = np.random.choice(["Yes", "No"], size=num_rows_demand, p=[0.2, 0.8])

# Adjust Price if promotion is active (10-30% discount)
discount_factors = np.where(promotions == "Yes", np.random.uniform(0.7, 0.9, num_rows_demand), 1.0)
prices = np.round(prices * discount_factors, 2)

# Generate Sales Quantity logic
# Base sales (poisson distribution)
base_sales = np.random.poisson(lam=20, size=num_rows_demand)

# Boost for weekends
weekend_boost = np.where(pd.Series(day_of_week).isin(["Saturday", "Sunday"]), 1.5, 1.0)

# Boost for promotions
promo_boost = np.where(promotions == "Yes", 2.0, 1.0)

# Season boost logic
season_boosts = {"Winter": 1.2, "Spring": 1.0, "Summer": 1.1, "Autumn": 0.9}
season_boost = np.array([season_boosts[s] for s in seasons])

# Calculate final SalesQuantity (minimum 1)
sales_quantity = np.maximum(1, np.round(base_sales * weekend_boost * promo_boost * season_boost)).astype(int)

demand_df = pd.DataFrame({
    "Date": dates,
    "ProductId": product_ids,
    "SalesQuantity": sales_quantity,
    "Price": prices,
    "Promotion": promotions,
    "DayOfWeek": day_of_week,
    "Season": seasons
})

# Sort by Date and ProductId
demand_df = demand_df.sort_values(by=["Date", "ProductId"]).reset_index(drop=True)

demand_csv_path = os.path.join(output_dir, "demand_forecasting.csv")
demand_df.to_csv(demand_csv_path, index=False)
print(f"Saved to {demand_csv_path} with {len(demand_df)} rows.")


# -------------------------------------------------------------------------
# Dataset 2: Delivery Prediction
# Columns: Distance (km), OrderVolume, TrafficLevel (Low/Medium/High), Weather (Clear/Rainy), DeliveryTime (target)
# -------------------------------------------------------------------------
print("\nGenerating Delivery Prediction Dataset...")

num_rows_delivery = 8500

# Distance in km (1.0 to 50.0 km)
distances = np.round(np.random.uniform(1.0, 50.0, num_rows_delivery), 2)

# Order Volume (1 to 10 items)
order_volumes = np.random.randint(1, 11, num_rows_delivery)

# Traffic Level
traffic_levels = np.random.choice(["Low", "Medium", "High"], size=num_rows_delivery, p=[0.3, 0.5, 0.2])

# Weather
weathers = np.random.choice(["Clear", "Rainy"], size=num_rows_delivery, p=[0.75, 0.25])

# Calculate DeliveryTime (target in minutes)
# Base time: 5 minutes + 2 mins per km
base_time = 5.0 + (distances * 2.0)

# Volume penalty: 1 min per item
volume_penalty = order_volumes * 1.0

# Traffic penalty multiplier
traffic_multipliers = {"Low": 1.0, "Medium": 1.3, "High": 2.2}
traffic_mult = np.array([traffic_multipliers[t] for t in traffic_levels])

# Weather penalty multiplier
weather_multipliers = {"Clear": 1.0, "Rainy": 1.5}
weather_mult = np.array([weather_multipliers[w] for w in weathers])

# Final calculate with noise
delivery_time_raw = (base_time + volume_penalty) * traffic_mult * weather_mult
noise = np.random.normal(0, 4, num_rows_delivery) 
# Final delivery time should be at least reasonable (minimum 10 mins)
delivery_time = np.round(np.maximum(10.0, delivery_time_raw + noise)).astype(int)

delivery_df = pd.DataFrame({
    "Distance (km)": distances,
    "OrderVolume": order_volumes,
    "TrafficLevel": traffic_levels,
    "Weather": weathers,
    "DeliveryTime": delivery_time
})

delivery_csv_path = os.path.join(output_dir, "delivery_prediction.csv")
delivery_df.to_csv(delivery_csv_path, index=False)
print(f"Saved to {delivery_csv_path} with {len(delivery_df)} rows.")

print("\nDatasets successfully generated!")
