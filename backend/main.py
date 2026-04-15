from supabase import create_client, Client
from fastapi import FastAPI
import pickle
import pandas as pd
import os
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

# ==============================
# 🔹 LOAD ENV VARIABLES
# ==============================
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
print("URL:", SUPABASE_URL)
print("KEY:", SUPABASE_KEY)

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ==============================
# 🔹 MODEL LOADING
# ==============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "model", "model.pkl")

with open(model_path, "rb") as f:
    model = pickle.load(f)

# ==============================
# 🔹 FEATURES
# ==============================
FEATURES = [
    'Store ID', 'Product ID', 'Inventory Level', 'Units Ordered',
    'Price', 'Discount', 'Weather Condition',
    'Holiday/Promotion', 'Competitor Pricing',
    'Seasonality', 'month', 'day_of_week'
]

# ==============================
# 🔹 ROUTES
# ==============================
@app.get("/")
def home():
    return {"message": "StockSense API Running 🚀"}


@app.post("/predict")
def predict(data: dict):
    try:
        # Convert input → DataFrame
        df = pd.DataFrame([data])

        # Add default values
        df['month'] = data.get('month', 1)
        df['day_of_week'] = data.get('day_of_week', 1)

        # Ensure all features exist
        for col in FEATURES:
            if col not in df.columns:
                df[col] = 0

        # Maintain order
        df = df[FEATURES]

        # Encode categorical
        df = pd.get_dummies(df)

        # Align with model
        df = df.reindex(
            columns=model.get_booster().feature_names,
            fill_value=0
        )

        # Predict
        prediction = model.predict(df)[0]

        # ==============================
        # 🔥 STORE IN SUPABASE
        # ==============================
        insert_data = {
            "store_id": int(data.get("Store ID", 0)),
            "product_id": int(data.get("Product ID", 0)),
            "inventory_level": int(data.get("Inventory Level", 0)),
            "units_ordered": int(data.get("Units Ordered", 0)),
            "price": float(data.get("Price", 0)),
            "discount": float(data.get("Discount", 0)),
            "prediction": float(prediction)
        }

        response = supabase.table("predictions").insert(insert_data).execute()

        # Debug (optional)
        print("Inserted:", insert_data)

        return {
            "prediction": float(prediction),
            "status": "success"
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "error": str(e),
            "status": "failed"
        }