import pandas as pd

amazon = pd.read_csv("amazon_sales_2025_INR_cleaned.csv")
ecom = pd.read_csv("ecommerce_sales_dataset.csv")
synthetic = pd.read_csv("synthetic_ecommerce_dataset.csv")

print("AMAZON COLUMNS:")
for col in amazon.columns:
    print(f" - {col}")

print("\nECOM COLUMNS:")
for col in ecom.columns:
    print(f" - {col}")

print("\nSYNTHETIC COLUMNS:")
for col in synthetic.columns:
    print(f" - {col}")
