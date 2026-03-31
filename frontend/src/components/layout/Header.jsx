import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Settings, LogOut, Package } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header glass-panel">
      <div className="search-container">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search products, orders, or SKUs..." 
          className="search-input"
        />
      </div>

      <div className="header-actions">
        <div className="dropdown-container" ref={notifRef}>
          <button 
            className="icon-btn notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="badge">3</span>
          </button>
          
          {showNotifications && (
            <div className="dropdown-menu notifications-menu animate-fade-in">
              <div className="dropdown-header">
                <h4>Notifications</h4>
                <button className="text-btn">Mark all as read</button>
              </div>
              <div className="dropdown-list">
                <div className="dropdown-item unread">
                  <div className="item-icon bg-warning"><Bell size={14} /></div>
                  <div className="item-content">
                    <p>Low stock alert: Mechanical Keyboard</p>
                    <span>2 mins ago</span>
                  </div>
                </div>
                <div className="dropdown-item">
                  <div className="item-icon bg-success"><Package size={14} /></div>
                  <div className="item-content">
                    <p>Shipment received: 50x Smart Trackers</p>
                    <span>1 hour ago</span>
                  </div>
                </div>
                <div className="dropdown-item">
                  <div className="item-icon bg-primary"><Bell size={14} /></div>
                  <div className="item-content">
                    <p>Weekly report generated</p>
                    <span>Yesterday</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="dropdown-container" ref={profileRef}>
          <div 
            className="user-profile" 
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="avatar">
              <User size={18} />
            </div>
            <div className="user-info">
              <span className="user-name">Store Admin</span>
              <span className="user-role">Seller Central</span>
            </div>
          </div>
          
          {showProfile && (
            <div className="dropdown-menu profile-menu animate-fade-in">
              <div className="profile-header">
                <strong>Admin User</strong>
                <span>admin@stocksense.com</span>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-action">
                <User size={16} /> My Profile
              </button>
              <button className="dropdown-action">
                <Settings size={16} /> Account Settings
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-action text-danger">
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
