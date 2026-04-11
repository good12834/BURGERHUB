import React, { useState, useEffect, useRef } from 'react';
import {
  MdLocalShipping,
  MdPerson,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdAccessTime,
  MdStar,
  MdTrendingUp,
  MdDirectionsBike,
  MdDirectionsCar,
  MdTwoWheeler,
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdRefresh,
  MdFilterList,
  MdCheckCircle,
  MdCancel,
  MdPause,
  MdPlayArrow,
  MdAssignment,
  MdTimeline,
  MdBarChart,
  MdNotifications,
  MdSettings,
  MdClose,
  MdSave,
  MdCancel as MdCancelIcon
} from 'react-icons/md';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Status configuration
const STATUS_CFG = {
  available: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', label: 'Available', icon: <MdCheckCircle /> },
  delivering: { color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)', label: 'Delivering', icon: <MdLocalShipping /> },
  offline: { color: '#78716C', bg: 'rgba(120,113,108,0.1)', border: 'rgba(120,113,108,0.25)', label: 'Offline', icon: <MdCancel /> },
  on_break: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', label: 'On Break', icon: <MdPause /> }
};

// Vehicle type configuration
const VEHICLE_CFG = {
  bike: { icon: <MdDirectionsBike />, label: 'Bike' },
  scooter: { icon: <MdTwoWheeler />, label: 'Scooter' },
  car: { icon: <MdDirectionsCar />, label: 'Car' }
};

// Avatar component
const Avatar = ({ initials, size = 32, status }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: 'linear-gradient(135deg,rgba(245,158,11,0.3),rgba(245,158,11,0.1))',
    border: '1px solid rgba(245,158,11,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800, fontSize: size * 0.38,
    color: '#F59E0B', flexShrink: 0,
    letterSpacing: '0.04em',
    position: 'relative'
  }}>
    {initials}
    {status && (
      <div style={{
        position: 'absolute', bottom: -2, right: -2,
        width: 12, height: 12, borderRadius: '50%',
        background: STATUS_CFG[status]?.color || '#78716C',
        border: '2px solid #131110'
      }} />
    )}
  </div>
);

// Status badge component
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.offline;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap'
    }}>
      <span style={{ fontSize: 10 }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
};

// Stat card component
const StatCard = ({ icon, label, value, color, trend }) => (
  <div style={{
    background: '#131110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 22px',
    display: 'flex', flexDirection: 'column', gap: 12
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, color: color
      }}>{icon}</div>
      {trend !== undefined && (
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11,
          letterSpacing: '0.08em', color: trend >= 0 ? '#22C55E' : '#EF4444',
          background: trend >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${trend >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
          padding: '2px 8px', borderRadius: 999
        }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12,
        letterSpacing: '0.15em', color: '#44403C', textTransform: 'uppercase', marginBottom: 4
      }}>{label}</div>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#F5F5F4',
        letterSpacing: '0.03em', lineHeight: 1
      }}>{value}</div>
    </div>
  </div>
);

