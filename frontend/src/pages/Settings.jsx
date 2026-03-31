import React from 'react';
import { User, Bell, Shield, Moon, Monitor } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  return (
    <div className="settings-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account preferences, notifications, and security rules.</p>
        </div>
        <div className="header-actions">
           <button className="btn-primary">Save Changes</button>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar glass-panel">
           <nav className="settings-nav">
             <button className="settings-nav-item active"><User size={18} /> Profile</button>
             <button className="settings-nav-item"><Bell size={18} /> Notifications</button>
             <button className="settings-nav-item"><Shield size={18} /> Security</button>
             <button className="settings-nav-item"><Monitor size={18} /> Appearance</button>
           </nav>
        </div>

        <div className="settings-main glass-panel">
          <section className="settings-section">
            <h2 className="section-title">Profile Information</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" defaultValue="Store Admin" className="form-input" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" defaultValue="admin@stocksense.com" className="form-input" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input type="text" defaultValue="Seller Central Admin" disabled className="form-input disabled" />
            </div>
          </section>

          <section className="settings-section">
            <h2 className="section-title">Preferences</h2>
            <div className="toggle-group">
              <div className="toggle-info">
                 <Moon size={18} className="text-secondary" />
                 <div>
                    <h4>Dark Mode</h4>
                    <p className="text-secondary">Enable beautiful dark theme</p>
                 </div>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="toggle-group">
              <div className="toggle-info">
                 <Bell size={18} className="text-secondary" />
                 <div>
                    <h4>Email Notifications</h4>
                    <p className="text-secondary">Receive daily reports</p>
                 </div>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
