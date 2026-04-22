import React, { useState, useEffect } from 'react';
import DemandChart from '../components/dashboard/DemandChart';
import { TrendingUp, TrendingDown, BarChart2, PieChart, Activity, Minus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Analytics.css';

const Analytics = () => {
  const [velocityData, setVelocityData] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loadingVelocity, setLoadingVelocity] = useState(true);

  const fetchVelocity = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/sales-velocity");
      const json = await res.json();
      setVelocityData(json.data || []);

      // Derive category breakdown from velocity data
      const catMap = {};
      const allProducts = json.data || [];
      const total = allProducts.reduce((s, p) => s + (p.velocity || 0), 0);
      allProducts.forEach(p => {
        const cat = p.category || "Other";
        catMap[cat] = (catMap[cat] || 0) + (p.velocity || 0);
      });
      const catList = Object.entries(catMap)
        .map(([name, vel]) => ({ name, pct: total > 0 ? Math.round((vel / total) * 100) : 0 }))
        .sort((a, b) => b.pct - a.pct);
      setCategoryStats(catList);
    } catch (err) {
      console.error("Analytics: failed to fetch velocity", err);
    } finally {
      setLoadingVelocity(false);
    }
  };

  useEffect(() => {
    fetchVelocity();

    // Real-time: refresh when predictions table changes
    const channel = supabase
      .channel('analytics-velocity')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'predictions' }, () => {
        fetchVelocity();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const TrendIcon = ({ pct }) => {
    if (pct > 0)  return <TrendingUp size={14} style={{ color: '#22c55e' }} />;
    if (pct < 0)  return <TrendingDown size={14} style={{ color: '#ef4444' }} />;
    return <Minus size={14} style={{ color: '#64748b' }} />;
  };

  return (
    <div className="analytics-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Demand & Analytics</h1>
          <p className="page-subtitle">Analyze sales trends, view demand forecasts, and make data-driven decisions.</p>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Demand vs Supply Chart — spans 2 cols */}
        <div className="analytics-card glass-panel" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3>Long-Term Resource Forecast</h3>
            <button className="btn-secondary btn-small">Per Product</button>
          </div>
          <div className="chart-container">
            <DemandChart />
          </div>
        </div>

        {/* Top Categories — live from velocity data */}
        <div className="analytics-card glass-panel">
          <div className="card-header">
            <h3>Top Categories</h3>
            <PieChart size={18} className="text-secondary" />
          </div>
          <div className="category-stats">
            {categoryStats.length > 0 ? categoryStats.slice(0, 5).map((cat) => (
              <div className="stat-row" key={cat.name}>
                <span>{cat.name}</span>
                <span className="text-primary">{cat.pct}%</span>
              </div>
            )) : (
              <p style={{ opacity: 0.5, fontSize: 13 }}>No category data yet.</p>
            )}
          </div>
        </div>

        {/* Sales Velocity — live per-product */}
        <div className="analytics-card glass-panel">
          <div className="card-header">
            <h3>Sales Velocity</h3>
            <Activity size={18} className="text-secondary" />
          </div>

          {loadingVelocity ? (
            <p style={{ opacity: 0.5, fontSize: 13, marginTop: 12 }}>Loading velocity data…</p>
          ) : velocityData.length === 0 ? (
            <p style={{ opacity: 0.5, fontSize: 13, marginTop: 12 }}>No sales data available yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              {velocityData.slice(0, 5).map((p) => {
                const isUp = p.trend_pct > 0;
                const isDown = p.trend_pct < 0;
                const trendColor = isUp ? '#22c55e' : isDown ? '#ef4444' : '#64748b';

                return (
                  <div key={p.product_id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.04)',
                    borderLeft: `3px solid ${trendColor}`,
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                        {p.product_name.split(' ').slice(0, 3).join(' ')}
                      </div>
                      <div style={{ opacity: 0.5, fontSize: 11 }}>{p.category}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {p.velocity} <span style={{ opacity: 0.6, fontWeight: 400, fontSize: 11 }}>units/day</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 2 }}>
                        <TrendIcon pct={p.trend_pct} />
                        <span style={{ color: trendColor, fontSize: 11, fontWeight: 600 }}>
                          {p.trend_pct > 0 ? '+' : ''}{p.trend_pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
