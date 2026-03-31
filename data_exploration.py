import pandas as pd
import os

print("Looking for files in:", os.getcwd())

# -------------------------------
# 1. LOAD DATASETS
# -------------------------------
try:
    amazon = pd.read_csv("amazon_sales_2025_INR_cleaned.csv")
    ecom = pd.read_csv("ecommerce_sales_dataset.csv")
    synthetic = pd.read_csv("synthetic_ecommerce_dataset.csv")
    inventory = pd.read_csv("retail_store_inventory.csv")

    print("All datasets loaded successfully ✅\n")

except Exception as e:
    print("Error loading files:", e)
    exit()

# -------------------------------
# 2. SKIP AMAZON (SUMMARY DATA)
# -------------------------------
print("Note: Amazon dataset is summary → skipping for sales merge\n")

# -------------------------------
# 3. STANDARDIZE DATASETS
# -------------------------------

# Ecommerce dataset
ecom_standard = ecom.rename(columns={
    'Product': 'product_id',
    'Date': 'date',
    'Quantity': 'quantity',
    'Unit_Price': 'price'
})
ecom_standard['date'] = pd.to_datetime(ecom_standard['date'])
ecom_standard['source'] = 'ecommerce'

# Synthetic dataset
synthetic_standard = synthetic.rename(columns={
    'product': 'product_id',
    'purchase_date': 'date',
    'quantity': 'quantity',
    'unit_price': 'price'
})
synthetic_standard['date'] = pd.to_datetime(synthetic_standard['date'])
synthetic_standard['source'] = 'synthetic'

# -------------------------------
# 4. MERGE SALES DATA
# -------------------------------
sales = pd.concat([
    ecom_standard[['product_id', 'date', 'quantity', 'price', 'source']],
    synthetic_standard[['product_id', 'date', 'quantity', 'price', 'source']]
], ignore_index=True)

print(f"Total rows before aggregation: {sales.shape[0]}")

# Aggregate duplicate entries
sales = sales.groupby(['product_id', 'date'])['quantity'].sum().reset_index()

print(f"Total rows after aggregation: {sales.shape[0]}\n")

# -------------------------------
# 5. FEATURE ENGINEERING
# -------------------------------
sales['day_of_week'] = sales['date'].dt.dayofweek
sales['month'] = sales['date'].dt.month

# Rolling mean
sales['rolling_mean_7'] = sales.groupby('product_id')['quantity'] \
    .transform(lambda x: x.rolling(7).mean())

# Lag features (VERY IMPORTANT)
sales['lag_1'] = sales.groupby('product_id')['quantity'].shift(1)
sales['lag_7'] = sales.groupby('product_id')['quantity'].shift(7)

# Trend feature
sales['trend'] = sales.groupby('product_id')['quantity'].diff()

# Fill missing values
sales = sales.fillna(0)

print("Sample after feature engineering:")
print(sales.head(10))

# -------------------------------
# 6. TRAIN FORECAST MODEL (CPU ONLY)
# -------------------------------
print("\nTraining model on CPU...")

from sklearn.ensemble import RandomForestRegressor

X = sales[['day_of_week', 'month', 'rolling_mean_7', 'lag_1', 'lag_7', 'trend']]
y = sales['quantity']

model = RandomForestRegressor(n_estimators=100)
model.fit(X, y)

predictions = model.predict(X.tail(7))

print("\n🔮 Predictions:")
print(predictions)

# -------------------------------
# 8. SAVE OUTPUTS
# -------------------------------
sales.to_csv("unified_sales_data.csv", index=False)
print("\n💾 Saved unified sales data")

# Save predictions
pred_df = pd.DataFrame({
    "prediction": predictions
})
pred_df.to_csv("forecast_output.csv", index=False)
print("💾 Saved forecast output")

# -------------------------------
# 9. INVENTORY CLEANING
# -------------------------------
try:
    inventory_standard = inventory.rename(columns={
        'Product ID': 'product_id',
        'Inventory Level': 'stock'
    })

    inventory_final = inventory_standard[['product_id', 'stock']]

    inventory_final.to_csv("unified_inventory_data.csv", index=False)

    print("\n✅ Inventory cleaned and saved")

except Exception as e:
    print("\n❌ Inventory error:", e)

print("\n🎉 PIPELINE COMPLETE!")
