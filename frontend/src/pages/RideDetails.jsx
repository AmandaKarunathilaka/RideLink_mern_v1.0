import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { getRideByIdApi } from '../api/rideApi.js';
import { bookRideApi }    from '../api/bookingApi.js';
import { getDriverReviewsApi } from '../api/reviewApi.js';

const RideDetail = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [ride,    setRide]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [seats,   setSeats]   = useState(1);
  const [booked,  setBooked]  = useState(false);
  const [reviews, setreviews] = useState([]);

  const fontHead = { fontFamily: 'Syne, sans-serif' };
  const fontBody = { fontFamily: 'DM Sans, sans-serif' };

  useEffect(() => {
    getRideByIdApi(id)
      .then(res => setRide(res.data.ride))
      .catch(() => toast.error('Ride not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (ride?.driverInfo?.id) {
      getDriverReviewsApi(ride.driverInfo.id)
        .then(res => setReviews(res.data.reviews || []))
        .catch(() => {});
    }
  }, [ride]);

  const handleBook = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book this ride');
      navigate('/login');
      return;
    }

    if (user?.role !== 'passenger') {
      toast.error('Only passengers can book rides');
      return;
    }

    setBooking(true);
    try {
      await bookRideApi({ rideId: id, seatsBooked: seats });
      setBooked(true);
      toast.success('Ride booked successfully! 🎉');
      setRide(prev => ({ ...prev, seatsLeft: prev.seatsLeft - seats }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ ...fontBody, padding: '120px 24px', textAlign: 'center', color: '#94a3b8' }}>
        Loading ride details...
      </div>
    );
  }

  if (!ride) {
    return (
      <div style={{ ...fontBody, padding: '120px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <h2 style={{ ...fontHead, fontSize: 20, color: '#0f172a', marginBottom: 8 }}>Ride not found</h2>
        <Link to="/search" style={{ color: '#2563eb' }}>Back to Search</Link>
      </div>
    );
  }

  const driverName = ride.driverInfo?.name || 'Driver';
  const totalPrice = ride.price * seats;

  // ── Past ride check ──
  const today     = new Date().toISOString().split('T')[0];
  const isPastRide = ride.date < today;

  return (
    <div style={{ ...fontBody, background: '#f1f5f9', minHeight: '100vh', paddingTop: 100, paddingBottom: 64 }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 9, padding: '7px 14px', cursor: 'pointer', fontSize: 13, color: '#64748b', marginBottom: 20, ...fontBody }}
        >
          ← Back
        </button>

        {/* Past ride banner */}
        {isPastRide && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>📅</span>
            <p style={{ ...fontBody, fontSize: 13, color: '#991b1b', fontWeight: 500, margin: 0 }}>
              This ride has already departed — bookings are no longer available.
            </p>
          </div>
        )}

        {/* Ride Card */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8edf5', overflow: 'hidden', marginBottom: 20 }}>

          {/* Header */}
          <div style={{ background: isPastRide ? 'linear-gradient(135deg,#374151,#1f2937)' : 'linear-gradient(135deg,#0a0f1e,#0d1b3e)', padding: '28px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ ...fontBody, fontSize: 12, color: 'rgba(186,210,255,0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {isPastRide ? 'Past Ride' : 'Ride Details'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ ...fontHead, fontSize: 24, fontWeight: 800, color: 'white' }}>{ride.origin}</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M15 8l4 4-4 4" stroke="rgba(148,176,220,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ ...fontHead, fontSize: 24, fontWeight: 800, color: 'white' }}>{ride.destination}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ ...fontHead, fontSize: 28, fontWeight: 800, color: isPastRide ? '#9ca3af' : '#60a5fa' }}>
                  LKR {ride.price.toLocaleString()}
                </div>
                <div style={{ ...fontBody, fontSize: 12, color: 'rgba(186,210,255,0.6)' }}>per seat</div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ padding: '28px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 28 }}>
              {[
                { icon: '📅', label: 'Date',             value: new Date(ride.date).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}) },
                { icon: '🕐', label: 'Departure',         value: ride.time },
                { icon: '💺', label: 'Seats Available',  value: `${ride.seatsLeft} of ${ride.totalSeats}` },
                { icon: '🚗', label: 'Vehicle',           value: ride.carModel || 'Not specified' },
              ].map((item, i) => (
                <div key={i} style={{ background: '#f8faff', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 18, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ ...fontBody, fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ ...fontBody, fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Seat availability visual */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ ...fontBody, fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>SEAT AVAILABILITY</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Array.from({ length: ride.totalSeats }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: i < ride.seatsLeft ? '#eff6ff' : '#f1f5f9',
                      border: `2px solid ${i < ride.seatsLeft ? '#2563eb' : '#e2e8f0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14,
                    }}
                  >
                    {i < ride.seatsLeft ? '🪑' : '✕'}
                  </div>
                ))}
              </div>
              <p style={{ ...fontBody, fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
                🪑 Available &nbsp;&nbsp; ✕ Taken
              </p>
            </div>

            {/* Notes */}
            {ride.notes && (
              <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 16px', marginBottom: 24 }}>
                <p style={{ ...fontBody, fontSize: 12, color: '#92400e', fontWeight: 500, marginBottom: 4 }}>📝 Driver's note</p>
                <p style={{ ...fontBody, fontSize: 14, color: '#78350f' }}>{ride.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Driver Card */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8edf5', padding: '24px 28px', marginBottom: 20 }}>
          <h3 style={{ ...fontHead, fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
            Your Driver
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 22, fontWeight: 700, ...fontHead, flexShrink: 0,
            }}>
              {driverName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...fontHead, fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                {driverName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ color: '#f59e0b', fontSize: 13 }}>
                  {'★'.repeat(Math.round(ride.driverInfo?.rating || 0))}{'☆'.repeat(5 - Math.round(ride.driverInfo?.rating || 0))}
                </span>
                <span style={{ ...fontBody, fontSize: 13, color: '#64748b' }}>
                  {ride.driverInfo?.rating || 'New driver'} ({ride.driverInfo?.totalReviews || 0} reviews)
                </span>
                {ride.driverInfo?.isVerified && (
                  <span style={{ fontSize: 11, fontWeight: 500, color: '#10b981', background: '#ecfdf5', padding: '2px 8px', borderRadius: 999 }}>
                    ✓ Verified
                  </span>
                )}
              </div>
              {ride.driverInfo?.phone && (
                <a
                  href={`tel:${ride.driverInfo.phone}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
                >
                  📞 {ride.driverInfo.phone}
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8edf5', padding: '24px 28px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ ...fontHead, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                Passenger Reviews
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#f59e0b', fontSize: 16 }}>★</span>
                <span style={{ ...fontHead, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                  {ride.driverInfo?.rating || 0}
                </span>
                <span style={{ ...fontBody, fontSize: 13, color: '#94a3b8' }}>
                  ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.slice(0, 3).map((review, i) => (
                <div key={i} style={{ padding: '14px 16px', background: '#f8faff', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, fontFamily: 'Syne,sans-serif' }}>
                        {review.passengerInfo?.name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <span style={{ ...fontBody, fontSize: 13, fontWeight: 500, color: '#0f172a' }}>
                        {review.passengerInfo?.name || 'Passenger'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ fontSize: 13, color: s <= review.rating ? '#f59e0b' : '#e2e8f0' }}>★</span>
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p style={{ ...fontBody, fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                      "{review.comment}"
                    </p>
                  )}
                  <p style={{ ...fontBody, fontSize: 11, color: '#94a3b8', marginTop: 6, marginBottom: 0 }}>
                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Booking Card */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8edf5', padding: '24px 28px' }}>
          <h3 style={{ ...fontHead, fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
            Book Your Seat
          </h3>

          {booked ? (
            /* ── Booking confirmed ── */
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <h3 style={{ ...fontHead, fontSize: 18, fontWeight: 700, color: '#10b981', marginBottom: 6 }}>
                Booking Confirmed!
              </h3>
              <p style={{ ...fontBody, fontSize: 14, color: '#64748b', marginBottom: 20 }}>
                Your seat has been reserved. Check your bookings for details.
              </p>
              <Link
                to="/passenger/my-bookings"
                style={{ display: 'inline-block', padding: '11px 24px', background: '#2563eb', color: 'white', borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 500, ...fontBody }}
              >
                View My Bookings
              </Link>
            </div>

          ) : isPastRide ? (
            /* ── Past ride — no booking allowed ── */
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📅</div>
              <h3 style={{ ...fontHead, fontSize: 17, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                This ride has already departed
              </h3>
              <p style={{ ...fontBody, fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>
                Bookings are only available for upcoming rides.
              </p>
              <Link
                to="/search"
                style={{ display: 'inline-block', padding: '11px 24px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 500, ...fontBody }}
              >
                Find an upcoming ride →
              </Link>
            </div>

          ) : ride.seatsLeft === 0 ? (
            /* ── Fully booked ── */
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>😔</div>
              <p style={{ ...fontBody, color: '#64748b' }}>This ride is fully booked.</p>
              <Link to="/search" style={{ color: '#2563eb', fontSize: 14, fontWeight: 500, display: 'inline-block', marginTop: 12 }}>
                Find another ride →
              </Link>
            </div>

          ) : (
            /* ── Booking form ── */
            <>
              {/* Seats selector */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <p style={{ ...fontBody, fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Number of seats</p>
                  <p style={{ ...fontBody, fontSize: 12, color: '#94a3b8' }}>Max {ride.seatsLeft} available</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    onClick={() => setSeats(Math.max(1, seats - 1))}
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >−</button>
                  <span style={{ ...fontHead, fontSize: 18, fontWeight: 700, color: '#0f172a', minWidth: 20, textAlign: 'center' }}>{seats}</span>
                  <button
                    onClick={() => setSeats(Math.min(ride.seatsLeft, seats + 1))}
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >+</button>
                </div>
              </div>

              {/* Price breakdown */}
              <div style={{ background: '#f8faff', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ ...fontBody, fontSize: 13, color: '#64748b' }}>LKR {ride.price.toLocaleString()} × {seats} seat{seats > 1 ? 's' : ''}</span>
                  <span style={{ ...fontBody, fontSize: 13, color: '#64748b' }}>LKR {totalPrice.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ ...fontHead, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Total</span>
                  <span style={{ ...fontHead, fontSize: 15, fontWeight: 700, color: '#1d4ed8' }}>LKR {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleBook}
                disabled={booking}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: booking ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 13,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: booking ? 'not-allowed' : 'pointer',
                  boxShadow: booking ? 'none' : '0 4px 16px rgba(37,99,235,0.35)',
                  ...fontBody,
                }}
              >
                {booking ? 'Booking...' : isAuthenticated ? `Confirm Booking — LKR ${totalPrice.toLocaleString()}` : 'Sign in to Book'}
              </button>

              {!isAuthenticated && (
                <p style={{ ...fontBody, fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>
                  <Link to="/login" style={{ color: '#2563eb', fontWeight: 500 }}>Sign in</Link> or <Link to="/login" style={{ color: '#2563eb', fontWeight: 500 }}>register</Link> to confirm your booking
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideDetail;