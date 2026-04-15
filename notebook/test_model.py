import pickle
import pandas as pd

print("Starting...")

# Load model
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

print("Model loaded successfully")

# Load dataset
df = pd.read_csv("retail_store_inventory.csv")

# 🔥 Add missing features
df['month'] = 1           # dummy value
df['day_of_week'] = 1     # dummy value

# Required features
features = [
    'Store ID', 'Product ID', 'Inventory Level', 'Units Ordered',
    'Price', 'Discount', 'Weather Condition',
    'Holiday/Promotion', 'Competitor Pricing',
    'Seasonality', 'month', 'day_of_week'
]

df = df[features]

# Take one row
sample = df.iloc[0:1]

# Encode categorical
sample = pd.get_dummies(sample)

# Align with model
sample = sample.reindex(columns=model.get_booster().feature_names, fill_value=0)

print("Making prediction...")

prediction = model.predict(sample)

print("Prediction:", prediction)