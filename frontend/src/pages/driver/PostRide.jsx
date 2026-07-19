import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { postRideApi } from '../../api/rideApi.js';

const PostRide = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    origin:      '',
    destination: '',
    date:        '',
    time:        '',
    totalSeats:  1,
    price:       '',
    carModel:    '',
    notes:       '',
  });

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.origin || !form.destination || !form.date || !form.time || !form.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (form.origin.trim().toLowerCase() === form.destination.trim().toLowerCase()) {
      toast.error('Origin and destination cannot be the same');
      return;
    }

    setLoading(true);
    try {
      await postRideApi({
        ...form,
        totalSeats: Number(form.totalSeats),
        price:      Number(form.price),
      });
      toast.success('Ride posted successfully! 🚗');
      navigate('/driver/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post ride');
    } finally {
      setLoading(false);
    }
  };

  const fontHead = { fontFamily: 'Syne, sans-serif' };
  const fontBody = { fontFamily: 'DM Sans, sans-serif' };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 11,
    border: '1.5px solid #e2e8f0',
    fontSize: 14,
    ...fontBody,
    outline: 'none',
    background: '#f8faff',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
    marginBottom: 6,
    ...fontBody,
  };

  // Block access if not approved
  if (user?.licenseStatus !== 'approved') {
    return (
      <div style={{ ...fontBody, padding: '120px 24px 48px', maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
        <h2 style={{ ...fontHead, fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
          License verification required
        </h2>
        <p style={{ color: '#64748b', marginBottom: 24 }}>
          You need an approved driving license before posting rides.
        </p>
        <button
          onClick={() => navigate('/driver/upload-license')}
          style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 500, ...fontBody }}
        >
          Go to License Upload
        </button>
      </div>
    );
  }

  return (
    <div style={{ ...fontBody, padding: '120px 24px 64px', maxWidth: 640, margin: '0 auto' }}>

      <button
        onClick={() => navigate('/driver/dashboard')}
        style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: '#64748b', marginBottom: 16, ...fontBody }}
      >
        ← Back
      </button>

      <h1 style={{ ...fontHead, fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
        Post a New Ride
      </h1>
      <p style={{ color: '#64748b', marginBottom: 28, fontSize: 14 }}>
        Fill in your ride details so passengers can find and book it.
      </p>

      <form onSubmit={handleSubmit}>

        {/* Origin & Destination */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
          <div>
            <label style={labelStyle}>From *</label>
            <input
              type="text"
              style={inputStyle}
              placeholder="Colombo"
              value={form.origin}
              onChange={e => update('origin', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>To *</label>
            <input
              type="text"
              style={inputStyle}
              placeholder="Kandy"
              value={form.destination}
              onChange={e => update('destination', e.target.value)}
            />
          </div>
        </div>

        {/* Date & Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
          <div>
            <label style={labelStyle}>Date *</label>
            <input
              type="date"
              style={inputStyle}
              min={new Date().toISOString().split('T')[0]}
              value={form.date}
              onChange={e => update('date', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Time *</label>
            <input
              type="time"
              style={inputStyle}
              value={form.time}
              onChange={e => update('time', e.target.value)}
            />
          </div>
        </div>

        {/* Seats & Price */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
          <div>
            <label style={labelStyle}>Available Seats *</label>
            <input
              type="number"
              min="1" max="8"
              style={inputStyle}
              value={form.totalSeats}
              onChange={e => update('totalSeats', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Price per Seat (LKR) *</label>
            <input
              type="number"
              min="0"
              style={inputStyle}
              placeholder="850"
              value={form.price}
              onChange={e => update('price', e.target.value)}
            />
          </div>
        </div>

        {/* Car Model */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Car Model (optional)</label>
          <input
            type="text"
            style={inputStyle}
            placeholder="Toyota Prius"
            value={form.carModel}
            onChange={e => update('carModel', e.target.value)}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Additional Notes (optional)</label>
          <textarea
            rows={3}
            style={{ ...inputStyle, resize: 'none' }}
            placeholder="AC available, no smoking, pickup near bus stand..."
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#1d4ed8)',
            color: 'white',
            border: 'none',
            borderRadius: 13,
            fontSize: 15,
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.35)',
            ...fontBody,
          }}
        >
          {loading ? 'Posting...' : 'Post Ride'}
        </button>
      </form>
    </div>
  );
};

export default PostRide;