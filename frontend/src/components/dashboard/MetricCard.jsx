import React from 'react';
import './MetricCard.css';

const MetricCard = ({ title, value, trend, isPositive, icon, color }) => {
  return (
    <div className={`metric-card glass-panel border-${color}`}>
      <div className="metric-header">
        <h4 className="metric-title">{title}</h4>
        <div className={`metric-icon bg-${color}-subtle text-${color}`}>
          {icon}
        </div>
      </div>
      <div className="metric-body">
        <h2 className="metric-value">{value}</h2>
        <span className={`metric-trend ${isPositive ? 'trend-up' : 'trend-down'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
};

export default MetricCard;
