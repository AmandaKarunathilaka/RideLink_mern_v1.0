import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getPendingLicensesApi,
  getAllUsersApi,
  getAllRidesApi,
  getAllBookingsApi,
  getAdminStatsApi,
  verifyDriverApi,
  adminCancelRideApi,
} from '../../api/adminApi.js';

const fontHead = { fontFamily: 'Syne, sans-serif' };
const fontBody = { fontFamily: 'DM Sans, sans-serif' };

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('pending');

  const [pending,     setPending]     = useState([]);
  const [allUsers,    setAllUsers]    = useState([]);
  const [allRides,    setAllRides]    = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [actionId,    setActionId]    = useState(null);
  const [previewDoc,  setPreviewDoc]  = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote,  setRejectNote]  = useState('');
  const [rideFilter,  setRideFilter]  = useState('all');
  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  // A ride is "effectively completed" if still active in DB but date has passed
  const isEffectivelyCompleted = (r) =>
    r.status === 'active' && r.date < today;

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pendingRes, usersRes, ridesRes, bookingsRes, statsRes] = await Promise.all([
        getPendingLicensesApi(),
        getAllUsersApi(),
        getAllRidesApi(),
        getAllBookingsApi(),
        getAdminStatsApi(),
      ]);
      setPending(pendingRes.data.drivers      || []);
      setAllUsers(usersRes.data.users         || []);
      setAllRides(ridesRes.data.rides         || []);
      setAllBookings(bookingsRes.data.bookings || []);
      setStats(statsRes.data.stats);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Ride filter count helper ──
  const getRideCount = (f) => {
    if (f === 'all')       return allRides.length;
    if (f === 'completed') return allRides.filter(r => r.status === 'completed' || isEffectivelyCompleted(r)).length;
    if (f === 'active')    return allRides.filter(r => r.status === 'active' && !isEffectivelyCompleted(r)).length;
    return allRides.filter(r => r.status === f).length;
  };

  // ── Filtered rides ──
  const filteredRides =
    rideFilter === 'all'       ? allRides
    : rideFilter === 'completed' ? allRides.filter(r => r.status === 'completed' || isEffectivelyCompleted(r))
    : rideFilter === 'active'    ? allRides.filter(r => r.status === 'active' && !isEffectivelyCompleted(r))
    : allRides.filter(r => r.status === rideFilter);

  const handleApprove = async (driverId) => {
    setActionId(driverId);
    try {
      await verifyDriverApi(driverId, { status: 'approved' });
      toast.success('Driver approved ✅');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) { toast.error('Please provide a reason'); return; }
    setActionId(rejectModal.id);
    try {
      await verifyDriverApi(rejectModal.id, { status: 'rejected', adminNote: rejectNote });
      toast.success('License rejected');
      setRejectModal(null);
      setRejectNote('');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const handleCancelRide = async (rideId) => {
    setActionId(rideId);
    try {
      await adminCancelRideApi(rideId);
      toast.success('Ride cancelled');
      setCancelConfirmId(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel ride');
    } finally {
      setActionId(null);
    }
  };

  const tabs = [
    { id: 'pending',  label: `Pending ${pending.length > 0 ? `(${pending.length})` : ''}` },
    { id: 'rides',    label: `Rides (${allRides.length})` },
    { id: 'bookings', label: `Bookings (${allBookings.length})` },
    { id: 'users',    label: `Users (${allUsers.length})` },
  ];

  const statusBadge = (status, map) => {
    const s = map[status] || map.default;
    return (
      <span style={{ fontSize: 11, fontWeight: 500, background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '3px 9px', borderRadius: 999 }}>
        {s.label}
      </span>
    );
  };

  const rideStatusMap = {
    active:    { bg: '#ecfdf5', color: '#166634', border: '#86efac', label: 'Active' },
    cancelled: { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5', label: 'Cancelled' },
    completed: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe', label: 'Completed' },
    default:   { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: 'Unknown' },
  };

  const bookingStatusMap = {
    confirmed: { bg: '#ecfdf5', color: '#166634', border: '#86efac', label: 'Confirmed' },
    cancelled: { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5', label: 'Cancelled' },
    completed: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe', label: 'Completed' },
    default:   { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: 'Unknown' },
  };

  // Helper to detect if data is PDF
  const isPdfData = (data) => {
    if (!data) return false;
    if (data.startsWith('data:application/pdf')) return true;
    if (typeof data === 'string' && data.startsWith('JVBERi')) return true;
    return false;
  };

  // Helper to convert raw base64 to data URL
  const getPdfDataUrl = (data) => {
    if (!data) return null;
    if (data.startsWith('data:application/pdf')) return data;
    if (data.startsWith('JVBERi')) return `data:application/pdf;base64,${data}`;
    return null;
  };

  // Helper to validate if PDF data is complete
  const isValidPdfData = (data) => {
    if (!data) return false;
    const pdfData = getPdfDataUrl(data);
    if (!pdfData) return false;
    const base64Part = pdfData.split(',')[1] || data;
    return base64Part && base64Part.length > 100;
  };

  // Function to open PDF directly
  const openPdfDirectly = (pdfDataUrl) => {
    try {
      const base64Data = pdfDataUrl.split(',')[1];
      const binaryData = atob(base64Data);
      const arrayBuffer = new ArrayBuffer(binaryData.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }
      const blob = new Blob([uint8Array], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      window.open(url, '_blank');
      
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      
      toast.success('PDF opened successfully');
    } catch (error) {
      toast.error('Failed to open PDF: ' + error.message);
    }
  };

  return (
    <div style={{ ...fontBody, background: '#f1f5f9', minHeight: '100vh', paddingTop: 100, paddingBottom: 64 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ ...fontHead, fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#64748b' }}>Welcome, {user?.name} 👋</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 28 }}>
            {[
              { icon: '👥', label: 'Total Users',      value: stats.totalUsers,        bg: '#eff6ff', color: '#1d4ed8' },
              { icon: '🚗', label: 'Drivers',          value: stats.totalDrivers,      bg: '#ecfdf5', color: '#166634' },
              { icon: '🧍', label: 'Passengers',       value: stats.totalPassengers,   bg: '#fefce8', color: '#92400e' },
              { icon: '✅', label: 'Verified Drivers', value: stats.verifiedDrivers,   bg: '#f5f3ff', color: '#7e22ce' },
              { icon: '🛣️', label: 'Total Rides',      value: stats.totalRides,        bg: '#fff7ed', color: '#c2410c' },
              { icon: '🎫', label: 'Total Bookings',   value: stats.totalBookings,     bg: '#fdf2f8', color: '#9d174d' },
              { icon: '🏁', label: 'Completed',        value: stats.completedBookings, bg: '#eff6ff', color: '#1e40af' },
              { icon: '❌', label: 'Cancelled',        value: stats.cancelledBookings, bg: '#fef2f2', color: '#991b1b' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #e8edf5', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ ...fontHead, fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ ...fontBody, fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 20, background: 'white', borderRadius: 12, padding: 4, border: '1px solid #e8edf5', width: 'fit-content', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: tab === t.id ? '#2563eb' : 'transparent', color: tab === t.id ? 'white' : '#64748b', fontWeight: tab === t.id ? 600 : 400, fontSize: 13, cursor: 'pointer', ...fontBody, transition: 'all 0.2s' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 64, color: '#94a3b8' }}>Loading...</div>
        ) : (

          /* ── PENDING VERIFICATIONS ── */
          tab === 'pending' ? (
            pending.length === 0 ? (
              <div style={{ background: 'white', border: '1px solid #e8edf5', borderRadius: 16, padding: 64, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <h3 style={{ ...fontHead, fontSize: 17, color: '#0f172a', marginBottom: 6 }}>No pending verifications</h3>
                <p style={{ color: '#94a3b8', fontSize: 14 }}>All driver licenses have been reviewed.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pending.map(driver => (
                  <div key={driver.id} style={{ background: 'white', border: '1px solid #e8edf5', borderRadius: 16, padding: '20px 22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, ...fontHead, fontSize: 16, flexShrink: 0 }}>
                          {driver.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ ...fontHead, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{driver.name}</div>
                          <div style={{ fontSize: 13, color: '#64748b' }}>{driver.email}</div>
                          <span style={{ fontSize: 11, fontWeight: 500, color: '#92400e', background: '#fef9c3', padding: '2px 8px', borderRadius: 999, marginTop: 4, display: 'inline-block' }}>
                            ⏳ Pending Review
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setPreviewDoc(driver)}
                          style={{ padding: '8px 14px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: 'white', color: '#374151', fontSize: 13, cursor: 'pointer', ...fontBody }}
                        >
                          📄 View License
                        </button>
                        <button
                          onClick={() => handleApprove(driver.id)}
                          disabled={actionId === driver.id}
                          style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: '#10b981', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: actionId === driver.id ? 0.6 : 1 }}
                        >
                          {actionId === driver.id ? '...' : '✓ Approve'}
                        </button>
                        <button
                          onClick={() => setRejectModal(driver)}
                          disabled={actionId === driver.id}
                          style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: '#ef4444', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )

          /* ── ALL RIDES ── */
          ) : tab === 'rides' ? (
            <div>
              {/* Ride filter buttons — with dynamic completed count */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {['all', 'active', 'cancelled', 'completed'].map(f => (
                  <button
                    key={f}
                    onClick={() => setRideFilter(f)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: '1.5px solid',
                      borderColor: rideFilter === f ? '#2563eb' : '#e2e8f0',
                      background:  rideFilter === f ? '#eff6ff' : 'white',
                      color:       rideFilter === f ? '#1d4ed8' : '#64748b',
                      fontSize: 12, fontWeight: rideFilter === f ? 600 : 400,
                      cursor: 'pointer', textTransform: 'capitalize', ...fontBody,
                    }}
                  >
                    {`${f.charAt(0).toUpperCase() + f.slice(1)} (${getRideCount(f)})`}
                  </button>
                ))}
              </div>

              <div style={{ background: 'white', border: '1px solid #e8edf5', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8faff', borderBottom: '1px solid #e8edf5' }}>
                        {['Driver','Route','Date','Time','Seats','Price','Status','Action'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '11px 16px', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRides.map(ride => {
                        const effectiveStatus = isEffectivelyCompleted(ride) ? 'completed' : ride.status;
                        return (
                          <tr key={ride.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151', fontWeight: 500 }}>
                              {ride.driverInfo?.name || '—'}
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#0f172a', fontWeight: 600, whiteSpace: 'nowrap' }}>
                              {ride.origin} → {ride.destination}
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>
                              {new Date(ride.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{ride.time}</td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>
                              {ride.seatsLeft}/{ride.totalSeats}
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#1d4ed8', fontWeight: 600 }}>
                              LKR {ride.price?.toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {statusBadge(effectiveStatus, rideStatusMap)}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {ride.status === 'active' && ride.date >= today && (
                                cancelConfirmId === ride.id ? (
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                      onClick={() => setCancelConfirmId(null)}
                                      style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #e2e8f0', background: 'white', fontSize: 11, cursor: 'pointer', ...fontBody }}
                                    >
                                      Keep
                                    </button>
                                    <button
                                      onClick={() => handleCancelRide(ride.id)}
                                      disabled={actionId === ride.id}
                                      style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: '#ef4444', color: 'white', fontSize: 11, cursor: 'pointer', ...fontBody }}
                                    >
                                      {actionId === ride.id ? '...' : 'Yes'}
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setCancelConfirmId(ride.id)}
                                    style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', fontSize: 11, fontWeight: 500, cursor: 'pointer', ...fontBody }}
                                  >
                                    Cancel
                                  </button>
                                )
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredRides.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>No rides found</div>
                  )}
                </div>
              </div>
            </div>

          /* ── ALL BOOKINGS ── */
          ) : tab === 'bookings' ? (
            <div style={{ background: 'white', border: '1px solid #e8edf5', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8faff', borderBottom: '1px solid #e8edf5' }}>
                      {['Passenger','Route','Date','Seats','Total','Booked On','Status'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '11px 16px', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allBookings.map((booking, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151', fontWeight: 500 }}>
                          {booking.passengerInfo?.name || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#0f172a', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {booking.rideInfo ? `${booking.rideInfo.origin} → ${booking.rideInfo.destination}` : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>
                          {booking.rideInfo?.date
                            ? new Date(booking.rideInfo.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
                            : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>
                          {booking.seatsBooked}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#1d4ed8', fontWeight: 600 }}>
                          LKR {booking.totalPrice?.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                          {new Date(booking.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {statusBadge(booking.status, bookingStatusMap)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allBookings.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>No bookings found</div>
                )}
              </div>
            </div>

          /* ── ALL USERS ── */
          ) : (
            <div style={{ background: 'white', border: '1px solid #e8edf5', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8faff', borderBottom: '1px solid #e8edf5' }}>
                      {['Name','Email','Role','License Status','Joined'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '11px 16px', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: '#0f172a', fontWeight: 500 }}>{u.name}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{u.email}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 999, background: u.role==='admin'?'#fee2e2':u.role==='driver'?'#dcfce7':'#dbeafe', color: u.role==='admin'?'#991b1b':u.role==='driver'?'#166634':'#1e40af' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>
                          {u.role === 'driver' ? (u.licenseStatus || '—') : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>

      {/* ── Document Preview Modal ── */}
      {previewDoc && (
        <div onClick={() => setPreviewDoc(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, padding: 24, maxWidth: 600, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ ...fontHead, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{previewDoc?.name}'s License</h3>
              <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>

            {previewDoc?.licenseDocument ? (
              (() => {
                const isPdf = isPdfData(previewDoc.licenseDocument);
                const pdfDataUrl = isPdf ? getPdfDataUrl(previewDoc.licenseDocument) : null;
                const isValid = isPdf ? isValidPdfData(pdfDataUrl) : false;
                
                if (isPdf) {
                  return (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                      <h4 style={{ ...fontHead, fontSize: 15, color: '#0f172a', marginBottom: 8 }}>
                        PDF License Document
                      </h4>
                      
                      {isValid ? (
                        <>
                          <p style={{ color: '#64748b', marginBottom: 16, fontSize: 14 }}>
                            Click the button below to view the PDF
                          </p>
                          
                          <button
                            onClick={() => openPdfDirectly(pdfDataUrl)}
                            style={{
                              padding: '12px 32px',
                              background: '#2563eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: 10,
                              fontWeight: 500,
                              fontSize: 14,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                              fontFamily: 'DM Sans, sans-serif'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 6px 20px rgba(37,99,235,0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)';
                            }}
                          >
                            📄 View PDF
                          </button>
                        </>
                      ) : (
                        <div>
                          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                          <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 8 }}>
                            The PDF data appears to be incomplete or corrupted.
                          </p>
                          <p style={{ color: '#64748b', fontSize: 13 }}>
                            Please ask the driver to re-upload their license document.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                } else if (previewDoc.licenseDocument.startsWith('data:')) {
                  return (
                    <img
                      src={previewDoc.licenseDocument}
                      alt="License document"
                      style={{ width: '100%', borderRadius: 10 }}
                    />
                  );
                } else {
                  return (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                      <p style={{ color: '#94a3b8', fontSize: 14 }}>
                        This license was uploaded in an unsupported format.<br/>
                        Please ask the driver to re-upload their license.
                      </p>
                    </div>
                  );
                }
              })()
            ) : (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>No document found</p>
            )}
            
            {/* Debug info */}
            {previewDoc?.licenseDocument && (
              <div style={{ 
                marginTop: 16, 
                padding: 12, 
                background: '#f8faff', 
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: 11,
                color: '#64748b',
                wordBreak: 'break-all',
                maxHeight: 80,
                overflowY: 'auto'
              }}>
                <strong>Debug:</strong> 
                {' '}Type: {isPdfData(previewDoc.licenseDocument) ? 'PDF' : 'Other'}
                {' '}| Length: {previewDoc.licenseDocument.length} characters
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectModal && (
        <div onClick={() => setRejectModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, padding: 28, maxWidth: 420, width: '100%' }}>
            <h3 style={{ ...fontHead, fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Reject {rejectModal.name}'s License</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Provide a reason — this will be shown to the driver.</p>
            <textarea
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder="e.g. Image is blurry, please re-upload a clearer photo"
              rows={3}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'DM Sans,sans-serif', resize: 'none', marginBottom: 16, outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setRejectModal(null); setRejectNote(''); }} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: 'white', color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleReject} disabled={actionId === rejectModal.id} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#ef4444', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;