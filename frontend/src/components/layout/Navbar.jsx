import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const isActive  = (path) => location.pathname === path;

  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin')  return '/admin/dashboard';
    if (user?.role === 'driver') return '/driver/dashboard';
    return '/passenger/dashboard';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500&display=swap');

        .rl-nav-wrapper {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 48px);
          max-width: 1120px;
          z-index: 1000;
        }

        .rl-nav {
          background: rgba(8, 15, 35, 0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
        }

        .rl-nav:hover {
          background: rgba(8, 15, 35, 0.78);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .rl-nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .rl-nav-logo-icon {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        .rl-nav-logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.3px;
        }

        .rl-nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rl-nav-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: rgba(186, 210, 255, 0.75);
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .rl-nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.08);
        }

        .rl-nav-link.active {
          color: white;
          background: rgba(37, 99, 235, 0.25);
        }

        .rl-nav-divider {
          width: 1px;
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0 6px;
        }

        .rl-nav-cta {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: white;
          text-decoration: none;
          padding: 8px 18px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 10px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
        }

        .rl-nav-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }

        .rl-nav-user {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .rl-nav-user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #10b981);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .rl-nav-role-badge {
          font-size: 10px;
          font-weight: 500;
          padding: 2px 7px;
          border-radius: 999px;
          text-transform: capitalize;
        }

        .rl-nav-role-badge.driver    { background: rgba(16,185,129,0.2);  color: #10b981; }
        .rl-nav-role-badge.passenger { background: rgba(37,99,235,0.2);   color: #60a5fa; }
        .rl-nav-role-badge.admin     { background: rgba(239,68,68,0.2);   color: #f87171; }

        .rl-nav-logout {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(186, 210, 255, 0.75);
          padding: 7px 13px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rl-nav-logout:hover {
          background: rgba(239, 68, 68, 0.25);
          border-color: rgba(239, 68, 68, 0.4);
          color: #fca5a5;
        }

        .rl-nav-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .rl-nav-hamburger:hover { background: rgba(255,255,255,0.08); }

        .rl-nav-hamburger span {
          display: block;
          width: 20px;
          height: 1.5px;
          background: rgba(186,210,255,0.8);
          border-radius: 2px;
          transition: all 0.2s ease;
          transform-origin: center;
        }

        .rl-nav-hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(4px, 4px); }
        .rl-nav-hamburger.open span:nth-child(2) { opacity: 0; }
        .rl-nav-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(4px, -4px); }

        .rl-mobile-menu {
          margin-top: 8px;
          background: rgba(8, 15, 35, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          animation: rl-nav-slide 0.2s ease;
        }

        .rl-mobile-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: rgba(186,210,255,0.8);
          text-decoration: none;
          padding: 10px 16px;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .rl-mobile-link:hover {
          background: rgba(255,255,255,0.06);
          color: white;
        }

        .rl-mobile-cta {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: white;
          text-decoration: none;
          padding: 11px 16px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 10px;
          text-align: center;
          margin-top: 4px;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
          border: none;
          cursor: pointer;
          width: 100%;
          display: block;
        }

        .rl-mobile-logout {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #fca5a5;
          padding: 11px 16px;
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          text-align: center;
          margin-top: 4px;
          cursor: pointer;
          width: 100%;
        }

        @keyframes rl-nav-slide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .rl-nav-links,
          .rl-nav-divider,
          .rl-nav-user,
          .rl-nav-cta,
          .rl-nav-logout {
            display: none;
          }
          .rl-nav-hamburger { display: flex; }
          .rl-nav-wrapper {
            width: calc(100% - 32px);
            top: 12px;
          }
        }
      `}</style>

      <div className="rl-nav-wrapper">
        <nav className="rl-nav">

          {/* Logo */}
          <Link to="/" className="rl-nav-logo">
            <div className="rl-nav-logo-icon">RL</div>
            <span className="rl-nav-logo-text">RideLink</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="rl-nav-links">
            <Link to="/"       className={`rl-nav-link ${isActive('/')       ? 'active' : ''}`}>Home</Link>
            <Link to="/search" className={`rl-nav-link ${isActive('/search') ? 'active' : ''}`}>Find a Ride</Link>
          </div>

          {/* Desktop Auth Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAuthenticated ? (
              <div className="rl-nav-user">
                {/* Profile link with avatar + name */}
                <Link
                  to="/profile"
                  className="rl-nav-link"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px' }}
                >
                  <div className="rl-nav-user-avatar" style={{ padding: 0, overflow: 'hidden' }}>
                    {user?.profileImage ? (
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/${user.profileImage.replace(/\\/g, '/')}`}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span style={{ color: 'rgba(186,210,255,0.9)' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  <span className={`rl-nav-role-badge ${user?.role}`}>
                    {user?.role}
                  </span>
                </Link>

                <div className="rl-nav-divider" />

                {/* Dashboard link */}
                <Link
                  to={getDashboardLink()}
                  className={`rl-nav-link ${location.pathname.includes('dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>

                <div className="rl-nav-divider" />

                {/* Logout */}
                <button className="rl-nav-logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="rl-nav-cta">Get Started</Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`rl-nav-hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="rl-mobile-menu">
            <Link to="/"       className="rl-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/search" className="rl-mobile-link" onClick={() => setMenuOpen(false)}>Find a Ride</Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="rl-mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  👤 {user?.name?.split(' ')[0]} ({user?.role})
                </Link>
                <Link
                  to={getDashboardLink()}
                  className="rl-mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  className="rl-mobile-logout"
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="rl-mobile-cta" onClick={() => setMenuOpen(false)}>
                Get Started
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;