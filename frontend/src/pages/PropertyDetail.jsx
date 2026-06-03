import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Bed, Bath, Maximize2, Heart, Calendar, User, Mail, Phone, ShieldAlert, BadgeCheck, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // States
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Booking Form States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Sourced Fallback Houses (matching PropertyCard)
  const defaultImages = [
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
  ];

  const fetchPropertyDetails = async () => {
    try {
      const response = await axios.get(`/api/properties/${id}`);
      setProperty(response.data);
      
      // Determine if currently wishlisted
      if (user && user.role === 'tenant') {
        const wishlistResponse = await axios.get('/api/wishlist');
        const listIds = wishlistResponse.data.map((item) => item._id);
        setIsWishlisted(listIds.includes(response.data._id));
      }
    } catch (error) {
      console.error('Error fetching property detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyDetails();
  }, [id, user]);

  // Calculate pricing breakdown when dates change
  useEffect(() => {
    if (startDate && endDate && property) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (end > start) {
        setDays(diffDays);
        // Formula: Monthly Price * (Days / 30)
        const total = Math.round(property.price * (diffDays / 30));
        setTotalPrice(total);
        setBookingError('');
      } else {
        setDays(0);
        setTotalPrice(0);
        setBookingError('End date must be after start date.');
      }
    } else {
      setDays(0);
      setTotalPrice(0);
    }
  }, [startDate, endDate, property]);

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await axios.delete(`/api/wishlist/${property._id}`);
        setIsWishlisted(false);
      } else {
        await axios.post(`/api/wishlist/${property._id}`);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess(false);

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'tenant') {
      setBookingError('Only tenants can book properties.');
      return;
    }

    if (!startDate || !endDate) {
      setBookingError('Please enter start and end dates.');
      return;
    }

    if (days <= 0) {
      setBookingError('Please enter a valid rental range.');
      return;
    }

    setBookingLoading(true);
    try {
      await axios.post('/api/bookings', {
        propertyId: property._id,
        startDate,
        endDate,
        totalPrice,
      });
      setBookingSuccess(true);
      setStartDate('');
      setEndDate('');
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Booking request failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-3">Loading listing details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container py-5 text-center my-5 text-white">
        <h4 className="fw-bold text-danger">Listing Not Found</h4>
        <p className="text-muted">The property you are looking for might have been deleted by its landlord or administration.</p>
        <Link to="/" className="btn btn-premium-primary mt-3">Back to Browse</Link>
      </div>
    );
  }

  // Pick static fallback image based on property ID
  const getPropertyDetailImage = () => {
    if (property.images && property.images.length > 0 && property.images[0]) {
      return property.images[0];
    }
    const index = parseInt(property._id?.toString().slice(-1), 16) % defaultImages.length || 0;
    return defaultImages[index];
  };

  return (
    <div className="container py-5 text-white">
      {/* Property Image Banner */}
      <div className="position-relative mb-5 rounded-4 overflow-hidden shadow-lg" style={{ height: '400px' }}>
        <img
          src={getPropertyDetailImage()}
          alt={property.title}
          className="w-100 h-100"
          style={{ objectFit: 'cover' }}
        />
        <div className="position-absolute bottom-0 start-0 end-0 p-4 p-md-5" style={{ background: 'linear-gradient(to top, rgba(9,10,17,0.95), transparent)' }}>
          <div className="d-flex flex-wrap gap-2 mb-2">
            <span className="badge badge-glass-primary text-capitalize">{property.type}</span>
            {property.availability ? (
              <span className="badge badge-glass-success">Available for rent</span>
            ) : (
              <span className="badge badge-glass-danger">Rented / Unavailable</span>
            )}
          </div>
          <h1 className="fw-extrabold glowing-text fs-2 fs-md-1 mb-2">{property.title}</h1>
          <p className="text-muted d-flex align-items-center gap-1 mb-0">
            <MapPin size={16} className="text-primary flex-shrink-0" />
            <span>{property.location}</span>
          </p>
        </div>

        {/* Floating Heart Toggle */}
        {(!user || user.role === 'tenant') && (
          <button
            onClick={handleWishlistToggle}
            className={`wishlist-heart-btn position-absolute active`}
            style={{ top: '20px', right: '20px', width: '50px', height: '50px', background: 'rgba(9, 10, 17, 0.75)' }}
            title={isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
          >
            <Heart size={24} fill={isWishlisted ? '#ef4444' : 'none'} className={isWishlisted ? 'text-danger' : 'text-white'} />
          </button>
        )}
      </div>

      {/* Details Row */}
      <div className="row g-5">
        {/* Left Side: Property details */}
        <div className="col-lg-8">
          <div className="glass-panel p-4 mb-4">
            <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <span className="bg-primary rounded-2 p-1" style={{ display: 'inline-block', width: '6px', height: '24px' }}></span>
              Property Features
            </h4>
            <div className="row g-3">
              <div className="col-4 text-center p-3 border-end" style={{ borderColor: 'var(--border-color) !important' }}>
                <Bed size={24} className="text-primary mb-2" />
                <div className="small text-muted">Bedrooms</div>
                <div className="fw-bold fs-5">{property.bedrooms} Beds</div>
              </div>
              <div className="col-4 text-center p-3 border-end" style={{ borderColor: 'var(--border-color) !important' }}>
                <Bath size={24} className="text-primary mb-2" />
                <div className="small text-muted">Bathrooms</div>
                <div className="fw-bold fs-5">{property.bathrooms} Baths</div>
              </div>
              <div className="col-4 text-center p-3">
                <Maximize2 size={24} className="text-primary mb-2" />
                <div className="small text-muted">Dimensions</div>
                <div className="fw-bold fs-5">{property.size} sqft</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-panel p-4 mb-4">
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <span className="bg-primary rounded-2 p-1" style={{ display: 'inline-block', width: '6px', height: '24px' }}></span>
              Description
            </h4>
            <p className="text-muted leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="glass-panel p-4 mb-4">
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <span className="bg-primary rounded-2 p-1" style={{ display: 'inline-block', width: '6px', height: '24px' }}></span>
              Amenities Available
            </h4>
            {property.amenities && property.amenities.length > 0 ? (
              <div className="d-flex flex-wrap gap-2 mt-2">
                {property.amenities.map((amenity, i) => (
                  <span key={i} className="badge bg-secondary bg-opacity-25 border border-white border-opacity-10 text-white px-3 py-2 rounded-pill fs-7">
                    {amenity}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted small">No specific amenities listing entered by owner.</p>
            )}
          </div>

          {/* Landlord Info */}
          <div className="glass-panel p-4">
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <span className="bg-primary rounded-2 p-1" style={{ display: 'inline-block', width: '6px', height: '24px' }}></span>
              Landlord Information
            </h4>
            {property.owner ? (
              <div className="d-flex flex-column gap-3 mt-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary bg-gradient rounded-circle p-3 text-white">
                    <User size={24} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-white">{property.owner.name}</h5>
                    <span className="badge bg-success bg-opacity-15 border border-success border-opacity-35 text-success text-uppercase small mt-1">
                      Verified Host
                    </span>
                  </div>
                </div>
                <div className="row g-2 pt-3 border-top" style={{ borderColor: 'var(--border-color) !important' }}>
                  <div className="col-sm-6 d-flex align-items-center gap-2 text-muted small">
                    <Mail size={16} className="text-primary" />
                    <span>{property.owner.email}</span>
                  </div>
                  <div className="col-sm-6 d-flex align-items-center gap-2 text-muted small">
                    <Phone size={16} className="text-primary" />
                    <span>{property.owner.phone || 'No phone listed'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted">Landlord profiles could not be resolved.</p>
            )}
          </div>
        </div>

        {/* Right Side: Booking Form */}
        <div className="col-lg-4">
          <div className="glass-panel p-4 position-sticky" style={{ top: '100px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <span className="text-muted small">Monthly Rent</span>
                <div className="fs-3 fw-black text-primary">${property.price}</div>
              </div>
              <span className="badge bg-primary bg-opacity-15 text-white py-2 px-3 border border-primary border-opacity-25">
                Per Month
              </span>
            </div>

            {/* Booking Success Banner */}
            {bookingSuccess && (
              <div className="text-center py-4 mb-4 glass-panel bg-success bg-opacity-10 border-success border-opacity-30 rounded-3">
                <CheckCircle2 size={40} className="text-success mb-2" />
                <h5 className="fw-bold text-success">Booking Requested!</h5>
                <p className="text-muted small mb-0 px-2">
                  Your application has been logged. Review and check statuses in your{' '}
                  <Link to="/tenant-dashboard" className="text-success fw-semibold">
                    dashboard
                  </Link>.
                </p>
              </div>
            )}

            {/* Booking Error Banner */}
            {bookingError && (
              <div className="alert bg-danger bg-opacity-10 border border-danger border-opacity-30 text-danger rounded-3 d-flex align-items-center gap-2 mb-4" style={{ fontSize: '0.85rem' }}>
                <ShieldAlert size={16} className="flex-shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Form Logic based on Auth status */}
            {!property.availability ? (
              <div className="text-center py-4 text-muted">
                <ShieldAlert size={36} className="text-warning mb-2" />
                <h5>Currently Rented Out</h5>
                <p className="small mb-0">This property is active but not taking rental requests.</p>
              </div>
            ) : !user ? (
              <div>
                <div className="alert bg-white bg-opacity-5 border border-white border-opacity-10 text-muted rounded-3 text-center mb-4 small">
                  You need to be authenticated as a tenant to book properties.
                </div>
                <Link to="/login" className="btn btn-premium-primary w-100 d-block text-center text-decoration-none">
                  Login to Book
                </Link>
              </div>
            ) : user.role !== 'tenant' ? (
              <div className="text-center p-3 border rounded-3 bg-white bg-opacity-5" style={{ borderColor: 'var(--border-color)' }}>
                <BadgeCheck size={36} className="text-warning mb-2" />
                <h5>Landlord Preview Mode</h5>
                <p className="text-muted small mb-0">
                  You are logged in as a <strong>{user.role}</strong>. Booking functions are only accessible to tenant profiles.
                </p>
              </div>
            ) : (
              /* Booking Date Form */
              <form onSubmit={handleBookingSubmit}>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold">Move-In Date</label>
                  <div className="input-group">
                    <span className="input-group-text form-glass" style={{ borderRight: 'none' }}>
                      <Calendar size={16} className="text-muted" />
                    </span>
                    <input
                      type="date"
                      className="form-control form-glass"
                      style={{ borderLeft: 'none' }}
                      min={new Date().toISOString().split('T')[0]}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold">Move-Out Date</label>
                  <div className="input-group">
                    <span className="input-group-text form-glass" style={{ borderRight: 'none' }}>
                      <Calendar size={16} className="text-muted" />
                    </span>
                    <input
                      type="date"
                      className="form-control form-glass"
                      style={{ borderLeft: 'none' }}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Price Breakdown */}
                {days > 0 && (
                  <div className="p-3 my-4 rounded-3 bg-white bg-opacity-5 border border-white border-opacity-5">
                    <h6 className="fw-bold mb-2">Cost Details</h6>
                    <div className="d-flex justify-content-between small text-muted mb-1">
                      <span>Rate (daily estimate)</span>
                      <span>${Math.round(property.price / 30)}/day</span>
                    </div>
                    <div className="d-flex justify-content-between small text-muted mb-2">
                      <span>Duration</span>
                      <span>{days} days</span>
                    </div>
                    <div className="d-flex justify-content-between fw-bold pt-2 border-top text-white" style={{ borderColor: 'var(--border-color) !important' }}>
                      <span>Estimated Total</span>
                      <span className="text-primary">${totalPrice}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-premium-accent w-100 py-2 fw-bold"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Submitting Application...' : 'Apply for Booking'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
