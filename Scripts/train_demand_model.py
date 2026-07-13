import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib

def main():
    # Paths
    dataset_path = os.path.join('datasets', 'demand_forecasting.csv')
    models_dir = 'models'
    os.makedirs(models_dir, exist_ok=True)

    # 1. Load dataset
    print(f"Loading dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path)

    # 2. Data preprocessing
    print("Preprocessing data...")
    # Convert date to datetime
    df['Date'] = pd.to_datetime(df['Date'])

    # Extract date features
    df['Year'] = df['Date'].dt.year
    df['Month'] = df['Date'].dt.month
    df['Day'] = df['Date'].dt.day
    # 'DayOfWeek' and 'Season' are already in the dataset

    # Drop the original Date column 
    df = df.drop(columns=['Date'])

    # Define Features (X) and Target (y)
    X = df.drop(columns=['SalesQuantity'])
    y = df['SalesQuantity']

    # Identify categorical and numerical columns
    categorical_cols = ['Promotion', 'DayOfWeek', 'Season']
    numerical_cols = ['ProductId', 'Price', 'Year', 'Month', 'Day']

    # Preprocessing pipelines
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')

    # Bundle preprocessing for numerical and categorical data
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numerical_cols),
            ('cat', categorical_transformer, categorical_cols)
        ])

    # Split data into train and test sets (80% train, 20% test)
    # Using a temporal approach is ideal, but here we do random sampling for general robust baseline
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 3. Train models
    # a. Linear Regression (Baseline)
    print("\nTraining Linear Regression (Baseline)...")
    lr_pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                                  ('model', LinearRegression())])
    lr_pipeline.fit(X_train, y_train)
    y_pred_lr = lr_pipeline.predict(X_test)

    # Evaluate Linear Regression
    lr_mae = mean_absolute_error(y_test, y_pred_lr)
    lr_rmse = np.sqrt(mean_squared_error(y_test, y_pred_lr))
    print(f"[Linear Regression] MAE: {lr_mae:.4f} | RMSE: {lr_rmse:.4f}")

    # b. Random Forest Regressor (Advanced)
    print("\nTraining Random Forest Regressor (Advanced)...")
    rf_pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                                  ('model', RandomForestRegressor(n_estimators=100, random_state=42))])
    rf_pipeline.fit(X_train, y_train)
    y_pred_rf = rf_pipeline.predict(X_test)

    # Evaluate Random Forest
    rf_mae = mean_absolute_error(y_test, y_pred_rf)
    rf_rmse = np.sqrt(mean_squared_error(y_test, y_pred_rf))
    print(f"[Random Forest] MAE: {rf_mae:.4f} | RMSE: {rf_rmse:.4f}")

    # 5. Save the best model
    # Random Forest should theoretically perform better on non-linear interaction features
    rf_model_path = os.path.join(models_dir, 'demand_rf_model.joblib')
    print(f"\nSaving optimized model (Random Forest) to {rf_model_path}...")
    joblib.dump(rf_pipeline, rf_model_path)
    
    # Save the baseline as well just in case
    lr_model_path = os.path.join(models_dir, 'demand_lr_baseline.joblib')
    joblib.dump(lr_pipeline, lr_model_path)
    print("Models saved successfully!")

if __name__ == "__main__":
    main()
