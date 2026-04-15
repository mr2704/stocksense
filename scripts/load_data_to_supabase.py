import pandas as pd
from supabase import create_client

url = "https://yvihgfukzaqdvzhpwgxh.supabase.co"
key = "sb_publishable___88bMdEC9ogj4NOXacjxw_8Zl4SJ6v"

supabase = create_client(url, key)

# Load data
inventory = pd.read_csv("unified_inventory_data.csv")
sales = pd.read_csv("unified_sales_data.csv")

# FIX 1: Inventory UPSERT
# Deduplicate inventory by keeping the last occurrence of each product_id
inventory = inventory.drop_duplicates(subset=['product_id'], keep='last')
inventory_records = inventory.to_dict(orient="records")

print("Uploading inventory...")
for i in range(0, len(inventory_records), 1000):
    batch = inventory_records[i:i+1000]
    supabase.table("inventory").upsert(batch).execute()

# FIX 2: Clean sales columns
sales = sales[['product_id', 'date', 'quantity']]
sales_records = sales.to_dict(orient="records")

print("Uploading sales...")
for i in range(0, len(sales_records), 1000):
    batch = sales_records[i:i+1000]
    supabase.table("sales").insert(batch).execute()

print(" Data uploaded successfully!")
