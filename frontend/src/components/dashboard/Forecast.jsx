import { useEffect, useState } from "react";

export default function Forecast() {
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/forecast")
      .then(res => res.json())
      .then(data => setForecast(data.data || []));
  }, []);

  return (
    <div>
      {forecast.map((f, i) => (
        <div key={i}>
          Product {f.product_id} → {f.prediction}
        </div>
      ))}
    </div>
  );
}