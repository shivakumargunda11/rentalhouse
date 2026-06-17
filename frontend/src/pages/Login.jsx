import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Key, Mail, Lock, AlertTriangle, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect them immediately to their dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin-dashboard');
      else if (user.role === 'landlord') navigate('/landlord-dashboard');
      else navigate('/tenant-dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="container py-5 my-5 d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <div className="w-100" style={{ maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <div className="bg-primary bg-gradient rounded-3 p-3 d-inline-flex mb-3 shadow">
            <Key size={32} className="text-white" />
          </div>
          <h2 className="fw-extrabold text-white glowing-text mb-1">Welcome Back</h2>
          <p className="text-muted">Login to manage your HouseHunt rentals</p>
        </div>

        <div className="glass-panel p-4 p-md-5">
          {error && (
            <div className="alert alert-glass-danger rounded-3 d-flex align-items-center gap-2 mb-4" style={{ fontSize: '0.9rem' }}>
              <AlertTriangle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="mb-3">
              <label className="form-label text-muted small fw-semibold">Email Address</label>
              <div className="input-group">
                <span className="input-group-text form-glass" style={{ borderRight: 'none' }}>
                  <Mail size={16} className="text-muted" />
                </span>
                <input
                  type="email"
                  className="form-control form-glass"
                  style={{ borderLeft: 'none' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="form-label text-muted small fw-semibold">Password</label>
              <div className="input-group">
                <span className="input-group-text form-glass" style={{ borderRight: 'none' }}>
                  <Lock size={16} className="text-muted" />
                </span>
                <input
                  type="password"
                  className="form-control form-glass"
                  style={{ borderLeft: 'none' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-premium-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 mb-3"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center text-muted small mb-0 mt-4">
            New to HouseHunt?{' '}
            <Link to="/register" className="text-primary text-decoration-none fw-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
