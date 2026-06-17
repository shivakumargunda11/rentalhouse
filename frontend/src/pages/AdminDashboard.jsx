import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Users, Building, FileSpreadsheet, DollarSign, Settings, Trash2, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  // Tabs layout
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'users', 'properties'
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsResponse = await axios.get('/api/admin/stats');
      setStats(statsResponse.data);

      // 2. Fetch Users
      const usersResponse = await axios.get('/api/admin/users');
      setUsersList(usersResponse.data);

      // 3. Fetch Properties
      const propertiesResponse = await axios.get('/api/admin/properties');
      setPropertiesList(propertiesResponse.data);
    } catch (error) {
      console.error('Error fetching admin details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsersList(
        usersList.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      // Re-fetch stats to reflect role change counts
      const statsResponse = await axios.get('/api/admin/stats');
      setStats(statsResponse.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating user role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? ALL listings and bookings owned by this user will also be removed.')) {
      return;
    }
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      setUsersList(usersList.filter((u) => u._id !== userId));
      // Re-evaluate listings state
      const propertiesResponse = await axios.get('/api/admin/properties');
      setPropertiesList(propertiesResponse.data);
      // Re-evaluate stats
      const statsResponse = await axios.get('/api/admin/stats');
      setStats(statsResponse.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Error removing user account.');
    }
  };

  const handleToggleApproval = async (propertyId, currentApprovalStatus) => {
    const nextStatus = !currentApprovalStatus;
    try {
      await axios.put(`/api/admin/properties/${propertyId}/approve`, {
        isApproved: nextStatus,
      });
      setPropertiesList(
        propertiesList.map((p) =>
          p._id === propertyId ? { ...p, isApproved: nextStatus } : p
        )
      );
    } catch (error) {
      alert(error.response?.data?.message || 'Error toggling property approval.');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property listing from the platform?')) {
      return;
    }
    try {
      await axios.delete(`/api/properties/${propertyId}`);
      setPropertiesList(propertiesList.filter((p) => p._id !== propertyId));
      // Re-evaluate stats
      const statsResponse = await axios.get('/api/admin/stats');
      setStats(statsResponse.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting property listing.');
    }
  };

  return (
    <div className="container py-5 text-white">
      {/* Welcome header */}
      <div className="glass-panel p-4 mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-warning bg-gradient rounded-circle p-3 text-dark">
            <ShieldCheck size={30} />
          </div>
          <div>
            <span className="badge bg-warning text-dark text-uppercase mb-1">
              Admin Platform Controller
            </span>
            <h2 className="fw-extrabold glowing-text mb-0">System Operations, {user?.name}</h2>
            <p className="text-muted small mb-0">Moderation of rental listings, user account access control, and revenue analytics.</p>
          </div>
        </div>
      </div>

      {/* Tabs selectors */}
      <ul className="nav nav-pills mb-4" id="adminTab">
        <li className="nav-item">
          <button
            className={`nav-link nav-link-premium ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <DollarSign size={16} className="me-2" />
            Platform Statistics
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link nav-link-premium ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} className="me-2" />
            User Directory ({usersList.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link nav-link-premium ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            <Building size={16} className="me-2" />
            Listing Moderation ({propertiesList.length})
          </button>
        </li>
      </ul>

      {/* Content Render */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Synthesizing admin configurations...</p>
        </div>
      ) : activeTab === 'stats' && stats ? (
        /* STATS TAB */
        <div>
          {/* Top row cards */}
          <div className="row g-4 mb-5">
            <div className="col-sm-6 col-md-3">
              <div className="glass-panel p-4 mini-stat-card">
                <span className="text-muted small text-uppercase">Total Users</span>
                <h3 className="fw-bold mt-1 text-white">{stats.users.total}</h3>
                <div className="text-muted small mt-2">
                  {stats.users.tenants} Tenants / {stats.users.landlords} Hosts
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-md-3">
              <div className="glass-panel p-4 mini-stat-card-accent">
                <span className="text-muted small text-uppercase">Active Listings</span>
                <h3 className="fw-bold mt-1 text-warning">{stats.properties.total}</h3>
                <div className="text-muted small mt-2">Verified homes listed</div>
              </div>
            </div>
            <div className="col-sm-6 col-md-3">
              <div className="glass-panel p-4" style={{ borderLeft: '4px solid #10b981' }}>
                <span className="text-muted small text-uppercase">Bookings Requested</span>
                <h3 className="fw-bold mt-1 text-success">{stats.bookings.total}</h3>
                <div className="text-muted small mt-2">
                  {stats.bookings.pending} Pending / {stats.bookings.approved} Approved
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-md-3">
              <div className="glass-panel p-4" style={{ borderLeft: '4px solid #ec4899' }}>
                <span className="text-muted small text-uppercase">Estimated Revenue</span>
                <h3 className="fw-bold mt-1" style={{ color: '#ec4899' }}>₹{stats.totalRevenue.toLocaleString('en-IN')}</h3>
                <div className="text-muted small mt-2">Calculated from rentals</div>
              </div>
            </div>
          </div>

          {/* Graphical Representation / Summaries */}
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="glass-panel p-4">
                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <Users size={18} className="text-primary" /> User Profiles Breakdown
                </h5>
                <ul className="list-group list-group-flush bg-transparent">
                  <li className="list-group-item bg-transparent text-white d-flex justify-content-between align-items-center px-0 border-opacity-10" style={{ borderColor: 'var(--border-color)' }}>
                    <span>Tenants</span>
                    <span className="badge bg-primary rounded-pill px-3 py-2">{stats.users.tenants} ({Math.round((stats.users.tenants / stats.users.total) * 100) || 0}%)</span>
                  </li>
                  <li className="list-group-item bg-transparent text-white d-flex justify-content-between align-items-center px-0 border-opacity-10" style={{ borderColor: 'var(--border-color)' }}>
                    <span>Landlords / Hosts</span>
                    <span className="badge bg-success rounded-pill px-3 py-2">{stats.users.landlords} ({Math.round((stats.users.landlords / stats.users.total) * 100) || 0}%)</span>
                  </li>
                  <li className="list-group-item bg-transparent text-white d-flex justify-content-between align-items-center px-0 border-opacity-10" style={{ borderColor: 'var(--border-color)' }}>
                    <span>Administrators</span>
                    <span className="badge bg-warning text-dark rounded-pill px-3 py-2">{stats.users.admins} ({Math.round((stats.users.admins / stats.users.total) * 100) || 0}%)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="glass-panel p-4">
                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <FileSpreadsheet size={18} className="text-primary" /> Application Metrics
                </h5>
                <ul className="list-group list-group-flush bg-transparent">
                  <li className="list-group-item bg-transparent text-white d-flex justify-content-between align-items-center px-0 border-opacity-10" style={{ borderColor: 'var(--border-color)' }}>
                    <span>Pending Applications</span>
                    <span className="badge bg-primary bg-opacity-25 border border-primary border-opacity-35 text-white rounded-pill px-3 py-2">{stats.bookings.pending}</span>
                  </li>
                  <li className="list-group-item bg-transparent text-white d-flex justify-content-between align-items-center px-0 border-opacity-10" style={{ borderColor: 'var(--border-color)' }}>
                    <span>Approved Applications</span>
                    <span className="badge bg-success bg-opacity-25 border border-success border-opacity-35 text-success rounded-pill px-3 py-2">{stats.bookings.approved}</span>
                  </li>
                  <li className="list-group-item bg-transparent text-white d-flex justify-content-between align-items-center px-0 border-opacity-10" style={{ borderColor: 'var(--border-color)' }}>
                    <span>Rejected Applications</span>
                    <span className="badge bg-danger bg-opacity-25 border border-danger border-opacity-35 text-danger rounded-pill px-3 py-2">{stats.bookings.rejected}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        /* USERS DIRECTORY */
        <div className="glass-panel p-4 overflow-auto">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th className="border-0 bg-transparent px-3">Name</th>
                <th className="border-0 bg-transparent">Email</th>
                <th className="border-0 bg-transparent">User Role</th>
                <th className="border-0 bg-transparent text-end px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((usr) => (
                <tr key={usr._id} className="border-opacity-10" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="px-3">
                    <div className="fw-bold text-white">{usr.name}</div>
                    <div className="text-muted small">ID: {usr._id}</div>
                  </td>
                  <td>{usr.email}</td>
                  <td>
                    <select
                      className="form-select form-glass form-select-sm d-inline-block w-auto"
                      value={usr.role}
                      disabled={updatingId === usr._id}
                      onChange={(e) => handleRoleChange(usr._id, e.target.value)}
                    >
                      <option value="tenant">Tenant</option>
                      <option value="landlord">Landlord</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="text-end px-3">
                    <button
                      className="btn btn-outline-danger btn-sm p-2 rounded-3"
                      onClick={() => handleDeleteUser(usr._id)}
                      disabled={usr._id === user._id}
                      title={usr._id === user._id ? "Cannot delete yourself" : "Delete user profile"}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* LISTINGS MODERATION */
        <div className="glass-panel p-4 overflow-auto">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th className="border-0 bg-transparent px-3">Property Details</th>
                <th className="border-0 bg-transparent">Owner / Host</th>
                <th className="border-0 bg-transparent">Moderation Status</th>
                <th className="border-0 bg-transparent text-end px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {propertiesList.map((prop) => (
                <tr key={prop._id} className="border-opacity-10" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="px-3">
                    <div className="d-flex gap-2 align-items-center">
                      <div className="fw-bold text-white text-truncate" style={{ maxWidth: '240px' }}>
                        {prop.title}
                      </div>
                      <Link to={`/properties/${prop._id}`} className="text-muted" title="View Property Page">
                        <Eye size={14} />
                      </Link>
                    </div>
                    <div className="text-muted small">{prop.location} • ₹{prop.price.toLocaleString('en-IN')}/mo</div>
                  </td>
                  <td>
                    {prop.owner ? (
                      <div>
                        <div className="small fw-semibold">{prop.owner.name}</div>
                        <div className="text-muted small">{prop.owner.email}</div>
                      </div>
                    ) : (
                      <span className="text-danger small">Unresolved Landlord</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleApproval(prop._id, prop.isApproved)}
                      className={`btn btn-sm d-inline-flex align-items-center gap-1 ${
                        prop.isApproved
                          ? 'btn-success bg-opacity-20 text-success border border-success border-opacity-30'
                          : 'btn-danger bg-opacity-20 text-danger border border-danger border-opacity-30'
                      }`}
                    >
                      {prop.isApproved ? (
                        <><CheckCircle size={14} /> Approved</>
                      ) : (
                        <><XCircle size={14} /> Suspended</>
                      )}
                    </button>
                  </td>
                  <td className="text-end px-3">
                    <button
                      className="btn btn-outline-danger btn-sm p-2 rounded-3"
                      onClick={() => handleDeleteProperty(prop._id)}
                      title="Permanently remove listing"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
