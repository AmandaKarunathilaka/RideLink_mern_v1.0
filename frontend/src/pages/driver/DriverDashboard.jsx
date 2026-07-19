import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { getMyRidesApi, cancelRideApi } from '../../api/rideApi.js';
import { cancelBookingApi } from '../../api/bookingApi.js';
import api from '../../api/axiosConfig.js';

const fontHead = { fontFamily: 'Syne, sans-serif' };
const fontBody = { fontFamily: 'DM Sans, sans-serif' };

const statusColors = {
  active: { bg: '#ecfdf5', color: '#166534', border: '#86efac', label: 'Active' },
  cancelled: { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5', label: 'Cancelled' },
  completed: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe', label: 'Completed' },
};

// ── Bookings Modal ──
const BookingsModal = ({ ride, onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bookings/ride/${ride.id}`)
      .then(res => setBookings(res.data.bookings || []))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, [ride.id]);

  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 560, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h3 style={{ ...fontHead, fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
              Bookings for this Ride
            </h3>
            <p style={{ ...fontBody, fontSize: 13, color: '#64748b' }}>
              {ride.origin} → {ride.destination} · {ride.time}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', padding: 0, lineHeight: 1 }}
          >×</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total', value: bookings.length, bg: '#f8faff', color: '#0f172a' },
            { label: 'Confirmed', value: confirmed.length, bg: '#ecfdf5', color: '#166534' },
            { label: 'Cancelled', value: cancelled.length, bg: '#fef2f2', color: '#991b1b' },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ ...fontHead, fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ ...fontBody, fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bookings list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', ...fontBody }}>Loading...</div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎫</div>
            <p style={{ ...fontBody, fontSize: 14, color: '#94a3b8' }}>No bookings yet for this ride.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bookings.map((booking, i) => {
              const p = booking.passengerInfo;
              const sc = statusColors[booking.status] || statusColors.active;
              return (
                <div key={i} style={{ background: '#f8faff', borderRadius: 14, padding: '16px 18px', border: `1px solid ${sc.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, ...fontHead, fontSize: 15, flexShrink: 0 }}>
                        {p?.name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div>
                        <div style={{ ...fontHead, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                          {p?.name || 'Passenger'}
                        </div>
                        <div style={{ ...fontBody, fontSize: 12, color: '#64748b' }}>
                          {p?.email || '—'}
                        </div>
                        {p?.phone && (
                          <a
                            href={`tel:${p.phone}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 12, color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
                          >
                            📞 {p.phone}
                          </a>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ ...fontBody, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, padding: '3px 10px', borderRadius: 999, display: 'inline-block', marginBottom: 6 }}>
                        {sc.label}
                      </span>
                      <div style={{ ...fontBody, fontSize: 12, color: '#64748b' }}>
                        💺 {booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}
                      </div>
                      <div style={{ ...fontHead, fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>
                        LKR {booking.totalPrice?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={onClose}
          style={{ width: '100%', marginTop: 20, padding: '11px', background: '#f1f5f9', border: 'none', borderRadius: 11, color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer', ...fontBody }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

// ── Ride Card ──
const RideCard = ({ ride, onViewBookings, onCancel, cancelling }) => {
  const sc = statusColors[ride.status] || statusColors.active;
  const today = new Date().toISOString().split('T')[0];
  const isPast = ride.date < today;
  const [showConfirm, setShowConfirm] = useState(false);

  const rideDate = new Date(ride.date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <div style={{ background: 'white', border: '1px solid #e8edf5', borderRadius: 18, overflow: 'hidden', opacity: ride.status === 'cancelled' ? 0.7 : 1 }}>
      {/* Top */}
      <div style={{ background: ride.status === 'cancelled' ? '#f8faff' : 'linear-gradient(135deg,#0a0f1e,#0d1b3e)', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ ...fontHead, fontSize: 16, fontWeight: 800, color: ride.status === 'cancelled' ? '#374151' : 'white' }}>
            {ride.origin}
          </span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 9h12M10 5l4 4-4 4" stroke={ride.status === 'cancelled' ? '#94a3b8' : 'rgba(148,176,220,0.6)'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ ...fontHead, fontSize: 16, fontWeight: 800, color: ride.status === 'cancelled' ? '#374151' : 'white' }}>
            {ride.destination}
          </span>
        </div>
        <span style={{ ...fontBody, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, padding: '3px 10px', borderRadius: 999 }}>
          {isPast && ride.status === 'active' ? '🏁 Departed' : sc.label}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, marginBottom: 16 }}>
          {[
            { icon: '📅', label: 'Date', value: rideDate },
            { icon: '🕐', label: 'Time', value: ride.time },
            { icon: '💺', label: 'Seats left', value: `${ride.seatsLeft} / ${ride.totalSeats}` },
            { icon: '💰', label: 'Price', value: `LKR ${ride.price?.toLocaleString()}` },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8faff', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 14, marginBottom: 3 }}>{item.icon}</div>
              <div style={{ ...fontBody, fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>{item.label}</div>
              <div style={{ ...fontBody, fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Seat fill bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ ...fontBody, fontSize: 11, color: '#94a3b8' }}>Seats filled</span>
            <span style={{ ...fontBody, fontSize: 11, color: '#64748b', fontWeight: 500 }}>
              {ride.totalSeats - ride.seatsLeft} / {ride.totalSeats}
            </span>
          </div>
          <div style={{ height: 6, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${((ride.totalSeats - ride.seatsLeft) / ride.totalSeats) * 100}%`,
              background: ride.seatsLeft === 0 ? '#ef4444' : 'linear-gradient(90deg,#2563eb,#10b981)',
              borderRadius: 999,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => onViewBookings(ride)}
            style={{ flex: 1, padding: '9px 14px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 10, color: '#1d4ed8', fontSize: 13, fontWeight: 500, cursor: 'pointer', ...fontBody }}
          >
            👥 View Bookings
          </button>

          {ride.status === 'active' && !isPast && (
            showConfirm ? (
              <>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{ padding: '9px 14px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, color: '#374151', fontSize: 13, cursor: 'pointer', ...fontBody }}
                >
                  Keep
                </button>
                <button
                  onClick={() => { onCancel(ride.id); setShowConfirm(false); }}
                  disabled={cancelling}
                  style={{ padding: '9px 14px', background: '#ef4444', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', ...fontBody, opacity: cancelling ? 0.6 : 1 }}
                >
                  {cancelling ? '...' : 'Yes, Cancel'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                style={{ padding: '9px 14px', background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, color: '#ef4444', fontSize: 13, fontWeight: 500, cursor: 'pointer', ...fontBody }}
              >
                Cancel Ride
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ──
const DriverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getMyRidesApi()
      .then(res => setRides(res.data.rides || []))
      .catch(() => toast.error('Failed to load rides'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancelRide = async (rideId) => {
    setCancellingId(rideId);
    try {
      await cancelRideApi(rideId);
      setRides(prev => prev.map(r => r.id === rideId ? { ...r, status: 'cancelled' } : r));
      toast.success('Ride cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel ride');
    } finally {
      setCancellingId(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const active = rides.filter(r => r.status === 'active' && r.date >= today);
  const past = rides.filter(r => r.status === 'active' && r.date < today);
  const cancelled = rides.filter(r => r.status === 'cancelled');

  const totalSeatsBooked = rides.reduce((sum, r) => sum + (r.totalSeats - r.seatsLeft), 0);

  const filtered = filter === 'all' ? rides
    : filter === 'active' ? active
      : filter === 'past' ? past
        : cancelled;

  const getLicenseStatusStyle = () => {
    if (user?.licenseStatus === 'approved') return { bg: '#ecfdf5', border: '#86efac', color: '#166534', icon: '✅' };
    if (user?.licenseStatus === 'pending') return { bg: '#fefce8', border: '#fde68a', color: '#92400e', icon: '⏳' };
    if (user?.licenseStatus === 'rejected') return { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b', icon: '❌' };
    return { bg: '#f8faff', border: '#bfdbfe', color: '#1e40af', icon: '📋' };
  };

  const ls = getLicenseStatusStyle();

  return (
    <div style={{ ...fontBody, background: '#f1f5f9', minHeight: '100vh', paddingTop: 100, paddingBottom: 64 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ background: 'white', borderRadius: 20, padding: '24px 28px', marginBottom: 20, border: '1px solid #e8edf5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <p style={{ ...fontBody, fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 style={{ ...fontHead, fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>
              Driver Dashboard 🚗
            </h1>
            <p style={{ ...fontBody, fontSize: 14, color: '#64748b' }}>Welcome back, {user?.name?.split(' ')[0]}</p>
          </div>
          {user?.licenseStatus === 'approved' && (
            <Link
              to="/driver/post-ride"
              style={{ padding: '11px 22px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', borderRadius: 13, fontSize: 14, fontWeight: 500, textDecoration: 'none', ...fontBody, boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
            >
              + Post New Ride
            </Link>
          )}
        </div>

        {/* License Status */}
        <div style={{ background: ls.bg, border: `1px solid ${ls.border}`, borderRadius: 14, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{ls.icon}</span>
            <div>
              <div style={{ ...fontHead, fontSize: 14, fontWeight: 700, color: ls.color }}>
                License: {user?.licenseStatus?.replace('_', ' ').toUpperCase()}
              </div>
              <div style={{ ...fontBody, fontSize: 12, color: ls.color, opacity: 0.8 }}>
                {user?.licenseStatus === 'not_uploaded' && 'Upload your license to start posting rides'}
                {user?.licenseStatus === 'pending' && 'Your license is under admin review'}
                {user?.licenseStatus === 'approved' && 'You are verified and can post rides'}
                {user?.licenseStatus === 'rejected' && 'Your license was rejected — please re-upload'}
              </div>
            </div>
          </div>
          {(user?.licenseStatus === 'not_uploaded' || user?.licenseStatus === 'rejected') && (
            <Link
              to="/driver/upload-license"
              style={{ padding: '8px 16px', background: '#2563eb', color: 'white', borderRadius: 9, fontSize: 13, fontWeight: 500, textDecoration: 'none', ...fontBody }}
            >
              {user?.licenseStatus === 'rejected' ? 'Re-upload License' : 'Upload License'}
            </Link>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { icon: '🚗', label: 'Total Rides', value: rides.length, bg: '#eff6ff', color: '#1d4ed8' },
            { icon: '✅', label: 'Active Rides', value: active.length, bg: '#ecfdf5', color: '#166534' },
            { icon: '💺', label: 'Seats Booked', value: totalSeatsBooked, bg: '#fefce8', color: '#92400e' },
            { icon: '❌', label: 'Cancelled', value: cancelled.length, bg: '#fef2f2', color: '#991b1b' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', border: '1px solid #e8edf5', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ ...fontHead, fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ ...fontBody, fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Rides Section */}
        <div style={{ background: 'white', border: '1px solid #e8edf5', borderRadius: 20, padding: '24px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ ...fontHead, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              My Posted Rides
            </h2>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 5, background: '#f1f5f9', borderRadius: 10, padding: 3 }}>
              {[
                { value: 'all', label: 'All', count: rides.length },
                { value: 'active', label: 'Active', count: active.length },
                { value: 'past', label: 'Past', count: past.length },
                { value: 'cancelled', label: 'Cancelled', count: cancelled.length },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => setFilter(t.value)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: filter === t.value ? 'white' : 'transparent', color: filter === t.value ? '#0f172a' : '#64748b', fontWeight: filter === t.value ? 600 : 400, fontSize: 12, cursor: 'pointer', ...fontBody, boxShadow: filter === t.value ? '0 1px 4px rgba(15,23,42,0.08)' : 'none' }}
                >
                  {t.label} {t.count > 0 && <span style={{ fontSize: 10, opacity: 0.7 }}>({t.count})</span>}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2].map(i => <div key={i} style={{ height: 180, background: '#f8faff', borderRadius: 14, opacity: 0.5 }} />)}
            </div>
          ) : filtered.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filtered.map(ride => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onViewBookings={setSelectedRide}
                  onCancel={handleCancelRide}
                  cancelling={cancellingId === ride.id}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🚗</div>
              <h3 style={{ ...fontHead, fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                {filter === 'all' ? 'No rides posted yet' : `No ${filter} rides`}
              </h3>
              <p style={{ ...fontBody, fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
                {filter === 'all' && user?.licenseStatus === 'approved'
                  ? 'Post your first ride so passengers can find you.'
                  : filter === 'all'
                    ? 'Get your license verified first, then start posting rides.'
                    : `You have no ${filter} rides.`}
              </p>
              {filter === 'all' && user?.licenseStatus === 'approved' && (
                <Link
                  to="/driver/post-ride"
                  style={{ display: 'inline-block', padding: '11px 24px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 500, textDecoration: 'none', ...fontBody }}
                >
                  Post Your First Ride
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bookings Modal */}
      {selectedRide && (
        <BookingsModal
          ride={selectedRide}
          onClose={() => setSelectedRide(null)}
        />
      )}
    </div>
  );
};

export default DriverDashboard;