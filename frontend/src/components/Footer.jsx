import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Key, Mail, Phone, Info } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="glass-nav mt-auto py-5" style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(5, 6, 10, 0.9)' }}>
      <div className="container">
        <div className="row g-4 justify-content-between">
          <div className="col-lg-4">
            <Link className="d-flex align-items-center gap-2 fs-3 fw-extrabold text-white text-decoration-none mb-3" to="/">
              <div className="bg-primary bg-gradient rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <Key size={20} className="text-white" />
              </div>
              <span className="glowing-text">House<span className="accent-text">Hunt</span></span>
            </Link>
            <p className="text-muted mb-4" style={{ maxWidth: '320px' }}>
              Discover, list, and book top-tier housing with our modern, secure rental ecosystem built for tenants, landlords, and administrators.
            </p>
          </div>
          
          <div className="col-md-4 col-lg-3">
            <h5 className="text-white fw-bold mb-3">Quick Links</h5>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li>
                <Link to="/" className="text-muted text-decoration-none hover-white">Home Listings</Link>
              </li>
              <li>
                <Link to="/login" className="text-muted text-decoration-none hover-white">Tenant Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-muted text-decoration-none hover-white">Host Registration</Link>
              </li>
            </ul>
          </div>

          <div className="col-md-4 col-lg-3">
            <h5 className="text-white fw-bold mb-3">Contact Support</h5>
            <ul className="list-unstyled d-flex flex-column gap-3 text-muted">
              <li className="d-flex align-items-center gap-2">
                <Mail size={16} className="text-primary" />
                <span>support@househunt.com</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Phone size={16} className="text-primary" />
                <span>+1 (555) 389-2910</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Info size={16} className="text-primary" />
                <span>24/7 Booking Resolution</span>
              </li>
            </ul>
          </div>
        </div>
        <hr className="my-4" style={{ backgroundColor: 'var(--border-color)', opacity: 0.1 }} />
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          <p className="text-muted small mb-0">
            &copy; {new Date().getFullYear()} HouseHunt Inc. All rights reserved.
          </p>
          <div className="d-flex gap-3">
            <a href="#" className="text-muted text-decoration-none hover-white small">Privacy Policy</a>
            <a href="#" className="text-muted text-decoration-none hover-white small">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
