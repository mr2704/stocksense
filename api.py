from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os

app = FastAPI(title="Forecast API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/forecast")
def get_forecast():
    """
    Reads the forecast_output.csv and returns the predictions as a JSON list.
    """
    file_path = "forecast_output.csv"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Forecast data not found. Please run data_exploration.py first.")
        
    try:
        # Load the CSV
        df = pd.read_csv(file_path)
        
        # Ensure the 'prediction' column exists
        if "prediction" not in df.columns:
             raise HTTPException(status_code=500, detail="CSV format invalid. Missing 'prediction' column.")
             
        # Extract predictions as a flat list
        predictions = df["prediction"].tolist()
        
        return {
            "status": "success", 
            "predictions": predictions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

# You can run this file directly using Python:
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
