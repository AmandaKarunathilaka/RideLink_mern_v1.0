import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTodaysRidesApi } from '../api/rideApi.js';
import './HomeStyles.css';

const AnimatedCounter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = (target / 2000) * 16;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const Home = () => {
  const [visible, setVisible] = useState({});
  const [floatRides, setFloatRides] = useState([]);

  // Fetch real rides for floating cards
  useEffect(() => {
    getTodaysRidesApi(2)
      .then(res => setFloatRides(res.data.rides || []))
      .catch(() => {}); // silently fail — fallback to static cards
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setVisible((p) => ({ ...p, [e.target.id]: true }));
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Use real ride data if available, otherwise fall back to static
  const card1 = floatRides[0] || null;
  const card2 = floatRides[1] || null;

  return (
    <>
      {/* ── HERO ── */}
      <section className="rl-hero">
        <div className="rl-hero-img" />
        <div className="rl-hero-overlay" />
        <div className="rl-hero-noise" />

        <div className="rl-hero-content">
          <div style={{ textAlign: 'center' }}>
            <div className="rl-pill" style={{ marginBottom: 28 }}>
              <div className="rl-pill-dot" />
              Smart Carpooling Platform
            </div>

            <h1 className="rl-hero-title">
              <span style={{ display: 'block', animation: 'rl-fadeup 0.7s 0.2s ease both', opacity: 0, animationFillMode: 'forwards' }}>
                Share Rides. Save Money.
              </span>
              <span className="accent" style={{ display: 'block', animation: 'rl-fadeup 0.7s 0.45s ease both', opacity: 0, animationFillMode: 'forwards' }}>
                Help the Planet.
              </span>
            </h1>

            <p className="rl-hero-sub" style={{ margin: '0 auto 40px' }}>
              Connect with drivers and passengers heading your way. RideLink makes carpooling simple, safe, and affordable for everyone.
            </p>

            <div className="rl-hero-btns" style={{ justifyContent: 'center' }}>
              <Link to="/search" className="rl-btn-primary">
                Find a Ride
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link to="/login" className="rl-btn-ghost">
                Offer a Ride
              </Link>
            </div>
          </div>
        </div>

        {/* ── Floating Card 1 — Real or Static ── */}
        <div className="rl-float-card c1">
          {card1 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🚗</div>
                <div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 600, color: '#e2eaff' }}>
                    {card1.origin} → {card1.destination}
                  </div>
                  <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: 'rgba(148,176,220,0.65)' }}>
                    Today · {card1.seatsLeft} seat{card1.seatsLeft !== 1 ? 's' : ''} left
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: 'rgba(148,176,220,0.55)' }}>
                  LKR {card1.price?.toLocaleString()}/seat
                </span>
                <span style={{ background: 'rgba(16,185,129,0.18)', color: '#10b981', fontSize: 10, padding: '3px 8px', borderRadius: 999, fontFamily: 'DM Sans,sans-serif', fontWeight: 500 }}>
                  {card1.seatsLeft > 0 ? 'Available' : 'Full'}
                </span>
              </div>
              {card1.driverInfo?.name && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 600 }}>
                    {card1.driverInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: 'rgba(186,210,255,0.7)' }}>
                    {card1.driverInfo.name.split(' ')[0]}
                  </span>
                  {card1.driverInfo.isVerified && (
                    <span style={{ fontSize: 9, color: '#10b981', marginLeft: 'auto' }}>✓ Verified</span>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Static fallback */
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🚗</div>
                <div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 600, color: '#e2eaff' }}>Colombo → Kandy</div>
                  <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: 'rgba(148,176,220,0.65)' }}>Today · 3 seats left</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: 'rgba(148,176,220,0.55)' }}>LKR 850/seat</span>
                <span style={{ background: 'rgba(16,185,129,0.18)', color: '#10b981', fontSize: 10, padding: '3px 8px', borderRadius: 999, fontFamily: 'DM Sans,sans-serif', fontWeight: 500 }}>Available</span>
              </div>
            </>
          )}
        </div>

        {/* ── Floating Card 2 — Real or Static ── */}
        <div className="rl-float-card c2">
          {card2 ? (
            <>
              <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, color: 'rgba(148,176,220,0.55)', marginBottom: 6, letterSpacing: 0.5 }}>
                🔥 RIDE TODAY
              </div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 600, color: '#e2eaff', marginBottom: 8 }}>
                {card2.origin} → {card2.destination}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 600 }}>
                  {card2.driverInfo?.name?.charAt(0).toUpperCase() || 'D'}
                </div>
                <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: 'rgba(186,210,255,0.8)' }}>
                  {card2.driverInfo?.name?.split(' ')[0] || 'Driver'}
                </span>
                {card2.driverInfo?.rating > 0 && (
                  <span style={{ color: '#fbbf24', fontSize: 12, marginLeft: 'auto' }}>
                    ★ {card2.driverInfo.rating}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: 'rgba(148,176,220,0.55)' }}>
                  🕐 {card2.time}
                </span>
                <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: '#60a5fa' }}>
                  LKR {card2.price?.toLocaleString()}
                </span>
              </div>
            </>
          ) : (
            /* Static fallback */
            <>
              <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, color: 'rgba(148,176,220,0.55)', marginBottom: 6, letterSpacing: 0.5 }}>BOOKING CONFIRMED ✓</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 600, color: '#e2eaff', marginBottom: 8 }}>Galle → Colombo</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 600 }}>A</div>
                <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: 'rgba(186,210,255,0.8)' }}>Amal S.</span>
                <span style={{ color: '#fbbf24', fontSize: 12, marginLeft: 'auto' }}>★ 4.9</span>
              </div>
            </>
          )}
        </div>

        {/* Scroll hint */}
        <div className="rl-scroll-hint">
          <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, color: 'rgba(148,176,220,0.35)', letterSpacing: 2, textTransform: 'uppercase' }}>Scroll</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 7l5 5 5-5" stroke="rgba(148,176,220,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="rl-stats-section">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div
            id="stats" data-animate
            className={`rl-reveal rl-stats-grid ${visible['stats'] ? 'visible' : ''}`}
          >
            {[
              { value: 12000, suffix: '+',  label: 'Active Riders' },
              { value: 5400,  suffix: '+',  label: 'Rides Shared' },
              { value: 98,    suffix: '%',  label: 'Satisfaction Rate' },
              { value: 3200,  suffix: 'kg', label: 'CO₂ Saved' },
            ].map((s, i) => (
              <div key={i} className="rl-stat-cell">
                <div className="rl-stat-num"><AnimatedCounter target={s.value} suffix={s.suffix} /></div>
                <div className="rl-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="rl-how-section">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div id="how-h" data-animate className={`rl-reveal ${visible['how-h'] ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="rl-section-tag">How it works</div>
            <h2 className="rl-section-title">Three steps to your next ride</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
            {[
              { id: 's1', delay: 'rl-d1', icon: '🔐', bg: '#eff6ff', num: '01', title: 'Create your account',  desc: 'Sign up in seconds with your email. Choose your role as a passenger or driver and you\'re ready to go.' },
              { id: 's2', delay: 'rl-d2', icon: '🔍', bg: '#f0fdf4', num: '02', title: 'Find or post a ride',  desc: 'Passengers search rides by destination and date. Drivers post available seats with route and price.' },
              { id: 's3', delay: 'rl-d3', icon: '🤝', bg: '#fefce8', num: '03', title: 'Book and travel',      desc: 'Confirm your booking in one tap. Get driver details and meet at the agreed location. Safe and affordable.' },
            ].map(s => (
              <div key={s.id} id={s.id} data-animate className={`rl-reveal ${s.delay} ${visible[s.id] ? 'visible' : ''}`}>
                <div className="rl-step-card">
                  <div className="rl-step-bg-num">{s.num}</div>
                  <div className="rl-step-icon-wrap" style={{ background: s.bg }}>{s.icon}</div>
                  <div className="rl-step-title">{s.title}</div>
                  <div className="rl-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES (DARK) ── */}
      <section className="rl-dark-section">
        <div className="rl-dark-grid" />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 80, alignItems: 'center' }}>
            <div id="fl" data-animate className={`rl-reveal ${visible['fl'] ? 'visible' : ''}`}>
              <div className="rl-section-tag" style={{ color: '#60a5fa' }}>Why RideLink</div>
              <h2 className="rl-section-title" style={{ color: '#f0f6ff', marginBottom: 20 }}>Built for everyday commuters</h2>
              <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 16, color: 'rgba(186,210,255,0.6)', lineHeight: 1.7, fontWeight: 300, marginBottom: 32 }}>
                No complex setup. No hidden fees. Just connect, share, and go.
              </p>
              <Link to="/login" className="rl-btn-primary" style={{ display: 'inline-flex' }}>Get Started Free</Link>
            </div>
            <div id="fr" data-animate className={`rl-reveal rl-d2 ${visible['fr'] ? 'visible' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { icon: '🔒', bg: 'rgba(37,99,235,0.15)',   title: 'Verified users',        desc: 'Every driver is identity-checked and license-verified before they can post a ride.' },
                { icon: '💰', bg: 'rgba(16,185,129,0.15)',  title: 'Split travel costs',    desc: 'Share fuel costs fairly. Save up to 70% compared to solo driving.' },
                { icon: '🌱', bg: 'rgba(34,197,94,0.12)',   title: 'Reduce your footprint', desc: 'Every shared ride means fewer cars and less emissions.' },
                { icon: '⚡', bg: 'rgba(251,191,36,0.12)',  title: 'Instant booking',       desc: 'Book a seat or confirm a passenger in seconds. No back-and-forth.' },
              ].map((f, i) => (
                <div key={i} className="rl-feat-item">
                  <div className="rl-feat-icon" style={{ background: f.bg }}>{f.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 600, color: '#e2eaff', marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 14, color: 'rgba(148,176,220,0.65)', lineHeight: 1.6, fontWeight: 300 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="rl-cta-section">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div id="cta" data-animate className={`rl-reveal ${visible['cta'] ? 'visible' : ''}`}>
            <div className="rl-cta-box">
              <div className="rl-cta-grid" />
              <div className="rl-cta-glow" />
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(30px,4vw,52px)', fontWeight: 800, color: '#f0f6ff', marginBottom: 16, position: 'relative', zIndex: 1 }}>
                Ready to start sharing rides?
              </h2>
              <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 17, color: 'rgba(186,210,255,0.65)', fontWeight: 300, marginBottom: 36, position: 'relative', zIndex: 1 }}>
                Join thousands of commuters already saving money and reducing traffic.
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                <Link to="/login"  className="rl-btn-primary">Sign Up / Sign In</Link>
                <Link to="/search" className="rl-btn-ghost">Browse Rides</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;