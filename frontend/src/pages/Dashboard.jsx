import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../components/dashboard/MetricCard';
import DemandChart from '../components/dashboard/DemandChart';
import InventoryTable from '../components/inventory/InventoryTable';
import Forecast from '../components/dashboard/Forecast';
import { Package, AlertTriangle, TrendingUp, IndianRupee, Download } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    total_items: 0,
    low_stock: 0,
    sales_velocity: 0,
    restock_cost: 0,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/inventory");
        const data = await res.json();
        setProducts(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/predictions")
      .then(res => res.json())
      .then(res => setData(res.data || []))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/dashboard-stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleCardClick = (cardType) => {
    if (cardType === 'inventory') {
      navigate('/inventory');
      return;
    }

    if (cardType === 'lowstock') {
      navigate('/inventory?filter=lowstock');
      return;
    }

    if (cardType === 'analytics') {
      navigate('/analytics');
      return;
    }

    if (cardType === 'restock') {
      navigate('/inventory?view=restock');
    }
  };

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
        <div onClick={() => handleCardClick('inventory')}>
          <MetricCard
            title="Total Inventory Items"
            value={stats.total_items}
            trend="+12%"
            isPositive={true}
            icon={<Package size={24} />}
            color="blue"
          />
        </div>
        <div onClick={() => handleCardClick('lowstock')}>
          <MetricCard
            title="Low Stock Alerts"
            value={stats.low_stock}
            trend="Urgent"
            isPositive={false}
            icon={<AlertTriangle size={24} />}
            color="danger"
          />
        </div>
        <div onClick={() => handleCardClick('analytics')}>
          <MetricCard
            title="Sales Velocity (30d)"
            value={stats.sales_velocity}
            trend="+5%"
            isPositive={true}
            icon={<TrendingUp size={24} />}
            color="success"
          />
        </div>
        <div onClick={() => handleCardClick('restock')}>
          <MetricCard
            title="Est. Restock Cost"
            value={`₹${stats.restock_cost}`}
            trend="-2%"
            isPositive={false}
            icon={<IndianRupee size={24} />}
            color="warning"
          />
        </div>
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

      <div className="dashboard-bottom-row glass-panel" style={{ marginBottom: '24px' }}>
        <div className="section-header">
          <h3 className="section-title">Live Inventory Feed</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
          <InventoryTable data={products} limits={5} />
        </div>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: "16px",
          padding: "20px",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
          <h3>Critical Restock Recommendations</h3>
          <span
            style={{ color: "#a855f7", cursor: "pointer" }}
            onClick={() => navigate('/inventory')}
          >
            View All
          </span>
        </div>

        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            gap: "12px",
            padding: "10px 15px",
            borderRadius: "8px",
            background: "rgba(0,0,0,0.2)",
            marginBottom: "8px",
            fontSize: "12px",
            opacity: 0.6,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <span>Product Name</span>
          <span>Product ID</span>
          <span>Stock</span>
          <span>Price</span>
          <span>Status</span>
        </div>

        {/* Dynamic rows — sorted by lowest stock, show up to 5 */}
        {[...products]
          .sort((a, b) => (parseInt(a.stock, 10) || 0) - (parseInt(b.stock, 10) || 0))
          .slice(0, 5)
          .map((p) => {
            const stock = parseInt(p.stock, 10) || 0;
            const isLow = stock < 10;
            const isOut = stock === 0;
            const statusColor = isOut ? "#ef4444" : isLow ? "#faad14" : "#22c55e";
            const statusLabel = isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock";

            return (
              <div
                key={p.product_id || p.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                  gap: "12px",
                  alignItems: "center",
                  padding: "12px 15px",
                  borderRadius: "10px",
                  background: "rgba(0,0,0,0.25)",
                  marginBottom: "8px",
                  transition: "background 0.2s",
                  borderLeft: `3px solid ${statusColor}`,
                }}
              >
                <span style={{ fontWeight: 600 }}>{p.product_name || p.name}</span>
                <span style={{ opacity: 0.7 }}>{p.product_id || p.id}</span>
                <span style={{ color: statusColor, fontWeight: 700 }}>{stock}</span>
                <span>₹{parseFloat(p.price || 0).toFixed(2)}</span>
                <span
                  style={{
                    background: `${statusColor}22`,
                    color: statusColor,
                    padding: "3px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 600,
                    display: "inline-block",
                  }}
                >
                  {statusLabel}
                </span>
              </div>
            );
          })}

        {products.length === 0 && (
          <p style={{ opacity: 0.5, textAlign: "center", padding: "20px" }}>
            Loading inventory data...
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
