# StockSense — AI-Powered Inventory Management System

StockSense is a full-stack inventory management and demand forecasting application designed to help businesses track inventory, analyze demand, and make data-driven decisions using machine learning.

---

## Features

* User authentication using Supabase
* Inventory management dashboard
* Add and update products
* Demand forecasting using machine learning
* Real-time updates with Supabase Realtime
* Analytics and insights
* AI-powered prediction engine
* Full-stack architecture (React + FastAPI)

---

## Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Supabase Client

### Backend

* FastAPI (Python)
* REST APIs

### Database

* Supabase (PostgreSQL)

### Machine Learning

* Pandas, NumPy
* XGBoost / LightGBM
* Scikit-learn

### DevOps (Planned)

* Docker
* Ansible

---

## Project Structure

```bash
StockSense/
│
├── frontend/          # React frontend
├── backend/           # FastAPI backend
│   ├── main.py
│   └── model/         # ML model files
├── datasets/          # Training data
├── notebook/          # Jupyter/Colab notebooks
├── .gitignore
└── README.md
```

---

## Setup Instructions

### Clone the Repository

```bash
git clone https://github.com/your-username/stocksense.git
cd stocksense
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs on:

```
http://127.0.0.1:8000
```

---

### Environment Variables

Create a `.env.local` file in the frontend directory:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_publishable_key
```

Do not expose secret keys.

---

## Machine Learning Model

* Built using demand forecasting dataset
* Feature engineering includes lag features, rolling averages, and seasonal patterns
* Model used: XGBoost or LightGBM
* Exported as:

```
model_pipeline.pkl
```

Used in backend for real-time predictions.

---

## API Endpoints

| Method | Endpoint          | Description     |
| ------ | ----------------- | --------------- |
| GET    | /inventory        | Fetch inventory |
| GET    | /demand-analytics | Analytics data  |
| POST   | /add-product      | Add product     |
| POST   | /predict          | Predict demand  |

---

## Future Improvements

* Docker containerization
* CI/CD pipeline
* Ansible automation
* Cloud deployment (AWS/GCP)
* Model optimization using accelerated data science techniques

---

## Known Issues

* Supabase realtime may fail on restricted networks
* Requires stable internet connection

---

## Author

Manas Raj

---

## Contribution

Contributions are welcome. Fork the repository and submit a pull request.

---

## License

This project is intended for educational and personal use.