// Driver drawer component
const DriverDrawer = ({ driver, onClose, onEdit, onDelete, onStatusChange }) => {
  if (!driver) return null;

  const user = driver.user || {};

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease'
      }} />
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 201,
        width: 480, background: '#131110',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        overflowY: 'auto', animation: 'slideInRight 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          background: '#131110', position: 'sticky', top: 0, zIndex: 1
        }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Avatar initials={user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'D'} size={52} status={driver.status} />
            <div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: 10, letterSpacing: '0.25em', color: '#F59E0B',
                textTransform: 'uppercase'
              }}>Driver Profile</div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#F5F5F4',
                letterSpacing: '0.04em', marginTop: -2
              }}>{user.name}</div>
              <StatusBadge status={driver.status} />
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', border: 'none',
            color: '#78716C', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}><MdClose /></button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
          {/* Performance metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '14px', textAlign: 'center'
            }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
                color: '#44403C', letterSpacing: '0.15em', textTransform: 'uppercase'
              }}>Total Deliveries</div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#F5F5F4', marginTop: 2
              }}>{driver.total_deliveries}</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '14px', textAlign: 'center'
            }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
                color: '#44403C', letterSpacing: '0.15em', textTransform: 'uppercase'
              }}>Rating</div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#F59E0B', marginTop: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
              }}>
                <MdStar style={{ fontSize: 24 }} />
                {parseFloat(driver.rating).toFixed(1)}
              </div>
            </div>
          </div>

          {/* Contact details */}
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: 10, letterSpacing: '0.22em', color: '#3D3632',
              textTransform: 'uppercase', marginBottom: 12
            }}>Contact Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MdEmail style={{ fontSize: 18, width: 20, textAlign: 'center', color: '#F59E0B' }} />
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: '#A8A29E' }}>{user.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MdPhone style={{ fontSize: 18, width: 20, textAlign: 'center', color: '#F59E0B' }} />
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: '#A8A29E' }}>{user.phone || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {VEHICLE_CFG[driver.vehicle_type]?.icon || <MdTwoWheeler style={{ fontSize: 18, width: 20, textAlign: 'center', color: '#F59E0B' }} />}
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: '#A8A29E' }}>
                  {VEHICLE_CFG[driver.vehicle_type]?.label || driver.vehicle_type}
                  {driver.license_number && ` • ${driver.license_number}`}
                </span>
              </div>
            </div>
          </div>

          {/* Performance metrics */}
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: 10, letterSpacing: '0.22em', color: '#3D3632',
              textTransform: 'uppercase', marginBottom: 12
            }}>Performance Metrics</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: '#A8A29E' }}>Avg. Delivery Time</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: '#F5F5F4' }}>
                  {driver.average_delivery_time} min
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: '#A8A29E' }}>On-Time Rate</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: '#22C55E' }}>
                  {parseFloat(driver.on_time_delivery_rate).toFixed(1)}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: '#A8A29E' }}>Total Distance</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: '#F5F5F4' }}>
                  {parseFloat(driver.total_distance).toFixed(1)} km
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: '#A8A29E' }}>Current Orders</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: '#60A5FA' }}>
                  {driver.current_orders_count}
                </span>
              </div>
            </div>
          </div>

          {/* Recent orders */}
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: 10, letterSpacing: '0.22em', color: '#3D3632',
              textTransform: 'uppercase', marginBottom: 12
            }}>Recent Orders</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(driver.orders || []).slice(0, 5).map((order, i) => (
                <div key={order.id || i} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '12px',
                  background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 10
                }}>
                  <div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                      fontSize: 12, color: '#F5F5F4'
                    }}>#{order.order_number || `BH-${order.id}`}</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 10, color: '#44403C' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#F5F5F4'
                    }}>${parseFloat(order.total_amount || 0).toFixed(2)}</div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                      fontSize: 9, color: '#22C55E', textTransform: 'uppercase'
                    }}>{order.status}</div>
                  </div>
                </div>
              ))}
              {(!driver.orders || driver.orders.length === 0) && (
                <div style={{ textAlign: 'center', padding: 20, color: '#78716C', fontSize: 13 }}>
                  No recent orders
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', gap: 12
        }}>
          <button onClick={() => onEdit(driver)} style={{
            flex: 1, padding: '12px',
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 10, color: '#F59E0B',
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
            fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}>
            <MdEdit /> Edit
          </button>
          <button onClick={() => onDelete(driver.id)} style={{
            flex: 1, padding: '12px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10, color: '#EF4444',
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
            fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}>
            <MdDelete /> Delete
          </button>
        </div>
      </div>
    </>
  );
};

