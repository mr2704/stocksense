from supabase import create_client, Client
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pickle
import pandas as pd
import os
from dotenv import load_dotenv

# ==============================
# 🔹 LOAD ENV VARIABLES
# ==============================
load_dotenv()

app = FastAPI()

# ==============================
# 🔹 ENABLE CORS (IMPORTANT)
# ==============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# 🔹 SUPABASE CONFIG
# ==============================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Supabase credentials not found in .env file")

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


#  GET ALL PREDICTIONS (FOR FRONTEND)
@app.get("/predictions")
def get_predictions():
    try:
        response = supabase.table("predictions").select("*").execute()
        return {
            "data": response.data,
            "status": "success"
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "failed"
        }


@app.get("/forecast")
def get_forecast():
    try:
        response = supabase.table("predictions").select("*").execute()

        return {
            "data": response.data,
            "status": "success"
        }

    except Exception as e:
        return {"error": str(e)}


@app.post("/update-stock")
def update_stock(data: dict):
    try:
        product_id = data.get("product_id")
        quantity = data.get("quantity")

        if product_id is None or quantity is None:
            return {"error": "product_id and quantity are required"}

        quantity = int(quantity)

        current = supabase.table("inventory").select("stock").eq("product_id", product_id).execute()

        if not current.data:
            return {"error": "Product not found"}

        row = current.data[0]
        if not isinstance(row, dict):
            return {"error": "Invalid inventory row format"}

        stock_value = row.get("stock", 0)
        if isinstance(stock_value, (int, float, str)):
            current_stock = int(float(stock_value))
        else:
            current_stock = 0
        stock = current_stock - quantity

        if stock < 0:
            stock = 0

        supabase.table("inventory").update({
            "stock": stock
        }).eq("product_id", product_id).execute()

        return {"status": "updated"}

    except Exception as e:
        return {"error": str(e)}


#  PREDICT + STORE
@app.post("/predict")
def predict(data: dict):
    try:
        df = pd.DataFrame([data])

        df['month'] = data.get('month', 1)
        df['day_of_week'] = data.get('day_of_week', 1)

        for col in FEATURES:
            if col not in df.columns:
                df[col] = 0

        df = df[FEATURES]
        df = pd.get_dummies(df)

        df = df.reindex(
            columns=model.get_booster().feature_names,
            fill_value=0
        )

        prediction = model.predict(df)[0]

        insert_data = {
            "store_id": int(data.get("Store ID", 0)),
            "product_id": int(data.get("Product ID", 0)),
            "inventory_level": int(data.get("Inventory Level", 0)),
            "units_ordered": int(data.get("Units Ordered", 0)),
            "price": float(data.get("Price", 0)),
            "discount": float(data.get("Discount", 0)),
            "prediction": float(prediction)
        }

        supabase.table("predictions").insert(insert_data).execute()

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


@app.get("/inventory")
def get_inventory():
    try:
        response = supabase.table("inventory").select("*").execute()
        return {
            "data": response.data,
            "status": "success"
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "failed"
        }


@app.get("/demand-analytics")
def demand_analytics():
    """
    Returns per-product demand analytics by joining inventory with predictions.

    For each product:
      - avg_demand: average of units_ordered across all historical prediction rows
                    (proxy for historical sales rate)
      - predicted_demand: ML model's latest prediction (highest value per product)
      - current_stock: current inventory level
    """
    try:
        inventory = supabase.table("inventory").select("*").execute().data or []
        predictions = supabase.table("predictions").select("*").execute().data or []

        # Group predictions by product_id
        from collections import defaultdict
        pred_by_product = defaultdict(list)
        for p in predictions:
            pid = p.get("product_id")
            if pid is not None:
                pred_by_product[pid].append(p)

        result = []
        for item in inventory:
            pid = item.get("product_id")
            preds = pred_by_product.get(pid, [])

            # Historical average demand (units_ordered across all past rows)
            units_list = [float(p.get("units_ordered", 0) or 0) for p in preds]
            avg_demand = round(sum(units_list) / len(units_list), 2) if units_list else 0.0

            # Latest ML prediction (max prediction value this product has seen)
            pred_values = [float(p.get("prediction", 0) or 0) for p in preds]
            predicted_demand = round(max(pred_values), 2) if pred_values else 0.0

            result.append({
                "product_id": pid,
                "product_name": item.get("product_name", f"Product {pid}"),
                "category": item.get("category", ""),
                "current_stock": int(float(item.get("stock", 0) or 0)),
                "price": float(item.get("price", 0) or 0),
                "avg_demand": avg_demand,         # historical avg units sold/ordered
                "predicted_demand": predicted_demand,  # ML model forecast
                "prediction_count": len(preds),   # how many data points we have
            })

        # Sort by most urgent: lowest stock / highest demand gap first
        result.sort(key=lambda x: x["current_stock"] - x["predicted_demand"])

        return {"data": result, "status": "success"}

    except Exception as e:
        print(f"[demand-analytics] ERROR: {e}")
        return {"error": str(e), "status": "failed"}


