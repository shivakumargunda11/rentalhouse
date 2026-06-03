import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Heart, LogOut, User, LayoutDashboard, Key } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top glass-nav navbar-dark py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fs-3 fw-extrabold text-white" to="/">
          <div className="bg-primary bg-gradient rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <Key size={20} className="text-white" />
          </div>
          <span className="glowing-text">House<span className="accent-text">Hunt</span></span>
        </Link>

        <button
          className="navbar-toggler form-glass"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ border: '1px solid var(--border-color)', outline: 'none' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-2 mt-3 mt-lg-0">
            <li className="nav-item">
              <Link className="nav-link text-white d-flex align-items-center gap-1 px-3 py-2 rounded-3 hover-effect" to="/">
                <Home size={18} />
                <span>Home</span>
              </Link>
            </li>

            {user && (
              <>
                {user.role === 'tenant' && (
                  <li className="nav-item">
                    <Link className="nav-link text-white d-flex align-items-center gap-1 px-3 py-2 rounded-3" to="/tenant-dashboard">
                      <LayoutDashboard size={18} />
                      <span>Tenant Panel</span>
                    </Link>
                  </li>
                )}
                {user.role === 'landlord' && (
                  <li className="nav-item">
                    <Link className="nav-link text-white d-flex align-items-center gap-1 px-3 py-2 rounded-3" to="/landlord-dashboard">
                      <LayoutDashboard size={18} />
                      <span>Landlord Panel</span>
                    </Link>
                  </li>
                )}
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link className="nav-link text-white d-flex align-items-center gap-1 px-3 py-2 rounded-3" to="/admin-dashboard">
                      <LayoutDashboard size={18} />
                      <span>Admin Panel</span>
                    </Link>
                  </li>
                )}
              </>
            )}

            {!user ? (
              <>
                <li className="nav-item ms-lg-2">
                  <Link className="btn btn-premium-secondary w-100" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-premium-primary w-100" to="/register">
                    Sign Up
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item dropdown ms-lg-2">
                <a
                  className="nav-link dropdown-toggle text-white d-flex align-items-center gap-2 form-glass px-3 py-2"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ cursor: 'pointer' }}
                >
                  <User size={18} className="text-primary" />
                  <span className="fw-semibold">{user.name}</span>
                  <span className="badge bg-primary text-capitalize" style={{ fontSize: '0.7rem' }}>
                    {user.role}
                  </span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark glass-panel p-2 mt-2" style={{ border: '1px solid var(--border-color)' }}>
                  <li>
                    <span className="dropdown-item-text text-muted small">Logged in as {user.email}</span>
                  </li>
                  <li><hr className="dropdown-divider" style={{ backgroundColor: 'var(--border-color)' }} /></li>
                  {user.role === 'tenant' && (
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2 py-2 text-white" to="/tenant-dashboard">
                        <Heart size={16} className="text-danger" /> Wishlist & Bookings
                      </Link>
                    </li>
                  )}
                  {user.role === 'landlord' && (
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2 py-2 text-white" to="/landlord-dashboard">
                        <Key size={16} className="text-primary" /> Manage Listings
                      </Link>
                    </li>
                  )}
                  {user.role === 'admin' && (
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2 py-2 text-white" to="/admin-dashboard">
                        <LayoutDashboard size={16} className="text-warning" /> Platform Stats
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider" style={{ backgroundColor: 'var(--border-color)' }} /></li>
                  <li>
                    <button
                      className="dropdown-item text-danger d-flex align-items-center gap-2 py-2"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
