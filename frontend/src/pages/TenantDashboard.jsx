import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import { Calendar, Heart, Eye, ArrowRight, ShieldAlert, Sparkles, User, Mail, Phone } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TenantDashboard = () => {
  const { user } = useContext(AuthContext);

  // States
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'wishlist'
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTenantData = async () => {
    setLoading(true);
    try {
      // Fetch Bookings
      const bookingsResponse = await axios.get('/api/bookings/my-bookings');
      setBookings(bookingsResponse.data);

      // Fetch Wishlist
      const wishlistResponse = await axios.get('/api/wishlist');
      setWishlist(wishlistResponse.data);
    } catch (error) {
      console.error('Error fetching tenant dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  const handleWishlistUpdateInDashboard = (propertyId, isAdded) => {
    // If removed from wishlist, filter out of state
    if (!isAdded) {
      setWishlist(wishlist.filter((item) => item._id !== propertyId));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-glass-success">Approved</span>;
      case 'rejected':
        return <span className="badge badge-glass-danger">Rejected</span>;
      default:
        return <span className="badge badge-glass-primary">Pending</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container py-5 text-white">
      {/* Profile Welcome Header */}
      <div className="glass-panel p-4 mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-gradient rounded-circle p-3 text-white">
            <User size={30} />
          </div>
          <div>
            <span className="badge bg-primary text-uppercase mb-1">{user?.role} Profile</span>
            <h2 className="fw-extrabold glowing-text mb-0">Welcome, {user?.name}</h2>
            <p className="text-muted small mb-0 d-flex flex-wrap gap-3 mt-1">
              <span className="d-flex align-items-center gap-1"><Mail size={12} className="text-primary" /> {user?.email}</span>
              <span className="d-flex align-items-center gap-1"><Phone size={12} className="text-primary" /> {user?.phone || 'No phone'}</span>
            </p>
          </div>
        </div>
        <div className="text-md-end">
          <Link to="/" className="btn btn-premium-primary d-flex align-items-center gap-1 justify-content-center">
            Browse Homes <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Tabs Toggles */}
      <ul className="nav nav-pills mb-4" id="pills-tab" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link nav-link-premium ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
            type="button"
          >
            <Calendar size={16} className="me-2" />
            My Bookings ({bookings.length})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link nav-link-premium ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
            type="button"
          >
            <Heart size={16} className="me-2" />
            Wishlist / Shortlists ({wishlist.length})
          </button>
        </li>
      </ul>

      {/* Tab Contents */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Fetching dashboard activities...</p>
        </div>
      ) : activeTab === 'bookings' ? (
        /* Bookings View */
        <div>
          {bookings.length === 0 ? (
            <div className="glass-panel text-center py-5 px-4 border-dashed">
              <Calendar size={48} className="text-muted mb-3" />
              <h4 className="fw-bold">No Bookings Found</h4>
              <p className="text-muted mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
                You haven't requested any home bookings yet. Find a property you like and submit an application!
              </p>
              <Link to="/" className="btn btn-premium-primary">
                Browse Rental Listings
              </Link>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="glass-panel p-4">
                  <div className="row g-4 align-items-center">
                    {/* Property Mini Column */}
                    <div className="col-md-5">
                      <div className="d-flex gap-3 align-items-center">
                        <img
                          src={
                            booking.property?.images?.[0] ||
                            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=200&auto=format&fit=crop&q=80'
                          }
                          alt={booking.property?.title}
                          className="rounded-3 object-fit-cover"
                          style={{ width: '90px', height: '90px' }}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=200&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="overflow-hidden">
                          <h5 className="fw-bold text-truncate text-white mb-1">
                            {booking.property?.title || 'Unknown Property'}
                          </h5>
                          <p className="text-muted small text-truncate mb-0">
                            {booking.property?.location}
                          </p>
                          <Link to={`/properties/${booking.property?._id}`} className="btn btn-link text-primary small p-0 mt-1 d-inline-flex align-items-center gap-1 text-decoration-none" style={{ fontSize: '0.85rem' }}>
                            <Eye size={12} /> View Page
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Booking Dates Column */}
                    <div className="col-sm-6 col-md-3">
                      <div className="small text-muted">Lease Schedule</div>
                      <div className="fw-bold text-white small mt-1">
                        {formatDate(booking.startDate)}
                      </div>
                      <div className="text-muted small">to</div>
                      <div className="fw-bold text-white small">
                        {formatDate(booking.endDate)}
                      </div>
                    </div>

                    {/* Total Price Column */}
                    <div className="col-sm-3 col-md-2">
                      <div className="small text-muted">Price Calculation</div>
                      <div className="fs-5 fw-extrabold text-primary mt-1">
                        ₹{booking.totalPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-muted small">Total contract</div>
                    </div>

                    {/* Booking Status Column */}
                    <div className="col-sm-3 col-md-2 text-md-end">
                      <div className="small text-muted mb-2 d-md-none">Booking Status</div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  {/* Landlord Contact Info (Visible if Approved) */}
                  {booking.status === 'approved' && booking.landlord && (
                    <div className="mt-3 pt-3 border-top d-flex flex-wrap gap-4 align-items-center text-muted small" style={{ borderColor: 'var(--border-color) !important' }}>
                      <span className="badge bg-success bg-opacity-15 border border-success border-opacity-35 text-success">
                        Contact Details Unlocked
                      </span>
                      <span className="d-flex align-items-center gap-1"><User size={14} className="text-primary" /> <strong>Landlord:</strong> {booking.landlord.name}</span>
                      <span className="d-flex align-items-center gap-1"><Mail size={14} className="text-primary" /> {booking.landlord.email}</span>
                      <span className="d-flex align-items-center gap-1"><Phone size={14} className="text-primary" /> {booking.landlord.phone || 'No phone listed'}</span>
                    </div>
                  )}

                  {booking.status === 'pending' && (
                    <div className="mt-2 text-muted small d-flex align-items-center gap-1">
                      <Sparkles size={12} className="text-warning" />
                      <span>Wait for the landlord's moderation response. Once approved, contact details will unlock automatically.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Wishlist View */
        <div>
          {wishlist.length === 0 ? (
            <div className="glass-panel text-center py-5 px-4 border-dashed">
              <Heart size={48} className="text-muted mb-3" />
              <h4 className="fw-bold">Your Wishlist is Empty</h4>
              <p className="text-muted mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
                Save properties to your wishlist while browsing to track updates and quickly reference them later.
              </p>
              <Link to="/" className="btn btn-premium-primary">
                Browse Properties
              </Link>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {wishlist.map((property) => (
                <div key={property._id} className="col">
                  <PropertyCard
                    property={property}
                    isWishlisted={true}
                    onWishlistUpdate={handleWishlistUpdateInDashboard}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;