@app.get("/sales-velocity")
def sales_velocity():
    """
    Calculates per-product sales velocity using predictions.units_ordered as a
    sales proxy (since no dedicated sales table exists).

    velocity = avg(units_ordered) across all prediction records for that product
    trend    = (avg of latest half) vs (avg of earlier half) — positive means growing
    """
    try:
        inventory = supabase.table("inventory").select("*").execute().data or []
        predictions = supabase.table("predictions").select("*").execute().data or []

        from collections import defaultdict
        pred_by_product = defaultdict(list)
        for p in predictions:
            pid = p.get("product_id")
            if pid is not None:
                pred_by_product[pid].append(float(p.get("units_ordered", 0) or 0))

        # Build inventory name lookup
        inv_map = {item.get("product_id"): item for item in inventory}

        result = []
        for pid, units_list in pred_by_product.items():
            if not units_list:
                continue
            velocity = round(sum(units_list) / len(units_list), 2)

            # Trend: compare first half vs second half of records
            mid = max(1, len(units_list) // 2)
            early_avg = sum(units_list[:mid]) / mid
            late_avg  = sum(units_list[mid:]) / max(1, len(units_list) - mid)
            trend_pct = round(((late_avg - early_avg) / max(early_avg, 0.001)) * 100, 1)

            inv_item = inv_map.get(pid, {})
            result.append({
                "product_id":   pid,
                "product_name": inv_item.get("product_name", f"Product {pid}"),
                "category":     inv_item.get("category", ""),
                "velocity":     velocity,        # avg units moved per record
                "trend_pct":    trend_pct,        # positive = accelerating
                "data_points":  len(units_list),
            })

        # Total velocity across all products (used by dashboard stat card)
        total_velocity = round(sum(r["velocity"] for r in result), 2)

        result.sort(key=lambda x: -x["velocity"])  # Highest velocity first

        return {
            "data":            result,
            "total_velocity":  total_velocity,
            "status":          "success"
        }

    except Exception as e:
        print(f"[sales-velocity] ERROR: {e}")
        return {"error": str(e), "status": "failed"}

@app.get("/dashboard-stats")
def dashboard_stats():
    try:
        def to_number(value):
            if isinstance(value, (int, float)):
                return float(value)
            if isinstance(value, str):
                try:
                    return float(value)
                except ValueError:
                    return 0.0
            return 0.0

        # Get inventory data
        inventory = supabase.table("inventory").select("*").execute().data or []

        total_items = len(inventory)

        low_stock = len([
            item for item in inventory
            if isinstance(item, dict) and to_number(item.get("stock", 0)) < 10
        ])

        total_stock_value = sum(
            to_number(item.get("stock", 0)) * to_number(item.get("price", 0))
            for item in inventory
            if isinstance(item, dict)
        )

        # Real sales velocity: avg units_ordered per product across predictions
        predictions = supabase.table("predictions").select("units_ordered").execute().data or []
        velocity_values = [float(p.get("units_ordered", 0) or 0) for p in predictions]
        sales_velocity = round(sum(velocity_values) / max(len(velocity_values), 1), 2)

        return {
            "total_items":    total_items,
            "low_stock":      low_stock,
            "sales_velocity": sales_velocity,
            "restock_cost":   total_stock_value,
            "status":         "success"
        }

    except Exception as e:
        return {"error": str(e), "status": "failed"}


@app.post("/add-product")
def add_product(data: dict):
    try:
        supabase.table("inventory").insert({
            "store_id": data["store_id"],
            "product_id": data["product_id"],
            "product_name": data["product_name"],
            "category": data["category"],
            "stock": data["stock"],
            "price": data["price"]
        }).execute()

        return {"status": "success"}

    except Exception as e:
        return {"error": str(e), "status": "failed"}

@app.delete("/delete-product/{product_id}")
def delete_product(product_id: int):
    try:
        print(f"[delete-product] Attempting to delete row with id={product_id}")
        # Try primary key id first, fallback to product_id column
        result = supabase.table("inventory").delete().eq("id", product_id).execute()
        if not result.data:
            result = supabase.table("inventory").delete().eq("product_id", product_id).execute()
        print(f"[delete-product] Deleted rows: {result.data}")
        return {"status": "success"}
    except Exception as e:
        print(f"[delete-product] ERROR: {e}")
        return {"error": str(e), "status": "failed"}

@app.post("/place-order")
def place_order(data: dict):
    try:
        row_id = data["product_id"]  # This is actually the item's primary key id from frontend
        quantity = int(data["quantity"])  # Always convert to Python int

        print(f"[place-order] row_id={row_id}, quantity={quantity}")

        rows = supabase.table("inventory") \
            .select("*") \
            .eq("id", row_id) \
            .execute().data or []

        if not rows:
            # Fallback: try matching by product_id column
            rows = supabase.table("inventory") \
                .select("*") \
                .eq("product_id", row_id) \
                .execute().data or []

        if not rows:
            print(f"[place-order] No matching product found for id={row_id}")
            return {"error": "Product not found", "status": "failed"}

        item = rows[0]
        if not isinstance(item, dict):
            return {"error": "Invalid inventory row format", "status": "failed"}

        current_stock = int(float(item.get("stock", 0)))  # Always integer
        new_stock = current_stock - quantity
        if new_stock < 0:
            new_stock = 0

        print(f"[place-order] current_stock={current_stock}, new_stock={new_stock}, type={type(new_stock)}")

        supabase.table("inventory") \
            .update({"stock": int(new_stock)}) \
            .eq("id", item["id"]) \
            .execute()

        return {"status": "success", "new_stock": int(new_stock)}

    except Exception as e:
        print(f"[place-order] ERROR: {e}")
        return {"error": str(e), "status": "failed"}


@app.post("/restock")
def restock(data: dict):
    try:
        row_id = data["product_id"]  # This is actually the item's primary key id from frontend
        quantity = int(data["quantity"])  # Always convert to Python int

        print(f"[restock] row_id={row_id}, quantity={quantity}")

        rows = supabase.table("inventory") \
            .select("*") \
            .eq("id", row_id) \
            .execute().data or []

        if not rows:
            # Fallback: try matching by product_id column
            rows = supabase.table("inventory") \
                .select("*") \
                .eq("product_id", row_id) \
                .execute().data or []

        if not rows:
            print(f"[restock] No matching product found for id={row_id}")
            return {"error": "Product not found", "status": "failed"}

        item = rows[0]
        if not isinstance(item, dict):
            return {"error": "Invalid inventory row format", "status": "failed"}

        current_stock = int(float(item.get("stock", 0)))  # Always integer
        new_stock = current_stock + quantity

        print(f"[restock] current_stock={current_stock}, new_stock={new_stock}, type={type(new_stock)}")

        supabase.table("inventory") \
            .update({"stock": int(new_stock)}) \
            .eq("id", item["id"]) \
            .execute()

        return {"status": "success", "new_stock": int(new_stock)}

    except Exception as e:
        print(f"[restock] ERROR: {e}")
        return {"error": str(e), "status": "failed"}