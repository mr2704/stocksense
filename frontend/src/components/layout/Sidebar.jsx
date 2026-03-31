import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, TrendingUp, Settings, LogOut, Box } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/inventory', name: 'Inventory Management', icon: <Package size={20} /> },
    { path: '/analytics', name: 'Demand & Analytics', icon: <TrendingUp size={20} /> },
    { path: '/settings', name: 'Settings', icon: <Settings size={20} /> }
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-brand">
        <Box className="brand-logo" size={32} />
        <h2 className="brand-text">StockSense</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
