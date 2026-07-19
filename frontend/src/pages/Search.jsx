import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { searchRidesApi } from '../api/rideApi.js';
import './SearchStyles.css';

const SR_CITIES = ['Colombo','Kandy','Galle','Negombo','Kurunegala','Matara','Jaffna','Anuradhapura','Ratnapura','Badulla'];

const RideCard = ({ ride }) => {
  // driverName must be computed INSIDE the component — it uses the `ride` prop
  const driverName = ride.driverInfo?.name || 'Unknown Driver';

  return (
    <div className="src-ride-card">
      <div className="src-card-top">
        <div className="src-driver-info">
          <div className="src-avatar">
            {driverName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="src-driver-name">{driverName}</div>
            <div className="src-driver-meta">
              <span className="src-stars">{'★'.repeat(Math.round(ride.driverInfo?.rating || 0))}</span>
              <span className="src-rating">{ride.driverInfo?.rating || 'New'}</span>
              <span className="src-reviews">({ride.driverInfo?.totalReviews || 0} reviews)</span>
              {ride.driverInfo?.isVerified && <span className="src-verified">✓ Verified</span>}
            </div>
            {ride.driverInfo?.phone && (
              <a
                href={`tel:${ride.driverInfo.phone}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 6,
                  fontSize: 12,
                  color: '#2563eb',
                  textDecoration: 'none',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 500,
                }}
              >
                📞 {ride.driverInfo.phone}
              </a>
            )}
          </div>
        </div>
        <div className="src-price-box">
          <div className="src-price">LKR {ride.price.toLocaleString()}</div>
          <div className="src-per">per seat</div>
        </div>
      </div>

      <div className="src-route">
        <div className="src-route-point">
          <div className="src-route-dot from" />
          <span className="src-route-city">{ride.origin}</span>
        </div>
        <div className="src-route-line">
          <div className="src-route-dashes" />
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="src-route-arrow">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="src-route-point">
          <div className="src-route-dot to" />
          <span className="src-route-city">{ride.destination}</span>
        </div>
      </div>

      <div className="src-card-meta">
        <div className="src-meta-item">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="#94a3b8" strokeWidth="1.1"/>
            <path d="M4.5 1v3M9.5 1v3M1.5 6h11" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          <span>{new Date(ride.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
        </div>
        <div className="src-meta-item">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="#94a3b8" strokeWidth="1.1"/>
            <path d="M7 4v3.5l2 2" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          <span>{ride.time}</span>
        </div>
        <div className="src-meta-item">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 11c0-2.21 2.239-4 5-4s5 1.79 5 4" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round"/>
            <circle cx="7" cy="4.5" r="2" stroke="#94a3b8" strokeWidth="1.1"/>
          </svg>
          <span>{ride.seatsLeft} seats left</span>
        </div>
        {ride.carModel && (
          <div className="src-meta-item">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="5" width="12" height="6" rx="1.5" stroke="#94a3b8" strokeWidth="1.1"/>
              <path d="M3 5V4a4 4 0 018 0v1" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round"/>
              <circle cx="5.5" cy="8.5" r="1" fill="#94a3b8"/>
            </svg>
            <span>{ride.carModel}</span>
          </div>
        )}
      </div>

      <div className="src-card-footer">
        <div className="src-seat-chips">
          {Array.from({length: ride.seatsLeft}).map((_,i) => (
            <div key={i} className="src-seat-chip available" title="Available" />
          ))}
          {Array.from({length: Math.max(0, ride.totalSeats - ride.seatsLeft)}).map((_,i) => (
            <div key={i} className="src-seat-chip taken" title="Taken" />
          ))}
        </div>
        {ride.seatsLeft > 0 ? (
          <Link to={`/rides/${ride.id}`} className="src-book-btn">Book Seat</Link>
        ) : (
          <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:'#94a3b8', fontWeight:500 }}>Fully Booked</span>
        )}
      </div>
    </div>
  );
};

const Search = () => {
  const [from, setFrom]           = useState('');
  const [to, setTo]               = useState('');
  const [date, setDate]           = useState('');
  const [seats, setSeats]         = useState(1);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [timeRange, setTimeRange] = useState('any');
  const [sortBy, setSortBy]       = useState('time');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searched, setSearched]   = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [allRides, setAllRides] = useState([]);
  const [loading, setLoading]   = useState(true);

  const timeSlots = [
    { value: 'any',       label: 'Any time' },
    { value: 'morning',   label: '🌅 Morning (5am–12pm)' },
    { value: 'afternoon', label: '☀️ Afternoon (12pm–5pm)' },
    { value: 'evening',   label: '🌆 Evening (5pm–10pm)' },
  ];

  const fetchRides = async () => {
    setLoading(true);
    try {
      const params = {
        origin:      from || undefined,
        destination: to   || undefined,
        date:        date || undefined,
        seats:       seats > 1 ? seats : undefined,
        minPrice:    priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice:    priceRange[1] < 2000 ? priceRange[1] : undefined,
        sortBy,
      };
      const res = await searchRidesApi(params);
      setAllRides(res.data.rides);
    } catch (err) {
      toast.error('Failed to load rides — check backend connection');
      setAllRides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const getHour = (timeStr) => {
    if (!timeStr) return null;
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return null;
    let hour = parseInt(match[1], 10);
    const meridian = match[3]?.toUpperCase();
    if (meridian === 'PM' && hour !== 12) hour += 12;
    if (meridian === 'AM' && hour === 12) hour = 0;
    return hour;
  };

  const filtered = allRides.filter(r => {
    if (verifiedOnly && !r.driverInfo?.isVerified) return false;

    if (timeRange !== 'any') {
      const hour = getHour(r.time);
      if (hour === null) return false;
      if (timeRange === 'morning'   && !(hour >= 5  && hour < 12)) return false;
      if (timeRange === 'afternoon' && !(hour >= 12 && hour < 17)) return false;
      if (timeRange === 'evening'   && !(hour >= 17 && hour < 22)) return false;
    }

    return true;
  });

  const handleSearch = () => {
    setSearched(true);
    fetchRides();
  };

  const activeFilters = [
    priceRange[1] < 2000 && `Under LKR ${priceRange[1]}`,
    timeRange !== 'any'  && timeSlots.find(t=>t.value===timeRange)?.label,
    verifiedOnly         && 'Verified only',
    seats > 1            && `${seats} seats`,
  ].filter(Boolean);

  const clearFilters = () => {
    setPriceRange([0,2000]);
    setTimeRange('any');
    setVerifiedOnly(false);
    setSearched(false);
  };

  return (
    <div className="src-page">

      <div className="src-hero">
        <div className="src-hero-inner">
          <h1 className="src-hero-title">Find your next ride</h1>
          <p className="src-hero-sub">Search from real rides posted by verified drivers</p>

          <div className="src-search-bar">
            <div className="src-search-field">
              <svg className="src-search-field-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="7" r="3" stroke="#2563eb" strokeWidth="1.3"/>
                <path d="M8 2C5.239 2 3 4.239 3 7c0 3.5 5 9 5 9s5-5.5 5-9c0-2.761-2.239-5-5-5z" stroke="#2563eb" strokeWidth="1.3"/>
              </svg>
              <div className="src-search-field-inner">
                <label className="src-search-label">From</label>
                <input
                  list="from-cities"
                  className="src-search-input"
                  placeholder="Departure city"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <datalist id="from-cities">
                  {SR_CITIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>

            <div className="src-swap-btn" onClick={() => { const t=from; setFrom(to); setTo(t); }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 6l3-3 3 3M6 3v9M10 10l3 3 3-3M13 13V4" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className="src-search-field">
              <svg className="src-search-field-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2C5.239 2 3 4.239 3 7c0 3.5 5 9 5 9s5-5.5 5-9c0-2.761-2.239-5-5-5z" stroke="#94a3b8" strokeWidth="1.3"/>
                <circle cx="8" cy="7" r="2" fill="#94a3b8"/>
              </svg>
              <div className="src-search-field-inner">
                <label className="src-search-label">To</label>
                <input
                  list="to-cities"
                  className="src-search-input"
                  placeholder="Destination city"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <datalist id="to-cities">
                  {SR_CITIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>

            <div className="src-search-divider" />

            <div className="src-search-field">
              <svg className="src-search-field-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" stroke="#94a3b8" strokeWidth="1.3"/>
                <path d="M5 1v3M11 1v3M1.5 6.5h13" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <div className="src-search-field-inner">
                <label className="src-search-label">Date</label>
                <input
                  type="date"
                  className="src-search-input"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="src-search-divider" />

            <div className="src-search-field seats-field">
              <svg className="src-search-field-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="2.5" stroke="#94a3b8" strokeWidth="1.3"/>
                <path d="M2.5 14c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <div className="src-search-field-inner">
                <label className="src-search-label">Seats</label>
                <div className="src-seat-counter">
                  <button onClick={() => setSeats(Math.max(1, seats-1))}>−</button>
                  <span>{seats}</span>
                  <button onClick={() => setSeats(Math.min(8, seats+1))}>+</button>
                </div>
              </div>
            </div>

            <button className="src-search-btn" onClick={handleSearch}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="8" cy="8" r="5.5" stroke="white" strokeWidth="1.5"/>
                <path d="M12.5 12.5L16 16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="src-body">

        <aside className={`src-sidebar ${showFilters ? 'open' : ''}`}>
          <div className="src-sidebar-header">
            <h3 className="src-sidebar-title">Filters</h3>
            <button className="src-clear-btn" onClick={clearFilters}>
              Clear all
            </button>
          </div>

          <div className="src-filter-group">
            <label className="src-filter-label">Price range</label>
            <div className="src-price-display">
              <span>LKR {priceRange[0].toLocaleString()}</span>
              <span>LKR {priceRange[1].toLocaleString()}</span>
            </div>
            <div className="src-range-wrap">
              <input
                type="range" min="0" max="2000" step="50"
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                onMouseUp={fetchRides}
                onTouchEnd={fetchRides}
                className="src-range"
              />
            </div>
            <div className="src-price-presets">
              {[[0,500],[0,1000],[0,1500]].map(([mn,mx]) => (
                <button
                  key={mx}
                  className={`src-preset ${priceRange[0]===mn && priceRange[1]===mx ? 'active':''}`}
                  onClick={() => { setPriceRange([mn,mx]); setTimeout(fetchRides, 0); }}
                >
                  Under {mx.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="src-filter-group">
            <label className="src-filter-label">Departure time</label>
            <div className="src-time-options">
              {timeSlots.map(t => (
                <button
                  key={t.value}
                  className={`src-time-opt ${timeRange===t.value ? 'active':''}`}
                  onClick={() => setTimeRange(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="src-filter-group">
            <label className="src-filter-label">Sort by</label>
            <div className="src-sort-options">
              {[
                { value:'time',       label:'Earliest first' },
                { value:'price-asc',  label:'Price: Low to high' },
                { value:'price-desc', label:'Price: High to low' },
                { value:'rating',     label:'Top rated' },
              ].map(s => (
                <button
                  key={s.value}
                  className={`src-sort-opt ${sortBy===s.value ? 'active':''}`}
                  onClick={() => { setSortBy(s.value); setTimeout(fetchRides, 0); }}
                >
                  {sortBy===s.value && <span className="src-sort-check">✓</span>}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="src-filter-group">
            <label className="src-filter-label">Driver verification</label>
            <label className="src-toggle-row">
              <div className={`src-toggle ${verifiedOnly ? 'on':''}`} onClick={() => setVerifiedOnly(!verifiedOnly)}>
                <div className="src-toggle-thumb" />
              </div>
              <span className="src-toggle-label">Verified drivers only</span>
            </label>
          </div>
        </aside>

        <div className="src-results">
          <div className="src-results-header">
            <span className="src-results-badge">
              {loading ? 'Checking availability...' : `${filtered.length} ride${filtered.length === 1 ? '' : 's'} available`}
            </span>
            <div className="src-results-actions">
              {activeFilters.length > 0 && (
                <div className="src-active-filters">
                  {activeFilters.map((f,i) => (
                    <span key={i} className="src-filter-tag">{f}</span>
                  ))}
                </div>
              )}
              <button className="src-filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M1 3h13M3 7.5h9M6 12h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Filters {activeFilters.length > 0 && <span className="src-filter-count">{activeFilters.length}</span>}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="src-cards-list">
              {[1,2,3].map(i => (
                <div key={i} style={{ background:'white', border:'1px solid #e8edf5', borderRadius:18, padding:24, height:160, opacity:0.5 }} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="src-cards-list">
              {filtered.map(ride => <RideCard key={ride.id} ride={ride} />)}
            </div>
          ) : (
            <div className="src-empty">
              <div className="src-empty-icon">🔍</div>
              <h3 className="src-empty-title">No rides found</h3>
              <p className="src-empty-sub">Try adjusting your filters or search for a different route.</p>
              <button className="src-empty-btn" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;