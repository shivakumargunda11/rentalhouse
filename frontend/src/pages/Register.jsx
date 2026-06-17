import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Key, Mail, Lock, User as UserIcon, Phone, AlertTriangle, ArrowRight, Compass } from 'lucide-react';

const Register = () => {
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('tenant');

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

    if (!name || !email || !password || !phone) {
      setError('Please fill in all details.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, role, phone);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="container py-5 my-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="w-100" style={{ maxWidth: '500px' }}>
        <div className="text-center mb-4">
          <div className="bg-primary bg-gradient rounded-3 p-3 d-inline-flex mb-3 shadow">
            <Key size={32} className="text-white" />
          </div>
          <h2 className="fw-extrabold text-white glowing-text mb-1">Create Account</h2>
          <p className="text-muted">Register to start renting or listing homes</p>
        </div>

        <div className="glass-panel p-4 p-md-5">
          {error && (
            <div className="alert alert-glass-danger rounded-3 d-flex align-items-center gap-2 mb-4" style={{ fontSize: '0.9rem' }}>
              <AlertTriangle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="mb-3">
              <label className="form-label text-muted small fw-semibold">Full Name</label>
              <div className="input-group">
                <span className="input-group-text form-glass" style={{ borderRight: 'none' }}>
                  <UserIcon size={16} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control form-glass"
                  style={{ borderLeft: 'none' }}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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

            {/* Phone Number Field */}
            <div className="mb-3">
              <label className="form-label text-muted small fw-semibold">Phone Number</label>
              <div className="input-group">
                <span className="input-group-text form-glass" style={{ borderRight: 'none' }}>
                  <Phone size={16} className="text-muted" />
                </span>
                <input
                  type="tel"
                  className="form-control form-glass"
                  style={{ borderLeft: 'none' }}
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-3">
              <label className="form-label text-muted small fw-semibold">Password</label>
              <div className="input-group">
                <span className="input-group-text form-glass" style={{ borderRight: 'none' }}>
                  <Lock size={16} className="text-muted" />
                </span>
                <input
                  type="password"
                  className="form-control form-glass"
                  style={{ borderLeft: 'none' }}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Account Role Field */}
            <div className="mb-4">
              <label className="form-label text-muted small fw-semibold">I want to register as a</label>
              <div className="input-group">
                <span className="input-group-text form-glass" style={{ borderRight: 'none' }}>
                  <Compass size={16} className="text-muted" />
                </span>
                <select
                  className="form-select form-glass"
                  style={{ borderLeft: 'none' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="tenant">Tenant (Looking to rent houses)</option>
                  <option value="landlord">Landlord / Host (Looking to list houses)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-premium-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 mb-3"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center text-muted small mb-0 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary text-decoration-none fw-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
