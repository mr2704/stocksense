import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, Settings, LogOut, Package, AlertTriangle } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { inventory } = useInventory();
  const { user, profile, signOut } = useAuth();

  const displayName  = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const displayRole  = profile?.role || 'seller';

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

  // Calculate dynamic notifications
  const notifications = [];
  inventory.forEach(item => {
    if (item.stock === 0) {
      notifications.push(
        <div key={`out-${item.id}`} className="dropdown-item unread">
          <div className="item-icon bg-danger" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <AlertTriangle size={14} />
          </div>
          <div className="item-content">
            <p><strong>Out of Stock:</strong> {item.name}</p>
            <span>Order immediately</span>
          </div>
        </div>
      );
    } else if (item.avgDemand > 0) {
      const daysLeft = item.stock / item.avgDemand;
      if (daysLeft <= 7) {
        notifications.push(
          <div key={`low-${item.id}`} className="dropdown-item unread">
            <div className="item-icon bg-warning">
              <Bell size={14} />
            </div>
            <div className="item-content">
              <p><strong>Restock Reminder:</strong> {item.name}</p>
              <span>Runs out in {Math.ceil(daysLeft)} days</span>
            </div>
          </div>
        );
      }
    }
  });

  if (notifications.length === 0) {
    notifications.push(
       <div key="none" className="dropdown-item">
         <div className="item-content" style={{ textAlign: "center", width: "100%" }}>
           <p style={{ color: "var(--text-secondary)" }}>No alerts at this time.</p>
         </div>
       </div>
    );
  }

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const q = query.toLowerCase();
      const results = inventory.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.id.toLowerCase().includes(q) || 
        item.category.toLowerCase().includes(q)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <header className="header glass-panel">
      <div className="search-container" style={{ position: 'relative' }}>
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search products, orders, or SKUs..." 
          className="search-input"
          value={searchQuery}
          onChange={handleSearch}
        />
        {searchQuery.trim().length > 0 && (
           <div className="dropdown-menu search-results-menu animate-fade-in" style={{ position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: '8px', maxHeight: '300px', overflowY: 'auto' }}>
             {searchResults.length > 0 ? (
                <div className="dropdown-list">
                  {searchResults.map(item => (
                    <div key={item.id} className="dropdown-item" onClick={() => { setSearchQuery(''); navigate('/inventory'); }} style={{ cursor: 'pointer' }}>
                      <div className="item-icon bg-primary" style={{ flexShrink: 0 }}><Package size={14}/></div>
                      <div className="item-content">
                        <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)' }}>{item.name}</p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.id} • {item.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
             ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No results found for "{searchQuery}"
                </div>
             )}
           </div>
        )}
      </div>

      <div className="header-actions">
        <div className="dropdown-container" ref={notifRef}>
          <button 
            className="icon-btn notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {notifications.length > 0 && notifications[0].key !== "none" && (
                <span className="badge">{notifications.length}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="dropdown-menu notifications-menu animate-fade-in">
              <div className="dropdown-header">
                <h4>Notifications</h4>
                <button className="text-btn" onClick={() => setShowNotifications(false)}>Dismiss</button>
              </div>
              <div className="dropdown-list">
                {notifications}
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
              <span className="user-name">{displayName}</span>
              <span className="user-role" style={{ textTransform: 'capitalize' }}>{displayRole}</span>
            </div>
          </div>
          
          {showProfile && (
            <div className="dropdown-menu profile-menu animate-fade-in">
              <div className="profile-header">
                <strong>{displayName}</strong>
                <span>{displayEmail}</span>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-action">
                <User size={16} /> My Profile
              </button>
              <button className="dropdown-action">
                <Settings size={16} /> Account Settings
              </button>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-action text-danger"
                onClick={async () => { await signOut(); navigate('/login'); }}
              >
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
