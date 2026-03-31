import React, { useEffect, useState } from "react";
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function Forecast() {
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/forecast")
      .then((res) => res.json())
      .then((data) => {
        setForecast(data.predictions || data);
      })
      .catch((err) => console.error(err));
  }, []);

  if (forecast.length === 0) {
    return <div style={{ padding: "20px", color: "#a0aec0" }}>Loading forecast data...</div>;
  }

  const chartData = forecast.map((value, index) => ({
    day: `Day ${index + 1}`,
    demand: Number(Number(value).toFixed(2)),
  }));

  // Intelligence calculations
  const firstValue = chartData[0].demand;
  const lastValue = chartData[chartData.length - 1].demand;
  const trend = lastValue >= firstValue ? "up" : "down";
  const trendColor = trend === "up" ? "#00f5d4" : "#ff4d4f";
  
  const sum = chartData.reduce((acc, val) => acc + val.demand, 0);
  const avgDemandRaw = sum / chartData.length;

  // Decision Support System Action Variables
  const currentStock = 120; // TODO: later fetch from API
  const daysLeft = Math.floor(currentStock / avgDemandRaw);
  
  const leadTime = 7;
  const safetyStock = 10;
  const reorderQty = Math.ceil(avgDemandRaw * leadTime + safetyStock);
  
  const insightText = `Demand is ${trend === "up" ? "increasing" : "decreasing"}. Average demand is ${avgDemandRaw.toFixed(2)} units/day. Recommended reorder quantity is ${reorderQty} units.`;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 className="section-title" style={{ marginBottom: "20px" }}>7-Day Demand Forecast</h3>
      
      {daysLeft < 5 && (
        <div className="alert-banner" style={{
          marginBottom: "16px",
          padding: "12px 16px",
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          border: "1px solid rgba(239, 68, 68, 0.4)",
          borderRadius: "8px",
          color: "#fca5a5",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 4px 12px -2px rgba(239, 68, 68, 0.2)"
        }}>
          ⚠️ High Risk: Restock Immediately
        </div>
      )}

      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={trendColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis dataKey="day" stroke="#a0aec0" axisLine={false} tickLine={false} dy={10} fontSize={12} />
            <YAxis stroke="#a0aec0" axisLine={false} tickLine={false} dx={-10} fontSize={12} />
            
            <Tooltip
              contentStyle={{
                backgroundColor: "#111",
                border: "none",
                borderRadius: "10px",
                boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.6)",
                color: "#e2e8f0"
              }}
              formatter={(value) => [`${value} units`, "Predicted Demand"]}
              itemStyle={{ color: trendColor, fontWeight: 600 }}
              cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 2, fill: 'rgba(255, 255, 255, 0.02)' }}
            />
            
            <Area
              type="monotone"
              dataKey="demand"
              stroke="none"
              fill="url(#colorDemand)"
            />
            
            <Line
              type="monotone"
              dataKey="demand"
              stroke={trendColor}
              strokeWidth={3}
              dot={{ r: 4, fill: trendColor, strokeWidth: 2, stroke: '#111' }}
              activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="insight-box" style={{
        marginTop: "24px",
        padding: "16px",
        backgroundColor: "rgba(30, 41, 59, 0.5)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        backdropFilter: "blur(4px)"
      }}>
        <h4 style={{ margin: "0 0 4px 0", color: "#cbd5e1", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>
          Decision Support System
        </h4>
        <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", borderLeft: `4px solid ${trendColor}` }}>
           <p style={{ margin: 0, fontSize: "14px", color: "#e2e8f0", lineHeight: "1.6" }}>
             🧠 {insightText}
           </p>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
           <p style={{ margin: 0, fontSize: "15px", display: "flex", alignItems: "center", gap: "8px", color: "#f8fafc" }}>
             ⏳ Estimated stockout in <strong style={{ color: daysLeft < 40 ? "#fca5a5" : "#00f5d4", fontSize: "16px" }}>{daysLeft} days</strong>
           </p>
           
           <div style={{ padding: "6px 12px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderRadius: "20px", fontSize: "13px", fontWeight: "bold", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              📦 Order {reorderQty}
           </div>
        </div>
      </div>
    </div>
  );
}

export default Forecast;
