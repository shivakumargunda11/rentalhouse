import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Bed, Bath, Maximize2, Heart } from 'lucide-react';
import axios from 'axios';

const PropertyCard = ({ property, onWishlistUpdate, isWishlisted = false }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'tenant') {
      alert('Only tenants can save listings to their wishlist.');
      return;
    }

    try {
      if (isWishlisted) {
        await axios.delete(`/api/wishlist/${property._id}`);
      } else {
        await axios.post(`/api/wishlist/${property._id}`);
      }
      if (onWishlistUpdate) {
        onWishlistUpdate(property._id, !isWishlisted);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  // Modern fallback house images from Unsplash
  const defaultImages = [
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
  ];

  // Pick a stable default image based on the property ID's last characters
  const getPropertyImage = () => {
    if (property.images && property.images.length > 0 && property.images[0]) {
      return property.images[0];
    }
    const index = parseInt(property._id?.toString().slice(-1), 16) % defaultImages.length || 0;
    return defaultImages[index];
  };

  return (
    <div className="card glass-panel h-100 overflow-hidden text-white" style={{ border: '1px solid var(--border-color)' }}>
      <div className="position-relative">
        <div className="property-card-img-wrapper">
          <img
            src={getPropertyImage()}
            className="property-card-img"
            alt={property.title}
            onError={(e) => {
              e.target.src = defaultImages[0];
            }}
          />
        </div>

        {/* Availability status badge */}
        <div className="position-absolute top-3 start-3 z-3 d-flex gap-2" style={{ top: '15px', left: '15px' }}>
          {property.availability ? (
            <span className="badge badge-glass-success">Available</span>
          ) : (
            <span className="badge badge-glass-danger">Rented</span>
          )}
          <span className="badge badge-glass-primary text-capitalize">{property.type}</span>
        </div>

        {/* Wishlist button */}
        {(!user || user.role === 'tenant') && (
          <button
            className={`wishlist-heart-btn ${isWishlisted ? 'active' : ''}`}
            onClick={handleWishlistToggle}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist"
          >
            <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} />
          </button>
        )}
      </div>

      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title fw-bold mb-0 text-truncate text-white" style={{ maxWidth: '75%' }}>
            {property.title}
          </h5>
          <div className="text-end">
            <span className="fs-5 fw-extrabold text-primary">₹{property.price.toLocaleString('en-IN')}</span>
            <span className="text-muted small">/mo</span>
          </div>
        </div>

        <p className="text-muted small d-flex align-items-center gap-1 mb-3">
          <MapPin size={14} className="text-primary flex-shrink-0" />
          <span className="text-truncate">{property.location}</span>
        </p>

        <p className="card-text text-muted small text-clamp-2 mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '38px' }}>
          {property.description}
        </p>

        {/* Features row */}
        <div className="d-flex justify-content-between border-top pt-3 mt-auto" style={{ borderColor: 'var(--border-color) !important' }}>
          <div className="d-flex align-items-center gap-1 text-muted small">
            <Bed size={15} className="text-primary" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="d-flex align-items-center gap-1 text-muted small">
            <Bath size={15} className="text-primary" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="d-flex align-items-center gap-1 text-muted small">
            <Maximize2 size={15} className="text-primary" />
            <span>{property.size} sqft</span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/properties/${property._id}`}
          className="btn btn-premium-secondary w-100 mt-3 text-center d-block text-decoration-none"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;
