import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getTodaysRidesApi } from '../../api/rideApi.js';
import { getMyBookingsApi } from '../../api/bookingApi.js';
import { getMyReviewsApi } from '../../api/reviewApi.js';

const fontHead = { fontFamily: 'Syne, sans-serif' };
const fontBody = { fontFamily: 'DM Sans, sans-serif' };

// ── Today's Ride Card ──
const TodayCard = ({ ride }) => {
  const driverName = ride.driverInfo?.name || 'Driver';
  return (
    <Link
      to={`/rides/${ride.id}`}
      style={{
        display: 'block',
        minWidth: 260,
        background: 'white',
        border: '1px solid #e8edf5',
        borderRadius: 18,
        padding: '18px 20px',
        textDecoration: 'none',
        flexShrink: 0,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,99,235,0.12)';
        e.currentTarget.style.borderColor = '#bfdbfe';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#e8edf5';
      }}
    >
      {/* Route */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
          <span style={{ ...fontHead, fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{ride.origin}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: '#94a3b8' }}>
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
          <span style={{ ...fontHead, fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{ride.destination}</span>
        </div>
      </div>

      {/* Time & Seats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        <span style={{ ...fontBody, fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
          🕐 {ride.time}
        </span>
        <span style={{ ...fontBody, fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
          💺 {ride.seatsLeft} seat{ride.seatsLeft !== 1 ? 's' : ''} left
        </span>
      </div>

      {/* Driver & Price */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'linear-gradient(135deg,#2563eb,#10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 11, fontWeight: 700, ...fontHead, flexShrink: 0,
          }}>
            {driverName.charAt(0).toUpperCase()}
          </div>
          <span style={{ ...fontBody, fontSize: 12, color: '#374151', fontWeight: 500 }}>{driverName}</span>
        </div>
        <span style={{ ...fontHead, fontSize: 15, fontWeight: 800, color: '#1d4ed8' }}>
          LKR {ride.price.toLocaleString()}
        </span>
      </div>
    </Link>
  );
};

// ── Stat Card ──
const StatCard = ({ icon, label, value, bg, color }) => (
  <div style={{
    background: 'white',
    border: '1px solid #e8edf5',
    borderRadius: 16,
    padding: '20px 22px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  }}>
    <div style={{
      width: 46, height: 46, borderRadius: 13,
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ ...fontHead, fontSize: 22, fontWeight: 700, color: color || '#0f172a', lineHeight: 1 }}>{value}</div>
      <div style={{ ...fontBody, fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{label}</div>
    </div>
  </div>
);

// ── Quick Search Bar ──
const QuickSearch = ({ navigate }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (from) params.set('origin', from);
    if (to) params.set('destination', to);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg,#0a0f1e,#0d1b3e)',
      borderRadius: 20,
      padding: '28px 28px',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: 32,
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.06) 1px,transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{ ...fontHead, fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>
          🔍 Find a specific ride
        </h3>
        <p style={{ ...fontBody, fontSize: 13, color: 'rgba(186,210,255,0.65)', marginBottom: 18 }}>
          Search by destination, date, price and more
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="From city..."
            value={from}
            onChange={e => setFrom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{
              flex: 1, minWidth: 140,
              padding: '10px 14px',
              borderRadius: 11,
              border: '1.5px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: 'white',
              fontSize: 14,
              ...fontBody,
              outline: 'none',
            }}
          />
          <input
            type="text"
            placeholder="To city..."
            value={to}
            onChange={e => setTo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{
              flex: 1, minWidth: 140,
              padding: '10px 14px',
              borderRadius: 11,
              border: '1.5px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: 'white',
              fontSize: 14,
              ...fontBody,
              outline: 'none',
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: '10px 22px',
              background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: 11,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              ...fontBody,
              boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              whiteSpace: 'nowrap',
            }}
          >
            Search Rides →
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ──
const PassengerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayRides, setTodayRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingRides: 0,
    completedRides: 0,
    reviewsGiven: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.all([
      getTodaysRidesApi(8),
      getMyBookingsApi(),
      getMyReviewsApi()
    ])
      .then(([ridesRes, bookingsRes, reviewsRes]) => {
        setTodayRides(ridesRes.data.rides || []);

        const bookings = bookingsRes.data.bookings || [];
        const reviews = reviewsRes.data.reviews || [];

        const todayStr = new Date().toISOString().split('T')[0];

        const upcoming = bookings.filter(b => b.status === 'confirmed' && b.rideInfo?.date >= todayStr).length;
        const completed = bookings.filter(b => b.status === 'completed' || (b.status === 'confirmed' && b.rideInfo?.date < todayStr)).length;

        setStats({
          totalBookings: bookings.length,
          upcomingRides: upcoming,
          completedRides: completed,
          reviewsGiven: reviews.length,
        });
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        setTodayRides([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div style={{ ...fontBody, background: '#f1f5f9', minHeight: '100vh', paddingTop: 100 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 64px' }}>

        {/* ── HEADER ── */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: '28px 32px',
          marginBottom: 24,
          border: '1px solid #e8edf5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <p style={{ ...fontBody, fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>
              {todayStr}
            </p>
            <h1 style={{ ...fontHead, fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              {greeting()}, {firstName} 👋
            </h1>
            <p style={{ ...fontBody, fontSize: 14, color: '#64748b' }}>
              Ready to find your next ride?
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              to="/search"
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                color: 'white',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                ...fontBody,
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
              }}
            >
              🔍 Find a Ride
            </Link>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard icon="🎫" label="Total Bookings" value={stats.totalBookings} bg="#eff6ff" color="#1d4ed8" />
          <StatCard icon="🚗" label="Upcoming Rides" value={stats.upcomingRides} bg="#f0fdf4" color="#166534" />
          <StatCard icon="✅" label="Completed Rides" value={stats.completedRides} bg="#fefce8" color="#92400e" />
          <StatCard icon="⭐" label="Reviews Given" value={stats.reviewsGiven} bg="#fdf4ff" color="#7e22ce" />
        </div>

        {/* ── QUICK SEARCH ── */}
        <QuickSearch navigate={navigate} />

        {/* ── TODAY'S RIDES FEED ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ ...fontHead, fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                🔥 Rides leaving today
              </h2>
              <p style={{ ...fontBody, fontSize: 13, color: '#94a3b8' }}>
                Available seats departing today — book before they fill up
              </p>
            </div>
            <Link
              to="/passenger/my-bookings"
              style={{ ...fontBody, fontSize: 13, color: '#2563eb', fontWeight: 500, textDecoration: 'none' }}
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  minWidth: 260, height: 148,
                  background: 'white',
                  borderRadius: 18,
                  flexShrink: 0,
                  animation: 'pulse 1.5s ease-in-out infinite',
                  opacity: 0.6,
                }} />
              ))}
            </div>
          ) : todayRides.length > 0 ? (
            <div style={{
              display: 'flex',
              gap: 14,
              overflowX: 'auto',
              paddingBottom: 8,
              scrollbarWidth: 'thin',
            }}>
              {todayRides.map(ride => <TodayCard key={ride.id} ride={ride} />)}
            </div>
          ) : (
            <div style={{
              background: 'white',
              border: '1px solid #e8edf5',
              borderRadius: 16,
              padding: '40px 32px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗓️</div>
              <h3 style={{ ...fontHead, fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                No rides today yet
              </h3>
              <p style={{ ...fontBody, fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
                Drivers haven't posted today's rides yet. Check upcoming rides instead.
              </p>
              <Link
                to="/search"
                style={{
                  display: 'inline-block',
                  padding: '10px 22px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  ...fontBody,
                }}
              >
                Browse Upcoming Rides
              </Link>
            </div>
          )}
        </div>

        {/* ── UPCOMING RIDES PLACEHOLDER ── */}
        <div style={{
          background: 'white',
          border: '1px solid #e8edf5',
          borderRadius: 20,
          padding: '24px 28px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ ...fontHead, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              📋 My Bookings
            </h2>
            <Link
              to="/passenger/my-bookings"
              style={{ ...fontBody, fontSize: 13, color: '#2563eb', fontWeight: 500, textDecoration: 'none' }}
            >
              View all →
            </Link>
          </div>

          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🎫</div>
            <h3 style={{ ...fontHead, fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
              No bookings yet
            </h3>
            <p style={{ ...fontBody, fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
              Find a ride and book your first seat to get started.
            </p>
            <Link
              to="/passenger/my-bookings"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 24px',
                background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                color: 'white',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                ...fontBody,
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
              }}
            >
              View My Bookings →
            </Link>
          </div>

          {/* Tips Section */}
          <div style={{
            marginTop: 24,
            paddingTop: 24,
            borderTop: '1px solid #f1f5f9',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
            gap: 14,
          }}>
            {[
              { icon: '🔍', title: 'Search by route', desc: 'Enter your city and destination to find matching rides' },
              { icon: '💰', title: 'Filter by price', desc: 'Use the price range slider to find affordable options' },
              { icon: '✅', title: 'Verified drivers', desc: 'Toggle verified-only to see license-checked drivers' },
            ].map((tip, i) => (
              <div key={i} style={{
                background: '#f8faff',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 20 }}>{tip.icon}</span>
                <div>
                  <div style={{ ...fontHead, fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>
                    {tip.title}
                  </div>
                  <div style={{ ...fontBody, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                    {tip.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDashboard;