import React from 'react';
import DemandChart from '../components/dashboard/DemandChart';
import { TrendingUp, BarChart2, PieChart, Activity } from 'lucide-react';
import './Analytics.css';

const Analytics = () => {
  return (
    <div className="analytics-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Demand & Analytics</h1>
          <p className="page-subtitle">Analyze sales trends, view demand forecasts, and make data-driven decisions.</p>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card glass-panel" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3>Long-Term Resource Forecast</h3>
            <button className="btn-secondary btn-small">Last 6 Months</button>
          </div>
          <div className="chart-container">
            <DemandChart />
          </div>
        </div>

        <div className="analytics-card glass-panel">
          <div className="card-header">
            <h3>Top Categories</h3>
            <PieChart size={18} className="text-secondary" />
          </div>
          <div className="category-stats">
            <div className="stat-row"><span>Electronics</span><span className="text-primary">45%</span></div>
            <div className="stat-row"><span>Furniture</span><span className="text-primary">25%</span></div>
            <div className="stat-row"><span>Apparel</span><span className="text-primary">20%</span></div>
            <div className="stat-row"><span>Other</span><span className="text-primary">10%</span></div>
          </div>
        </div>

        <div className="analytics-card glass-panel">
          <div className="card-header">
            <h3>Sales Velocity Info</h3>
            <Activity size={18} className="text-secondary" />
          </div>
          <p className="insights-text">
            Sales are up <strong>15%</strong> this quarter.
            Watch out for <em>Ergonomic Office Chairs</em> demand dropping slightly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
