import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Building2, Plus, CalendarRange, DollarSign, Edit, Trash2, Check, X, ShieldAlert, Sparkles, XCircle, ArrowUpRight } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LandlordDashboard = () => {
  const { user } = useContext(AuthContext);

  // Layout Tab State
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' or 'bookings'
  const [showAddForm, setShowAddForm] = useState(false);
  const [editPropertyId, setEditPropertyId] = useState(null);

  // Data States
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('apartment');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [size, setSize] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [imageUrls, setImageUrls] = useState('');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const amenitiesList = ['Wifi', 'AC', 'Parking', 'Kitchen', 'Gym', 'Laundry', 'Furnished', 'Pet Friendly'];

  const fetchLandlordData = async () => {
    setLoading(true);
    try {
      const propResponse = await axios.get('/api/properties/my-listings');
      setProperties(propResponse.data);

      const bookingResponse = await axios.get('/api/bookings/landlord-bookings');
      setBookings(bookingResponse.data);
    } catch (error) {
      console.error('Error fetching landlord dashboard details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandlordData();
  }, []);

  const handleAmenityCheck = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleFormReset = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setLocation('');
    setType('apartment');
    setBedrooms('1');
    setBathrooms('1');
    setSize('');
    setSelectedAmenities([]);
    setImageUrls('');
    setFormError('');
    setFormSuccess('');
    setEditPropertyId(null);
  };

  const handleEditClick = (prop) => {
    setEditPropertyId(prop._id);
    setTitle(prop.title);
    setDescription(prop.description);
    setPrice(prop.price);
    setLocation(prop.location);
    setType(prop.type);
    setBedrooms(prop.bedrooms.toString());
    setBathrooms(prop.bathrooms.toString());
    setSize(prop.size.toString());
    setSelectedAmenities(prop.amenities || []);
    setImageUrls(prop.images?.join(', ') || '');
    setShowAddForm(true);
    // Scroll to form
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!title || !description || !price || !location || !size) {
      setFormError('Please fill in all required parameters.');
      return;
    }

    const imagesArray = imageUrls
      ? imageUrls.split(',').map((url) => url.trim()).filter((url) => url.length > 0)
      : [];

    const requestData = {
      title,
      description,
      price: Number(price),
      location,
      type,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      size: Number(size),
      amenities: selectedAmenities,
      images: imagesArray,
    };

    setSubmitting(true);
    try {
      if (editPropertyId) {
        // Edit property
        await axios.put(`/api/properties/${editPropertyId}`, requestData);
        setFormSuccess('Property listing updated successfully!');
      } else {
        // Add new property
        await axios.post('/api/properties', requestData);
        setFormSuccess('Property listing created successfully!');
      }

      handleFormReset();
      setShowAddForm(false);
      // Re-fetch data
      await fetchLandlordData();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Error processing property listing data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteListing = async (propertyId) => {
    if (!window.confirm('Are you sure you want to permanently delete this property listing? All bookings will remain in database but the listing will be deleted.')) {
      return;
    }
    try {
      await axios.delete(`/api/properties/${propertyId}`);
      setProperties(properties.filter((p) => p._id !== propertyId));
    } catch (error) {
      console.error('Error removing property:', error);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    // action: 'approved' or 'rejected'
    try {
      await axios.put(`/api/bookings/${bookingId}`, { status: action });
      // Update local state instead of re-fetching
      setBookings(
        bookings.map((b) => (b._id === bookingId ? { ...b, status: action } : b))
      );

      // If approved, update associated property availability to false
      if (action === 'approved') {
        const approvedBooking = bookings.find((b) => b._id === bookingId);
        if (approvedBooking && approvedBooking.property) {
          setProperties(
            properties.map((p) =>
              p._id === approvedBooking.property._id ? { ...p, availability: false } : p
            )
          );
        }
      } else if (action === 'rejected') {
        // Keep property available
        const rejectedBooking = bookings.find((b) => b._id === bookingId);
        if (rejectedBooking && rejectedBooking.property) {
          setProperties(
            properties.map((p) =>
              p._id === rejectedBooking.property._id ? { ...p, availability: true } : p
            )
          );
        }
      }
    } catch (error) {
      console.error(`Error updating booking to ${action}:`, error);
    }
  };

  // Stats Computations
  const totalListings = properties.length;
  const pendingRequestsCount = bookings.filter((b) => b.status === 'pending').length;
  const totalEarnings = bookings
    .filter((b) => b.status === 'approved')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container py-5 text-white">
      {/* Title & Profile section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
        <div>
          <span className="badge bg-success bg-opacity-15 border border-success border-opacity-25 text-success text-uppercase mb-1">
            Landlord Console
          </span>
          <h2 className="fw-extrabold glowing-text mb-0">Welcome, {user?.name}</h2>
          <p className="text-muted small mb-0">Manage listings, approve booking requests, and review statistics.</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-premium-primary d-flex align-items-center gap-1"
            onClick={() => {
              if (showAddForm) handleFormReset();
              setShowAddForm(!showAddForm);
            }}
          >
            {showAddForm ? 'Hide Form' : <><Plus size={18} /> Add Property</>}
          </button>
        </div>
      </div>

      {/* Summary stats widget */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="glass-panel p-4 mini-stat-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small text-uppercase fw-semibold">My Listings</span>
                <h3 className="fw-extrabold mt-1 text-white">{totalListings}</h3>
              </div>
              <div className="bg-primary bg-opacity-20 rounded-3 p-3 text-primary">
                <Building2 size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-panel p-4 mini-stat-card-accent">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small text-uppercase fw-semibold">Pending Requests</span>
                <h3 className="fw-extrabold mt-1 text-warning">{pendingRequestsCount}</h3>
              </div>
              <div className="bg-warning bg-opacity-20 rounded-3 p-3 text-warning">
                <CalendarRange size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-panel p-4" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small text-uppercase fw-semibold">Total Revenue</span>
                <h3 className="fw-extrabold mt-1 text-success">${totalEarnings}</h3>
              </div>
              <div className="bg-success bg-opacity-20 rounded-3 p-3 text-success">
                <DollarSign size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Form panel */}
      {showAddForm && (
        <div className="glass-panel p-4 p-md-5 mb-5">
          <h3 className="fw-bold mb-4 glowing-text d-flex align-items-center gap-2">
            <Plus size={22} className="text-primary" />
            {editPropertyId ? 'Modify Rental Property' : 'List New Rental Property'}
          </h3>

          {formError && (
            <div className="alert bg-danger bg-opacity-15 border border-danger border-opacity-30 text-danger rounded-3 p-3 small mb-4">
              <ShieldAlert size={16} className="me-2 d-inline-block" /> {formError}
            </div>
          )}

          {formSuccess && (
            <div className="alert bg-success bg-opacity-15 border border-success border-opacity-30 text-success rounded-3 p-3 small mb-4">
              <Sparkles size={16} className="me-2 d-inline-block" /> {formSuccess}
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div className="row g-3">
              {/* Title */}
              <div className="col-md-6">
                <label className="form-label text-muted small fw-semibold">Property Title *</label>
                <input
                  type="text"
                  className="form-control form-glass"
                  placeholder="e.g. Modern Studio near Golden Gate Park"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Monthly Price */}
              <div className="col-md-3">
                <label className="form-label text-muted small fw-semibold">Monthly Rent ($/mo) *</label>
                <input
                  type="number"
                  className="form-control form-glass"
                  placeholder="2400"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              {/* Property Type */}
              <div className="col-md-3">
                <label className="form-label text-muted small fw-semibold">Property Type *</label>
                <select
                  className="form-select form-glass"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                  <option value="room">Private Room</option>
                </select>
              </div>

              {/* Location */}
              <div className="col-md-6">
                <label className="form-label text-muted small fw-semibold">City, State / Full Address *</label>
                <input
                  type="text"
                  className="form-control form-glass"
                  placeholder="e.g. San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              {/* Bed, Bath, Size */}
              <div className="col-md-2 col-4">
                <label className="form-label text-muted small fw-semibold">Bedrooms *</label>
                <select
                  className="form-select form-glass"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  required
                >
                  <option value="0">Studio / 0</option>
                  <option value="1">1 Bed</option>
                  <option value="2">2 Beds</option>
                  <option value="3">3 Beds</option>
                  <option value="4">4+ Beds</option>
                </select>
              </div>
              <div className="col-md-2 col-4">
                <label className="form-label text-muted small fw-semibold">Bathrooms *</label>
                <select
                  className="form-select form-glass"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  required
                >
                  <option value="1">1 Bath</option>
                  <option value="1.5">1.5 Baths</option>
                  <option value="2">2 Baths</option>
                  <option value="3">3+ Baths</option>
                </select>
              </div>
              <div className="col-md-2 col-4">
                <label className="form-label text-muted small fw-semibold">Size (sqft) *</label>
                <input
                  type="number"
                  className="form-control form-glass"
                  placeholder="850"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  required
                />
              </div>

              {/* Images */}
              <div className="col-12">
                <label className="form-label text-muted small fw-semibold">Property Image URLs (comma-separated for multiple)</label>
                <textarea
                  className="form-control form-glass"
                  placeholder="e.g. https://images.unsplash.com/photo-1570129477492-45c003edd2be"
                  value={imageUrls}
                  onChange={(e) => setImageUrls(e.target.value)}
                  rows="2"
                />
                <div className="form-text text-muted small">
                  Leave blank to automatically apply high-quality fallback house images.
                </div>
              </div>

              {/* Description */}
              <div className="col-12">
                <label className="form-label text-muted small fw-semibold">Property Description *</label>
                <textarea
                  className="form-control form-glass"
                  placeholder="Describe your property details, proximity, transit access, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  required
                />
              </div>

              {/* Amenities checklist */}
              <div className="col-12">
                <label className="form-label text-muted small d-block mb-2">Select Amenities Included</label>
                <div className="d-flex flex-wrap gap-3">
                  {amenitiesList.map((amenity) => (
                    <div key={amenity} className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input form-glass cursor-pointer"
                        id={`form-amenity-${amenity}`}
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => handleAmenityCheck(amenity)}
                      />
                      <label className="form-check-label text-muted cursor-pointer" htmlFor={`form-amenity-${amenity}`}>
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-premium-secondary"
                onClick={handleFormReset}
              >
                Reset
              </button>
              <button
                type="submit"
                className="btn btn-premium-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving Property...' : editPropertyId ? 'Update Listing' : 'Publish Listing'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs list */}
      <ul className="nav nav-pills mb-4" id="landlordTab" role="tablist">
        <li className="nav-item">
          <button
            className={`nav-link nav-link-premium ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            My Listings ({properties.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link nav-link-premium ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Booking Applications ({bookings.length})
            {pendingRequestsCount > 0 && (
              <span className="badge bg-warning text-dark ms-2 font-bold">{pendingRequestsCount} new</span>
            )}
          </button>
        </li>
      </ul>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Syncing properties and applications...</p>
        </div>
      ) : activeTab === 'listings' ? (
        /* LISTINGS TAB CONTENT */
        <div>
          {properties.length === 0 ? (
            <div className="glass-panel text-center py-5 px-4 border-dashed">
              <Building2 size={48} className="text-muted mb-3" />
              <h4 className="fw-bold">No Houses Listed Yet</h4>
              <p className="text-muted mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
                Start hosting on HouseHunt! Add your first rental listing and begin accepting applications.
              </p>
              <button
                className="btn btn-premium-primary"
                onClick={() => setShowAddForm(true)}
              >
                Create First Listing
              </button>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 g-4">
              {properties.map((prop) => (
                <div key={prop._id} className="col">
                  <div className="glass-panel p-3 h-100 position-relative d-flex flex-column">
                    <div className="d-flex gap-3 align-items-center mb-3">
                      <img
                        src={prop.images?.[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=200&auto=format&fit=crop&q=80'}
                        className="rounded-3 object-fit-cover"
                        style={{ width: '80px', height: '80px' }}
                        alt={prop.title}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=200&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="overflow-hidden">
                        <h5 className="fw-bold text-white text-truncate mb-1">{prop.title}</h5>
                        <p className="text-muted small text-truncate mb-0">{prop.location}</p>
                        <div className="d-flex gap-2 align-items-center mt-1">
                          <span className="text-primary fw-extrabold text-sm">${prop.price}</span>
                          <span className="text-muted small">/mo</span>
                          <span className={`badge ${prop.availability ? 'bg-success bg-opacity-20 text-success border border-success border-opacity-20' : 'bg-danger bg-opacity-20 text-danger border border-danger border-opacity-20'}`} style={{ fontSize: '0.7rem' }}>
                            {prop.availability ? 'Available' : 'Rented'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons footer */}
                    <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top" style={{ borderColor: 'var(--border-color) !important' }}>
                      <Link to={`/properties/${prop._id}`} className="btn btn-premium-secondary btn-sm d-flex align-items-center gap-1 text-decoration-none">
                        View Page <ArrowUpRight size={13} />
                      </Link>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center p-2 rounded-3"
                          onClick={() => handleEditClick(prop)}
                          title="Edit listing details"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center p-2 rounded-3"
                          onClick={() => handleDeleteListing(prop._id)}
                          title="Remove listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* BOOKINGS TAB CONTENT */
        <div>
          {bookings.length === 0 ? (
            <div className="glass-panel text-center py-5 px-4 border-dashed">
              <CalendarRange size={48} className="text-muted mb-3" />
              <h4 className="fw-bold">No Booking Applications</h4>
              <p className="text-muted mb-0">
                Any applications submitted by tenants for your properties will be logged here for moderation.
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {bookings.map((booking) => (
                <div key={booking._id} className="glass-panel p-4">
                  <div className="row g-4 align-items-center">
                    {/* Property description column */}
                    <div className="col-md-4">
                      <h6 className="text-muted small text-uppercase mb-1">Target Property</h6>
                      <h5 className="fw-bold text-white text-truncate mb-1">
                        {booking.property?.title || 'Deleted Listing'}
                      </h5>
                      <span className="badge bg-primary bg-opacity-20 text-white small text-capitalize">
                        {booking.property?.type || 'house'}
                      </span>
                    </div>

                    {/* Tenant Details */}
                    <div className="col-md-3">
                      <h6 className="text-muted small text-uppercase mb-1">Applicant</h6>
                      {booking.tenant ? (
                        <div>
                          <div className="fw-bold text-white small">{booking.tenant.name}</div>
                          <div className="text-muted small">{booking.tenant.email}</div>
                          <div className="text-muted small">{booking.tenant.phone || 'No phone'}</div>
                        </div>
                      ) : (
                        <div className="text-muted small">Anonymous tenant</div>
                      )}
                    </div>

                    {/* Schedule Dates */}
                    <div className="col-md-2">
                      <h6 className="text-muted small text-uppercase mb-1">Dates Requested</h6>
                      <div className="text-white small fw-bold">
                        {formatDate(booking.startDate)}
                      </div>
                      <div className="text-muted small">to</div>
                      <div className="text-white small fw-bold">
                        {formatDate(booking.endDate)}
                      </div>
                    </div>

                    {/* Contract price & Status/Action buttons */}
                    <div className="col-md-3 text-md-end">
                      <div className="mb-2">
                        <span className="text-muted small me-2">Offer:</span>
                        <span className="fs-5 fw-extrabold text-primary">${booking.totalPrice}</span>
                      </div>

                      {booking.status === 'pending' ? (
                        <div className="d-flex gap-2 justify-content-md-end">
                          <button
                            className="btn btn-success btn-sm d-inline-flex align-items-center gap-1 py-2 px-3 fw-bold rounded-3"
                            onClick={() => handleBookingAction(booking._id, 'approved')}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            className="btn btn-premium-danger btn-sm d-inline-flex align-items-center gap-1 py-2 px-3 fw-bold rounded-3"
                            onClick={() => handleBookingAction(booking._id, 'rejected')}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : booking.status === 'approved' ? (
                        <div className="text-success small fw-bold d-inline-flex align-items-center gap-1">
                          <Check size={16} /> Approved Application
                        </div>
                      ) : (
                        <div className="text-danger small fw-bold d-inline-flex align-items-center gap-1">
                          <XCircle size={16} /> Rejected Application
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LandlordDashboard;
