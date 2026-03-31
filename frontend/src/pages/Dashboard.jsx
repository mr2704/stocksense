import React from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../components/dashboard/MetricCard';
import DemandChart from '../components/dashboard/DemandChart';
import InventoryTable from '../components/inventory/InventoryTable';
import Forecast from '../components/dashboard/Forecast';
import { Package, AlertTriangle, TrendingUp, DollarSign, Download } from 'lucide-react';
import { inventoryData } from '../utils/mockData';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const lowStockCount = inventoryData.filter(item => item.stock <= item.reorderPoint).length;
  const totalStock = inventoryData.reduce((acc, item) => acc + item.stock, 0);

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening with your inventory today.</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => alert('Generating your custom report... It will download shortly.')}
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div className="metrics-grid">
        <MetricCard 
          title="Total Inventory Items" 
          value={totalStock.toString()} 
          trend="+12%" 
          isPositive={true}
          icon={<Package size={24} />}
          color="blue"
        />
        <MetricCard 
          title="Low Stock Alerts" 
          value={lowStockCount.toString()} 
          trend="Urgent" 
          isPositive={false}
          icon={<AlertTriangle size={24} />}
          color="danger"
        />
        <MetricCard 
          title="Sales Velocity (30d)" 
          value="4,250" 
          trend="+5%" 
          isPositive={true}
          icon={<TrendingUp size={24} />}
          color="success"
        />
        <MetricCard 
          title="Est. Restock Cost" 
          value="$12,450" 
          trend="-2%" 
          isPositive={false}
          icon={<DollarSign size={24} />}
          color="warning"
        />
      </div>

      <div className="dashboard-middle-row">
        <div className="chart-wrapper glass-panel">
          <h3 className="section-title">Demand vs Supply Forecast</h3>
          <DemandChart />
        </div>
        <div className="insights-wrapper glass-panel">
           <h3 className="section-title">Smart Insights</h3>
           <div className="insight-card">
              <div className="insight-icon bg-warning"><AlertTriangle size={18} /></div>
              <div>
                <h4>Stockout Risk</h4>
                <p>Mechanical Keyboard will run out of stock in 2 days based on current demand velocity.</p>
              </div>
           </div>
           <div className="insight-card">
              <div className="insight-icon bg-success"><TrendingUp size={18} /></div>
              <div>
                <h4>High Demand</h4>
                <p>Smart Fitness Tracker demand has surged 25% this week.</p>
              </div>
           </div>
           
           <div style={{ marginTop: '24px' }}>
             <Forecast />
           </div>
        </div>
      </div>

      <div className="dashboard-bottom-row glass-panel">
        <div className="section-header">
           <h3 className="section-title">Critical Restock Recommendations</h3>
           <button className="text-btn" onClick={() => navigate('/inventory')}>View All</button>
        </div>
        <InventoryTable data={inventoryData} limits={5} />
      </div>
    </div>
  );
};

export default Dashboard;
