import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { loginApi, registerApi } from '../../api/authApi.js';
import { getTodaysRidesApi } from '../../api/rideApi.js';
import './AuthStyles.css';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('passenger');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [decoRides, setDecoRides] = useState([]);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Fetch real rides for the decorative cards on the left panel
  useEffect(() => {
    getTodaysRidesApi(2)
      .then(res => setDecoRides(res.data.rides || []))
      .catch(() => { }); // silently fall back to static content
  }, []);

  // ── SIGN IN ──
  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await loginApi({ email, password });
      const { token, user } = res.data;

      login(token, user);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);

      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'driver') navigate('/driver/dashboard');
      else navigate('/passenger/dashboard');

    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
      setPassword(''); // clear password on failure — user must re-enter
    } finally {
      setLoading(false);
    }
  };

  // ── SIGN UP ──
  const handleRegister = async (e) => {
    if (e) e.preventDefault();

    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (!/[0-9]/.test(password)) {
      toast.error('Password must contain at least one number');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error('Password must contain at least one uppercase letter');
      return;
    }

    setLoading(true);
    try {
      const res = await registerApi({ name, email, password, role });
      const { token, user } = res.data;

      login(token, user);
      toast.success('Account created! Welcome to RideLink 🚗');

      if (user.role === 'driver') navigate('/driver/dashboard');
      else navigate('/passenger/dashboard');

    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <a href="/" className="auth-logo">
            <div className="auth-logo-icon">RL</div>
            <span className="auth-logo-text">RideLink</span>
          </a>

          <div className="auth-left-body">
            <div className={`auth-left-slide ${isSignUp ? 'slide-up' : ''}`}>
              <h2 className="auth-left-title">Welcome back to RideLink</h2>
              <p className="auth-left-sub">Sign in to find rides, manage bookings, and connect with fellow commuters.</p>
            </div>
            <div className={`auth-left-slide signup-text ${isSignUp ? 'slide-in' : ''}`}>
              <h2 className="auth-left-title">Join thousands of commuters</h2>
              <p className="auth-left-sub">Create your account and start sharing rides. Save money, reduce emissions, and travel smarter.</p>
            </div>

            <div className="auth-features">
              {['🔒 Secure accounts', '🚗 Verified drivers', '💰 Split travel costs', '🌱 Reduce your footprint'].map((f, i) => (
                <div key={i} className="auth-feature-pill">{f}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="auth-deco-card card-a">
          <div className="deco-card-row">
            <span className="deco-dot green" />
            <span className="deco-label">
              {decoRides[0]
                ? `${decoRides[0].origin} → ${decoRides[0].destination}`
                : 'Colombo → Kandy'}
            </span>
          </div>
          <div className="deco-card-sub">
            {decoRides[0]
              ? `${decoRides[0].seatsLeft} seat${decoRides[0].seatsLeft !== 1 ? 's' : ''} · LKR ${decoRides[0].price?.toLocaleString()}`
              : '3 seats · LKR 850'}
          </div>
          {decoRides[0]?.driverInfo?.name && (
            <div style={{ fontSize: 10, marginTop: 4, opacity: 0.65 }}>
              🚗 {decoRides[0].driverInfo.name.split(' ')[0]}
              {decoRides[0].driverInfo.isVerified ? ' · ✓ Verified' : ''}
            </div>
          )}
        </div>
        <div className="auth-deco-card card-b">
          <div className="deco-card-row">
            <span className="deco-dot blue" />
            <span className="deco-label">
              {decoRides[1]
                ? `${decoRides[1].origin} → ${decoRides[1].destination}`
                : 'Booking confirmed ✓'}
            </span>
          </div>
          <div className="deco-card-sub">
            {decoRides[1]
              ? `${decoRides[1].seatsLeft} seat${decoRides[1].seatsLeft !== 1 ? 's' : ''} · LKR ${decoRides[1].price?.toLocaleString()}`
              : 'Galle → Colombo'}
          </div>
          {decoRides[1]?.driverInfo?.rating > 0 && (
            <div style={{ fontSize: 10, marginTop: 4, opacity: 0.65 }}>
              ★ {decoRides[1].driverInfo.rating} · {decoRides[1].time}
            </div>
          )}
        </div>
      </div>


      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-card">

          {/* Tabs */}
          <div className="auth-tabs">
            <button type="button" className={`auth-tab ${!isSignUp ? 'active' : ''}`} onClick={() => setIsSignUp(false)}>Sign In</button>
            <button type="button" className={`auth-tab ${isSignUp ? 'active' : ''}`} onClick={() => setIsSignUp(true)}>Sign Up</button>
            <div className={`auth-tab-indicator ${isSignUp ? 'right' : 'left'}`} />
          </div>

          <div className="auth-forms-wrap">

            {/* ── SIGN IN FORM ── */}
            <div className={`auth-form ${!isSignUp ? 'form-active' : 'form-hidden form-left'}`}>
              <p className="auth-form-desc">Enter your credentials to access your account</p>

              <div className="auth-field">
                <label className="auth-label">Email address</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin(e)}
                  />
                </div>
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label className="auth-label">Password</label>
                  <button
                    type="button"
                    className="auth-forgot"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin(e)}
                  />
                  <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="auth-submit"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="auth-switch">
                Don't have an account?{' '}
                <button type="button" className="auth-switch-btn" onClick={() => setIsSignUp(true)}>
                  Create one
                </button>
              </p>
            </div>

            {/* ── SIGN UP FORM ── */}
            <div className={`auth-form ${isSignUp ? 'form-active' : 'form-hidden form-right'}`}>
              <p className="auth-form-desc">Create your account and start sharing rides today</p>

              <div className="auth-field">
                <label className="auth-label">Full name</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M2.5 13.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Email address</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Min 8 chars, 1 number, 1 uppercase"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">I want to</label>
                <div className="auth-roles">
                  <button
                    type="button"
                    className={`auth-role ${role === 'passenger' ? 'active' : ''}`}
                    onClick={() => setRole('passenger')}
                  >
                    <span className="auth-role-icon">🧍</span>
                    <span className="auth-role-label">Find Rides</span>
                    <span className="auth-role-sub">Passenger</span>
                  </button>
                  <button
                    type="button"
                    className={`auth-role ${role === 'driver' ? 'active' : ''}`}
                    onClick={() => setRole('driver')}
                  >
                    <span className="auth-role-icon">🚗</span>
                    <span className="auth-role-label">Offer Rides</span>
                    <span className="auth-role-sub">Driver</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="auth-submit"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="auth-switch">
                Already have an account?{' '}
                <button type="button" className="auth-switch-btn" onClick={() => setIsSignUp(false)}>
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;