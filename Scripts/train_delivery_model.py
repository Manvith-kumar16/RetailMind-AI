import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib

def main():
    # Paths
    dataset_path = os.path.join('datasets', 'delivery_prediction.csv')
    models_dir = 'models'
    os.makedirs(models_dir, exist_ok=True)

    # 1. Load dataset
    print(f"Loading dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path)

    # Define Features (X) and Target (y)
    X = df.drop(columns=['DeliveryTime'])
    y = df['DeliveryTime']

    # 2. Preprocess data
    print("Preprocessing data...")
    categorical_cols = ['TrafficLevel', 'Weather']
    numerical_cols = ['Distance (km)', 'OrderVolume']

    # Feature scaling (normalization) and categorical encoding
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numerical_cols),
            ('cat', categorical_transformer, categorical_cols)
        ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 3. Train models
    # a. Random Forest
    print("\nTraining Random Forest Regressor...")
    rf_pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                                  ('model', RandomForestRegressor(n_estimators=100, random_state=42))])
    rf_pipeline.fit(X_train, y_train)
    y_pred_rf = rf_pipeline.predict(X_test)

    rf_mae = mean_absolute_error(y_test, y_pred_rf)
    rf_rmse = np.sqrt(mean_squared_error(y_test, y_pred_rf))
    print(f"[Random Forest] MAE: {rf_mae:.4f} | RMSE: {rf_rmse:.4f}")

    # b. Gradient Boosting Regressor
    print("\nTraining Gradient Boosting Regressor (GBM)...")
    gb_pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                                  ('model', GradientBoostingRegressor(n_estimators=100, random_state=42))])
    gb_pipeline.fit(X_train, y_train)
    y_pred_gb = gb_pipeline.predict(X_test)

    gb_mae = mean_absolute_error(y_test, y_pred_gb)
    gb_rmse = np.sqrt(mean_squared_error(y_test, y_pred_gb))
    print(f"[Gradient Boosting] MAE: {gb_mae:.4f} | RMSE: {gb_rmse:.4f}")

    # 5. Save model
    rf_model_path = os.path.join(models_dir, 'delivery_rf_model.joblib')
    gb_model_path = os.path.join(models_dir, 'delivery_gb_model.joblib')
    
    print("\nSaving trained models...")
    joblib.dump(rf_pipeline, rf_model_path)
    joblib.dump(gb_pipeline, gb_model_path)
    
    print(f"Models successfully saved to '{models_dir}' directory.")

if __name__ == "__main__":
    main()
