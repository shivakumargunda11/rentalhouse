import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import { Search, Filter, RefreshCw, Sparkles, Building, Landmark, Compass, Award } from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const { user } = useContext(AuthContext);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('any');
  const [bathrooms, setBathrooms] = useState('any');
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Data State
  const [properties, setProperties] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Available amenities for checklist
  const amenitiesList = ['Wifi', 'AC', 'Parking', 'Kitchen', 'Gym', 'Laundry', 'Furnished', 'Pet Friendly'];

  // Fetch properties and wishlist
  const fetchProperties = async (searchParams = {}) => {
    setLoading(true);
    try {
      // Build query string
      const query = new URLSearchParams();
      if (searchParams.search) query.append('search', searchParams.search);
      if (searchParams.city) query.append('city', searchParams.city);
      if (searchParams.type && searchParams.type !== 'all') query.append('type', searchParams.type);
      if (searchParams.minPrice) query.append('minPrice', searchParams.minPrice);
      if (searchParams.maxPrice) query.append('maxPrice', searchParams.maxPrice);
      if (searchParams.bedrooms && searchParams.bedrooms !== 'any') query.append('bedrooms', searchParams.bedrooms);
      if (searchParams.bathrooms && searchParams.bathrooms !== 'any') query.append('bathrooms', searchParams.bathrooms);
      if (searchParams.amenities && searchParams.amenities.length > 0) {
        query.append('amenities', searchParams.amenities.join(','));
      }

      const response = await axios.get(`/api/properties?${query.toString()}`);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const fetchWishlist = async () => {
    if (user && user.role === 'tenant') {
      try {
        const response = await axios.get('/api/wishlist');
        setWishlistIds(response.data.map((item) => item._id));
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearching(true);
    fetchProperties({
      search,
      city,
      type,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      amenities: selectedAmenities,
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setCity('');
    setType('all');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('any');
    setBathrooms('any');
    setSelectedAmenities([]);
    fetchProperties();
  };

  const handleAmenityChange = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleWishlistUpdateInHome = (propertyId, isAdded) => {
    if (isAdded) {
      setWishlistIds([...wishlistIds, propertyId]);
    } else {
      setWishlistIds(wishlistIds.filter((id) => id !== propertyId));
    }
  };

  return (
    <div className="pb-5">
      {/* Hero Banner */}
      <div className="position-relative overflow-hidden py-5 mb-5 text-center bg-dark" style={{
        backgroundImage: 'linear-gradient(rgba(9, 10, 17, 0.75), rgba(9, 10, 17, 0.95)), url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=60")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid var(--border-color)',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <span className="badge bg-primary bg-gradient px-3 py-2 rounded-pill text-uppercase mb-3 d-inline-flex align-items-center gap-1">
                <Sparkles size={14} className="text-warning" /> Luxury Living Redefined
              </span>
              <h1 className="display-4 fw-extrabold text-white mb-3 glowing-text">
                Find Your Next Home With <span className="accent-text">HouseHunt</span>
              </h1>
              <p className="lead text-muted mb-4 fs-5" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                Browse verified property listings, schedule instant online bookings, and secure your rental contracts in one modern space.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container">
        {/* Search Panel */}
        <div className="row justify-content-center search-container mb-5">
          <div className="col-lg-10">
            <div className="glass-panel p-4 p-md-5">
              <form onSubmit={handleSearchSubmit}>
                <div className="row g-3 align-items-end">
                  {/* Global Search Term */}
                  <div className="col-md-6 col-lg-4">
                    <label className="form-label text-muted small fw-semibold">Keywords</label>
                    <div className="input-group">
                      <span className="input-group-text form-glass" style={{ borderRight: 'none' }}>
                        <Search size={18} className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control form-glass"
                        style={{ borderLeft: 'none' }}
                        placeholder="Title, description, location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* City Filter */}
                  <div className="col-md-6 col-lg-3">
                    <label className="form-label text-muted small fw-semibold">City</label>
                    <input
                      type="text"
                      className="form-control form-glass"
                      placeholder="e.g. San Francisco"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  {/* Property Type Filter */}
                  <div className="col-md-6 col-lg-3">
                    <label className="form-label text-muted small fw-semibold">Property Type</label>
                    <select
                      className="form-select form-glass"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="house">House</option>
                      <option value="apartment">Apartment</option>
                      <option value="studio">Studio</option>
                      <option value="room">Room</option>
                    </select>
                  </div>

                  {/* Search Button */}
                  <div className="col-md-6 col-lg-2">
                    <button
                      type="submit"
                      className="btn btn-premium-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                      disabled={searching}
                    >
                      {searching ? <RefreshCw className="spinner-border spinner-border-sm border-0" /> : <Search size={18} />}
                      Search
                    </button>
                  </div>
                </div>

                {/* Advanced Accordion Toggle */}
                <div className="accordion mt-3" id="advancedFilterAccordion">
                  <div className="accordion-item bg-transparent border-0">
                    <h2 className="accordion-header" id="headingFilters">
                      <button
                        className="accordion-button bg-transparent text-white collapsed p-0 pt-2 pb-1 d-inline-flex align-items-center gap-2 fw-semibold border-0"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseFilters"
                        aria-expanded="false"
                        aria-controls="collapseFilters"
                        style={{ boxShadow: 'none' }}
                      >
                        <Filter size={15} className="text-primary" />
                        <span>Advanced Filtering Options</span>
                      </button>
                    </h2>
                    <div
                      id="collapseFilters"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingFilters"
                      data-bs-parent="#advancedFilterAccordion"
                    >
                      <div className="accordion-body bg-transparent p-0 pt-4">
                        <div className="row g-3">
                          {/* Price Range */}
                          <div className="col-sm-6 col-md-3">
                            <label className="form-label text-muted small">Min Price ($/mo)</label>
                            <input
                              type="number"
                              className="form-control form-glass"
                              placeholder="Min"
                              value={minPrice}
                              onChange={(e) => setMinPrice(e.target.value)}
                            />
                          </div>
                          <div className="col-sm-6 col-md-3">
                            <label className="form-label text-muted small">Max Price ($/mo)</label>
                            <input
                              type="number"
                              className="form-control form-glass"
                              placeholder="Max"
                              value={maxPrice}
                              onChange={(e) => setMaxPrice(e.target.value)}
                            />
                          </div>

                          {/* Bedrooms */}
                          <div className="col-sm-6 col-md-3">
                            <label className="form-label text-muted small">Bedrooms</label>
                            <select
                              className="form-select form-glass"
                              value={bedrooms}
                              onChange={(e) => setBedrooms(e.target.value)}
                            >
                              <option value="any">Any</option>
                              <option value="1">1 Bed</option>
                              <option value="2">2 Beds</option>
                              <option value="3">3 Beds</option>
                              <option value="4">4+ Beds</option>
                            </select>
                          </div>

                          {/* Bathrooms */}
                          <div className="col-sm-6 col-md-3">
                            <label className="form-label text-muted small">Bathrooms</label>
                            <select
                              className="form-select form-glass"
                              value={bathrooms}
                              onChange={(e) => setBathrooms(e.target.value)}
                            >
                              <option value="any">Any</option>
                              <option value="1">1 Bath</option>
                              <option value="2">2 Baths</option>
                              <option value="3">3+ Baths</option>
                            </select>
                          </div>
                        </div>

                        {/* Amenities checklist */}
                        <div className="mt-4">
                          <label className="form-label text-muted small d-block mb-2">Amenities</label>
                          <div className="d-flex flex-wrap gap-3">
                            {amenitiesList.map((amenity) => (
                              <div key={amenity} className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input form-glass cursor-pointer"
                                  id={`amenity-${amenity}`}
                                  checked={selectedAmenities.includes(amenity)}
                                  onChange={() => handleAmenityChange(amenity)}
                                />
                                <label
                                  className="form-check-label text-muted cursor-pointer select-none"
                                  htmlFor={`amenity-${amenity}`}
                                >
                                  {amenity}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Reset button inside collapse */}
                        <div className="d-flex justify-content-end mt-3">
                          <button
                            type="button"
                            className="btn btn-premium-secondary btn-sm d-flex align-items-center gap-1"
                            onClick={handleResetFilters}
                          >
                            <RefreshCw size={14} /> Reset Filters
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Listings Display */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0 glowing-text">Featured Rental Listings</h2>
            <span className="text-muted small">
              Found {properties.length} {properties.length === 1 ? 'property' : 'properties'}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-3">Curating top homes for you...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="glass-panel text-center py-5 px-4 text-white border-dashed">
              <Building size={48} className="text-muted mb-3" />
              <h4 className="fw-bold">No Properties Found</h4>
              <p className="text-muted mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
                We couldn't find any rentals matching your search criteria. Try modifying your filters or browse all listings.
              </p>
              <button
                className="btn btn-premium-primary"
                onClick={handleResetFilters}
              >
                Clear Search & View All
              </button>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {properties.map((property) => (
                <div key={property._id} className="col">
                  <PropertyCard
                    property={property}
                    isWishlisted={wishlistIds.includes(property._id)}
                    onWishlistUpdate={handleWishlistUpdateInHome}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Value Proposition/Aesthetic Section */}
        <div className="row g-4 mt-5 text-center justify-content-center">
          <div className="col-md-4">
            <div className="glass-panel p-4 h-100">
              <div className="bg-primary bg-gradient rounded-circle p-3 d-inline-flex mb-3">
                <Landmark size={24} className="text-white" />
              </div>
              <h4 className="fw-bold text-white">Verified Properties</h4>
              <p className="text-muted mb-0">Every house listing is audited by administration to verify landlord registry and prevent listing fraud.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-panel p-4 h-100">
              <div className="bg-primary bg-gradient rounded-circle p-3 d-inline-flex mb-3">
                <Compass size={24} className="text-white" />
              </div>
              <h4 className="fw-bold text-white">Role dashboards</h4>
              <p className="text-muted mb-0">Separate, customized systems designed for Tenants, Hosts (Landlords), and System Admins.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-panel p-4 h-100">
              <div className="bg-primary bg-gradient rounded-circle p-3 d-inline-flex mb-3">
                <Award size={24} className="text-white" />
              </div>
              <h4 className="fw-bold text-white">Instant Approvals</h4>
              <p className="text-muted mb-0">Submit rental applications, review prices dynamically, and track your booking status directly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
