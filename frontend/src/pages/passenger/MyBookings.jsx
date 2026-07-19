import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { getMyBookingsApi, cancelBookingApi } from '../../api/bookingApi.js';
import { addReviewApi, getBookingReviewApi } from '../../api/reviewApi.js';
import api from '../../api/axiosConfig.js';

const fontHead = { fontFamily: 'Syne, sans-serif' };
const fontBody = { fontFamily: 'DM Sans, sans-serif' };

const statusConfig = {
  confirmed: { label: 'Confirmed',  bg: '#ecfdf5', color: '#166534', border: '#86efac', icon: '✅' },
  cancelled: { label: 'Cancelled',  bg: '#fef2f2', color: '#991b1b', border: '#fca5a5', icon: '❌' },
  completed: { label: 'Completed',  bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe', icon: '🏁' },
};

// ── Star Rating ──
const StarRating = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1,2,3,4,5].map(star => (
      <button
        key={star}
        onClick={() => onChange(star)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 26,
          cursor: 'pointer',
          color: star <= value ? '#f59e0b' : '#e2e8f0',
          transition: 'color 0.15s ease',
          padding: 2,
          lineHeight: 1,
        }}
      >
        ★
      </button>
    ))}
  </div>
);

// ── Review Form ──
const ReviewForm = ({ booking }) => {
  const [rating,     setRating]     = useState(0);
  const [comment,    setComment]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [existing,   setExisting]   = useState(null);
  const [checking,   setChecking]   = useState(true);

  useEffect(() => {
    getBookingReviewApi(booking.id)
      .then(res => {
        if (res.data.review) {
          setExisting(res.data.review);
          setRating(res.data.review.rating);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [booking.id]);

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await addReviewApi({ bookingId: booking.id, rating, comment: comment.trim() || null });
      setSubmitted(true);
      toast.success('Review submitted! ⭐');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) return null;

  // Already reviewed
  if (existing || submitted) {
    return (
      <div style={{ marginTop: 12, padding: '12px 16px', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12 }}>
        <p style={{ ...fontBody, fontSize: 13, color: '#92400e', fontWeight: 500, marginBottom: 6 }}>
          ⭐ Your Review
        </p>
        <div style={{ display: 'flex', gap: 2, marginBottom: existing?.comment ? 6 : 0 }}>
          {[1,2,3,4,5].map(s => (
            <span key={s} style={{ fontSize: 16, color: s <= (existing?.rating || rating) ? '#f59e0b' : '#e2e8f0' }}>★</span>
          ))}
        </div>
        {existing?.comment && (
          <p style={{ ...fontBody, fontSize: 13, color: '#78350f', margin: 0 }}>"{existing.comment}"</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 12, padding: '16px', background: '#f8faff', border: '1px solid #bfdbfe', borderRadius: 14 }}>
      <p style={{ ...fontHead, fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 10 }}>
        ⭐ Rate your experience
      </p>

      <StarRating value={rating} onChange={setRating} />

      {rating > 0 && (
        <p style={{ ...fontBody, fontSize: 12, color: '#64748b', marginTop: 4, marginBottom: 8 }}>
          {['','😞 Poor','😐 Fair','🙂 Good','😊 Great','🤩 Excellent!'][rating]}
        </p>
      )}

      <textarea
        rows={2}
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Share your experience (optional)..."
        maxLength={300}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          border: '1.5px solid #e2e8f0',
          fontSize: 13,
          fontFamily: 'DM Sans, sans-serif',
          resize: 'none',
          outline: 'none',
          marginTop: 8,
          marginBottom: 8,
          background: 'white',
          boxSizing: 'border-box',
          display: 'block',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ ...fontBody, fontSize: 11, color: '#94a3b8' }}>{comment.length}/300</span>
        <button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          style={{
            padding: '8px 20px',
            background: rating === 0 || submitting ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#1d4ed8)',
            color: 'white',
            border: 'none',
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 500,
            cursor: rating === 0 || submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
};

// ── Booking Card ──
const BookingCard = ({ booking, onCancel, cancelling }) => {
  const status = statusConfig[booking.status] || statusConfig.confirmed;
  const ride   = booking.rideInfo;
  const driver = ride?.driverInfo;
  const [showConfirm, setShowConfirm] = useState(false);

  const today     = new Date().toISOString().split('T')[0];
  const isPast    = ride?.date && ride.date < today;
  const canCancel = booking.status === 'confirmed' && !isPast;

  const rideDate = ride?.date
    ? new Date(ride.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  const bookedOn = new Date(booking.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div style={{
      background: 'white',
      border: `1px solid ${booking.status === 'cancelled' ? '#fca5a5' : '#e8edf5'}`,
      borderRadius: 18,
      overflow: 'hidden',
      opacity: booking.status === 'cancelled' ? 0.75 : 1,
    }}>

      {/* Top bar */}
      <div style={{
        background: booking.status === 'cancelled' ? '#fef2f2' : 'linear-gradient(135deg,#0a0f1e,#0d1b3e)',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ ...fontHead, fontSize: 16, fontWeight: 800, color: booking.status === 'cancelled' ? '#991b1b' : 'white' }}>
            {ride?.origin || '—'}
          </span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 9h12M10 5l4 4-4 4" stroke={booking.status === 'cancelled' ? '#fca5a5' : 'rgba(148,176,220,0.6)'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ ...fontHead, fontSize: 16, fontWeight: 800, color: booking.status === 'cancelled' ? '#991b1b' : 'white' }}>
            {ride?.destination || '—'}
          </span>
        </div>
        <span style={{
          ...fontBody, fontSize: 11, fontWeight: 600,
          background: status.bg, color: status.color,
          border: `1px solid ${status.border}`,
          padding: '4px 12px', borderRadius: 999,
        }}>
          {status.icon} {status.label}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px' }}>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10, marginBottom: 16 }}>
          {[
            { icon: '📅', label: 'Ride Date',    value: rideDate },
            { icon: '🕐', label: 'Departure',    value: ride?.time || '—' },
            { icon: '💺', label: 'Seats Booked', value: `${booking.seatsBooked} seat${booking.seatsBooked > 1 ? 's' : ''}` },
            { icon: '💰', label: 'Total Paid',   value: `LKR ${booking.totalPrice?.toLocaleString() || '—'}` },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8faff', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 15, marginBottom: 3 }}>{item.icon}</div>
              <div style={{ ...fontBody, fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>{item.label}</div>
              <div style={{ ...fontBody, fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Driver info */}
        {driver && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8faff', borderRadius: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, ...fontHead, fontSize: 13, flexShrink: 0 }}>
              {driver.name?.charAt(0).toUpperCase() || 'D'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...fontBody, fontSize: 10, color: '#94a3b8', marginBottom: 1 }}>DRIVER</div>
              <div style={{ ...fontHead, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{driver.name}</div>
            </div>
            {driver.phone && (
              <a
                href={`tel:${driver.phone}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#eff6ff', color: '#2563eb', borderRadius: 8, fontSize: 12, fontWeight: 500, textDecoration: 'none', ...fontBody }}
              >
                📞 Call
              </a>
            )}
            {driver.isVerified && (
              <span style={{ fontSize: 10, fontWeight: 500, color: '#10b981', background: '#ecfdf5', padding: '3px 8px', borderRadius: 999 }}>
                ✓ Verified
              </span>
            )}
          </div>
        )}

        {/* Car model */}
        {ride?.carModel && (
          <div style={{ ...fontBody, fontSize: 13, color: '#64748b', marginBottom: 14 }}>
            🚗 {ride.carModel}
          </div>
        )}

        {/* Footer — stacked layout for responsiveness */}
        <div style={{ paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>

          {/* Actions row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: booking.status === 'confirmed' ? 0 : 0 }}>
            <span style={{ ...fontBody, fontSize: 12, color: '#94a3b8' }}>
              Booked on {bookedOn}
            </span>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link
                to={`/rides/${booking.ride}`}
                style={{ padding: '8px 14px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: 'white', color: '#374151', fontSize: 13, fontWeight: 500, textDecoration: 'none', ...fontBody }}
              >
                View Ride
              </Link>

              {/* Cancel — only for upcoming confirmed rides */}
              {canCancel && (
                showConfirm ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => setShowConfirm(false)}
                      style={{ padding: '8px 12px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: 'white', color: '#374151', fontSize: 13, cursor: 'pointer', ...fontBody }}
                    >
                      Keep
                    </button>
                    <button
                      onClick={() => { onCancel(booking.id); setShowConfirm(false); }}
                      disabled={cancelling}
                      style={{ padding: '8px 14px', borderRadius: 9, border: 'none', background: '#ef4444', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', ...fontBody, opacity: cancelling ? 0.6 : 1 }}
                    >
                      {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirm(true)}
                    style={{ padding: '8px 14px', borderRadius: 9, border: '1.5px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontSize: 13, fontWeight: 500, cursor: 'pointer', ...fontBody }}
                  >
                    Cancel Booking
                  </button>
                )
              )}

              {/* Past confirmed ride label */}
              {booking.status === 'confirmed' && isPast && (
                <span style={{ ...fontBody, fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                  🏁 Ride completed
                </span>
              )}
            </div>
          </div>

          {/* Review form — full width below actions */}
          {booking.status === 'confirmed' && (
            <ReviewForm booking={booking} />
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──
const MyBookings = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [bookings,     setBookings]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [filter,       setFilter]       = useState('all');

  useEffect(() => {
    api.post('/bookings/auto-complete')
      .catch(() => {})
      .finally(() => {
        getMyBookingsApi()
          .then(res => setBookings(res.data.bookings || []))
          .catch(() => toast.error('Failed to load bookings'))
          .finally(() => setLoading(false));
      });
  }, []);

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await cancelBookingApi(bookingId);
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
      );
      toast.success('Booking cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const tabs = [
    { value: 'all',       label: 'All' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
  ];

  const counts = {
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  return (
    <div style={{ ...fontBody, background: '#f1f5f9', minHeight: '100vh', paddingTop: 100, paddingBottom: 64 }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <button
              onClick={() => navigate('/passenger/dashboard')}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', marginBottom: 8, padding: 0, ...fontBody }}
            >
              ← Dashboard
            </button>
            <h1 style={{ ...fontHead, fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              My Bookings
            </h1>
            <p style={{ ...fontBody, fontSize: 14, color: '#64748b' }}>
              {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to="/search"
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 500, textDecoration: 'none', ...fontBody, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
          >
            + Book New Ride
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Confirmed', count: counts.confirmed, bg: '#ecfdf5', color: '#166534', border: '#86efac' },
            { label: 'Completed', count: counts.completed, bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
            { label: 'Cancelled', count: counts.cancelled, bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ ...fontHead, fontSize: 26, fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ ...fontBody, fontSize: 12, color: s.color, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 20, background: 'white', borderRadius: 12, padding: 4, border: '1px solid #e8edf5', width: 'fit-content', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              style={{
                padding: '7px 14px',
                borderRadius: 9,
                border: 'none',
                background: filter === t.value ? '#2563eb' : 'transparent',
                color: filter === t.value ? 'white' : '#64748b',
                fontWeight: filter === t.value ? 600 : 400,
                fontSize: 13,
                cursor: 'pointer',
                ...fontBody,
                transition: 'all 0.2s',
              }}
            >
              {t.label}
              {t.value !== 'all' && counts[t.value] > 0 && (
                <span style={{ marginLeft: 6, background: filter === t.value ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: filter === t.value ? 'white' : '#64748b', fontSize: 11, padding: '1px 6px', borderRadius: 999 }}>
                  {counts[t.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1,2].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: 18, height: 200, opacity: 0.5 }} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancel}
                cancelling={cancellingId === booking.id}
              />
            ))}
          </div>
        ) : (
          <div style={{ background: 'white', border: '1px solid #e8edf5', borderRadius: 18, padding: '56px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎫</div>
            <h3 style={{ ...fontHead, fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p style={{ ...fontBody, fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>
              {filter === 'all' ? 'Book your first ride to get started.' : `You have no ${filter} bookings.`}
            </p>
            <Link
              to="/search"
              style={{ display: 'inline-block', padding: '11px 24px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 500, textDecoration: 'none', ...fontBody }}
            >
              Find a Ride
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;