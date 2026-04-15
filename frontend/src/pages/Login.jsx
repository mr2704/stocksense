import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import './Signup.css'; // Reusing matching styles from Signup

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    console.log('Login data:', formData);
    // You'd typically make an API call here. Assuming success:
    navigate('/');
  };

  return (
    <div className="signup-container">
      <div className="signup-card glass-panel animate-fade-in">
        <div className="signup-header">
          <div className="signup-logo">
            <span className="logo-icon">📦</span>
            <h2>StockSense</h2>
          </div>
          <h1>Welcome Back</h1>
          <p>Enter your details to access your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password">Password</label>
              <a href="#" className="forgot-password" style={{ fontSize: '13px', color: 'var(--text-tertiary)', textDecoration: 'none' }}>Forgot password?</a>
            </div>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary btn-signup">
            Log In <FiArrowRight />
          </button>
        </form>

        <div className="signup-footer">
          <p>Don't have an account? <Link to="/signup" className="login-link">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
