import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Signup.css'; // reuse same styles

const Login = () => {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate               = useNavigate();
  const { signIn }             = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
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
          <p>Sign in to manage your inventory.</p>
        </div>

        {error && (
          <div className="auth-error">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary btn-signup" disabled={loading}>
            {loading ? 'Signing in…' : (<>Sign In <FiArrowRight /></>)}
          </button>
        </form>

        <div className="signup-footer">
          <p>Don't have an account? <Link to="/signup" className="login-link">Create one</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