// Main Drivers component
export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [stats, setStats] = useState({
    totalDrivers: 0,
    activeDrivers: 0,
    availableDrivers: 0,
    deliveringDrivers: 0,
    offlineDrivers: 0,
    avgDeliveryTime: 0,
    avgRating: 0,
    avgOnTimeRate: 0,
    totalDeliveries: 0
  });

  // Form state for add/edit
  const [formData, setFormData] = useState({
    user_id: '',
    vehicle_type: 'scooter',
    license_number: '',
    notes: ''
  });

  // Fetch drivers
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/admin/drivers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDrivers(response.data.data.drivers);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Failed to load drivers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/admin/drivers/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching driver stats:', err);
    }
  };

  useEffect(() => {
    fetchDrivers();
    fetchStats();
  }, []);

  // Filter drivers
  const filteredDrivers = drivers.filter(driver => {
    const user = driver.user || {};
    const matchesSearch = !search ||
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingDriver) {
        await axios.put(`${API_BASE}/api/admin/drivers/${editingDriver.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await axios.post(`${API_BASE}/api/admin/drivers`, formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      setShowAddModal(false);
      setEditingDriver(null);
      setFormData({ user_id: '', vehicle_type: 'scooter', license_number: '', notes: '' });
      fetchDrivers();
      fetchStats();
    } catch (err) {
      console.error('Error saving driver:', err);
      alert(err.response?.data?.message || 'Failed to save driver');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/admin/drivers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSelectedDriver(null);
      fetchDrivers();
      fetchStats();
    } catch (err) {
      console.error('Error deleting driver:', err);
      alert('Failed to delete driver');
    }
  };

  // Handle edit
  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      user_id: driver.user_id,
      vehicle_type: driver.vehicle_type,
      license_number: driver.license_number || '',
      notes: driver.notes || ''
    });
    setShowAddModal(true);
  };

  // Handle status change
  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/api/admin/drivers/${id}`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchDrivers();
      fetchStats();
    } catch (err) {
      console.error('Error updating driver status:', err);
      alert('Failed to update driver status');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.35s ease' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg,#1C0E00 0%,#0C0A09 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 40px 0'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <div>
              <h1 style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '42px',
                letterSpacing: '0.03em', color: '#F5F5F4'
              }}>Driver Management</h1>
              <p style={{ fontFamily: "'Barlow', sans-serif", color: '#44403C', letterSpacing: '0.02em', marginTop: 4 }}>
                Track and manage your delivery fleet in real-time.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { fetchDrivers(); fetchStats(); }} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                color: '#78716C', padding: '9px 16px', borderRadius: 10,
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
              }}>
                <MdRefresh /> Refresh
              </button>
              <button onClick={() => setShowAddModal(true)} style={{
                background: 'linear-gradient(135deg,#F59E0B,#D97706)',
                border: 'none', color: '#1C1917', padding: '9px 16px', borderRadius: 10,
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}>
                <MdAdd /> Add Driver
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatCard icon={<MdLocalShipping />} label="Total Drivers" value={stats.totalDrivers} color="#60A5FA" />
            <StatCard icon={<MdCheckCircle />} label="Available" value={stats.availableDrivers} color="#22C55E" />
            <StatCard icon={<MdLocalShipping />} label="Delivering" value={stats.deliveringDrivers} color="#60A5FA" />
            <StatCard icon={<MdStar />} label="Avg. Rating" value={stats.avgRating.toFixed(1)} color="#F59E0B" />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', paddingBottom: 16 }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 15, opacity: 0.4
              }}><MdSearch /></span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                style={{
                  width: '100%', padding: '10px 12px 10px 38px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 10, color: '#F5F5F4', fontFamily: "'Barlow', sans-serif",
                  fontSize: 13, outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'available', 'delivering', 'offline', 'on_break'].map(status => (
                <button key={status} onClick={() => setStatusFilter(status)} style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
                  border: '1px solid',
                  background: statusFilter === status ? 'rgba(245,158,11,0.12)' : 'transparent',
                  borderColor: statusFilter === status ? '#F59E0B' : 'rgba(255,255,255,0.09)',
                  color: statusFilter === status ? '#F59E0B' : '#57534E',
                  transition: 'all 0.2s'
                }}>
                  {status === 'all' ? 'All' : STATUS_CFG[status]?.label || status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 40px 60px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#78716C' }}>Loading drivers...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#EF4444' }}>{error}</div>
        ) : (
          <div style={{
            background: '#0F0D0B', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, overflow: 'hidden'
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 180px 100px 110px 110px 100px 80px',
              padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.02)', gap: 12, alignItems: 'center'
            }}>
              {['Driver', 'Contact', 'Vehicle', 'Deliveries', 'Rating', 'Status', 'Actions'].map(h => (
                <span key={h} style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#3D3632'
                }}>{h}</span>
              ))}
            </div>

            {/* Table body */}
            {filteredDrivers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#78716C' }}>
                No drivers found
              </div>
            ) : (
              filteredDrivers.map((driver, i) => {
                const user = driver.user || {};
                const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'D';

                return (
                  <div key={driver.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 180px 100px 110px 110px 100px 80px',
                    padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    alignItems: 'center', gap: 12, transition: 'background 0.2s', cursor: 'pointer'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setSelectedDriver(driver)}
                  >
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <Avatar initials={initials} size={36} status={driver.status} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                          fontSize: 14, color: '#F5F5F4', letterSpacing: '0.03em'
                        }}>{user.name}</div>
                        <div style={{ fontSize: 11, color: '#3D3632' }}>
                          Joined {new Date(driver.created_at).getFullYear()}
                        </div>
                      </div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: '#A8A29E', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                      <div style={{ fontSize: 11, color: '#3D3632' }}>{user.phone || 'N/A'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {VEHICLE_CFG[driver.vehicle_type]?.icon || <MdTwoWheeler />}
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: '#A8A29E' }}>
                        {VEHICLE_CFG[driver.vehicle_type]?.label || driver.vehicle_type}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#A8A29E' }}>
                      {driver.total_deliveries}
                    </div>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#F59E0B',
                      display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <MdStar style={{ fontSize: 16 }} />
                      {parseFloat(driver.rating).toFixed(1)}
                    </div>
                    <StatusBadge status={driver.status} />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedDriver(driver); }} style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                        cursor: 'pointer', color: '#44403C',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}><MdVisibility /></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Driver drawer */}
      {selectedDriver && (
        <DriverDrawer
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Add/Edit modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }} onClick={() => { setShowAddModal(false); setEditingDriver(null); }}>
          <div style={{
            background: '#1C1917', borderRadius: 16, padding: 32,
            maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 32,
              margin: '0 0 24px 0', textAlign: 'center'
            }}>{editingDriver ? 'EDIT DRIVER' : 'ADD DRIVER'}</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!editingDriver && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                    fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#44403C'
                  }}>User ID</label>
                  <input type="number" value={formData.user_id} onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                    placeholder="Enter user ID" required
                    style={{
                      width: '100%', padding: '10px 12px',
                      background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.1)',
                      borderRadius: 9, color: '#F5F5F4', fontFamily: "'Barlow', sans-serif",
                      fontSize: 13, outline: 'none'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#44403C'
                }}>Vehicle Type</label>
                <select value={formData.vehicle_type} onChange={e => setFormData({ ...formData, vehicle_type: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px',
                    background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: 9, color: '#F5F5F4', fontFamily: "'Barlow', sans-serif",
                    fontSize: 13, outline: 'none'
                  }}
                >
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="car">Car</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#44403C'
                }}>License Number</label>
                <input type="text" value={formData.license_number} onChange={e => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="Enter license number"
                  style={{
                    width: '100%', padding: '10px 12px',
                    background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: 9, color: '#F5F5F4', fontFamily: "'Barlow', sans-serif",
                    fontSize: 13, outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#44403C'
                }}>Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..." rows={3}
                  style={{
                    width: '100%', padding: '10px 12px',
                    background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: 9, color: '#F5F5F4', fontFamily: "'Barlow', sans-serif",
                    fontSize: 13, outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => { setShowAddModal(false); setEditingDriver(null); }} style={{
                  flex: 1, background: 'rgba(255,255,255,0.1)', color: '#F5F5F4',
                  border: 'none', padding: '14px', borderRadius: 8, fontWeight: 600, cursor: 'pointer'
                }}>Cancel</button>
                <button type="submit" style={{
                  flex: 1, background: '#F59E0B', color: '#000',
                  border: 'none', padding: '14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer'
                }}>{editingDriver ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
