import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '../../supabaseClient';

const DemandChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const buildChartData = async () => {
    try {
      // Single endpoint returns inventory joined with real demand data
      const res = await fetch("http://127.0.0.1:8000/demand-analytics");
      const json = await res.json();
      const items = json.data || [];

      const joined = items
        .slice(0, 10)
        .map((item) => ({
          name: (item.product_name || `P${item.product_id}`)
            .split(' ').slice(0, 2).join(' '),
          supply: item.current_stock || 0,
          demand: item.predicted_demand || 0,   // ML model forecast
          avg_demand: item.avg_demand || 0,      // historical avg units ordered
          product_id: item.product_id,
          has_prediction: item.prediction_count > 0,
        }));

      setChartData(joined);
    } catch (err) {
      console.error("DemandChart: failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buildChartData();

    // Real-time subscription: refresh chart when inventory or predictions change
    const channel = supabase
      .channel('demand-chart-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
        console.log('[DemandChart] inventory changed — refreshing chart');
        buildChartData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'predictions' }, () => {
        console.log('[DemandChart] predictions changed — refreshing chart');
        buildChartData();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (loading) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
        Loading chart data…
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
        No inventory data available yet.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px', marginTop: '16px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 17, 21, 0.95)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f8fafc',
            }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Area
            type="monotone"
            dataKey="demand"
            name="Predicted Demand (units)"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorDemand)"
          />
          <Area
            type="monotone"
            dataKey="supply"
            name="Current Stock (units)"
            stroke="#f97316"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSupply)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DemandChart;
