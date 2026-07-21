import { useState, useRef } from 'react';
import { useNavigate }      from 'react-router-dom';
import toast                from 'react-hot-toast';
import { useAuth }          from '../context/AuthContext.jsx';
import api                  from '../api/axiosConfig.js';

const fontHead = { fontFamily: 'Syne, sans-serif' };
const fontBody = { fontFamily: 'DM Sans, sans-serif' };

const inputStyle = (focused) => ({
  width: '100%',
  padding: '11px 14px',
  borderRadius: 11,
  border: `1.5px solid ${focused ? '#2563eb' : '#e2e8f0'}`,
  fontSize: 14,
  ...{ fontFamily: 'DM Sans, sans-serif' },
  outline: 'none',
  background: focused ? 'white' : '#f8faff',
  boxShadow: focused ? '0 0 0 3px rgba(37,99,235,0.08)' : 'none',
  transition: 'all 0.2s',
  boxSizing: 'border-box',
});

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 6,
  fontFamily: 'DM Sans, sans-serif',
};

const Profile = () => {
  const { user, login }  = useAuth();
  const navigate         = useNavigate();
  const fileInputRef     = useRef(null);

  const [name,    setName]    = useState(user?.name    || '');
  const [phone, setPhone] = useState(
    user?.phone && user.phone !== 'null' ? user.phone : ''
  );  const [saving,  setSaving]  = useState(false);
  const [uploading, setUploading] = useState(false);

  const [focusedField, setFocusedField] = useState(null);

  const licenseStatusConfig = {
    not_uploaded: { bg: '#f8faff',  border: '#bfdbfe', color: '#1e40af', icon: '📋', label: 'Not Uploaded' },
    pending:      { bg: '#fefce8',  border: '#fde68a', color: '#92400e', icon: '⏳', label: 'Under Review' },
    approved:     { bg: '#ecfdf5',  border: '#86efac', color: '#166534', icon: '✅', label: 'Approved' },
    rejected:     { bg: '#fef2f2',  border: '#fca5a5', color: '#991b1b', icon: '❌', label: 'Rejected' },
  };

  const ls = licenseStatusConfig[user?.licenseStatus] || licenseStatusConfig.not_uploaded;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    if (phone && !/^(?:\+94|0)?7[0-9]{8}$/.test(phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid Sri Lankan mobile number');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/users/profile', { name: name.trim(), phone: phone.trim() });
      // Update auth context with new user data
      const token = localStorage.getItem('token');
      login(token, res.data.user);
      toast.success('Profile updated successfully ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPG and PNG images are allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    setUploading(true);
    try {
      const res = await api.post('/users/upload-profile', formData);
      const token = localStorage.getItem('token');
      login(token, res.data.user);
      toast.success('Profile photo updated ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Photo upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin')     return '/admin/dashboard';
    if (user?.role === 'driver')    return '/driver/dashboard';
    return '/passenger/dashboard';
  };

  const roleColors = {
    passenger: { bg: '#eff6ff', color: '#1d4ed8' },
    driver:    { bg: '#ecfdf5', color: '#166534' },
    admin:     { bg: '#fef2f2', color: '#991b1b' },
  };
  const rc = roleColors[user?.role] || roleColors.passenger;

  return (
    <div style={{ ...fontBody, background: '#f1f5f9', minHeight: '100vh', paddingTop: 100, paddingBottom: 64 }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px' }}>

        {/* Back */}
        <button
          onClick={() => navigate(getDashboardLink())}
          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          ← Back to Dashboard
        </button>

        <h1 style={{ ...fontHead, fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
          My Profile
        </h1>
        <p style={{ ...fontBody, fontSize: 14, color: '#64748b', marginBottom: 28 }}>
          Manage your personal information and account settings
        </p>

        {/* ── Avatar Card ── */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8edf5', padding: '28px 28px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              
              {user?.profileImage && user.profileImage !== 'null' && user.profileImage.startsWith('data:') ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e8edf5' }}
                />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 30, fontWeight: 700, fontFamily: 'Syne,sans-serif' }}>
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#2563eb', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12 }}
              >
                {uploading ? '⏳' : '✏️'}
              </button>
              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handlePhotoUpload} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ ...fontHead, fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                {user?.name}
              </div>
              <div style={{ ...fontBody, fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                {user?.email}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, background: rc.bg, color: rc.color, padding: '3px 10px', borderRadius: 999, textTransform: 'capitalize' }}>
                {user?.role}
              </span>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{ padding: '9px 18px', background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer', ...fontBody }}
            >
              {uploading ? 'Uploading...' : '📷 Change Photo'}
            </button>
          </div>
        </div>

        {/* ── Personal Info Card ── */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8edf5', padding: '28px 28px', marginBottom: 20 }}>
          <h2 style={{ ...fontHead, fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
            Personal Information
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                style={inputStyle(focusedField === 'name')}
                placeholder="Your full name"
              />
            </div>

            {/* Email — read only */}
            <div>
              <label style={labelStyle}>Email Address <span style={{ color: '#94a3b8', fontSize: 11 }}>(cannot be changed)</span></label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                style={{ ...inputStyle(false), background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={labelStyle}>
                Mobile Number
                {user?.role === 'driver' && (
                  <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>
                )}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                style={inputStyle(focusedField === 'phone')}
                placeholder="07X XXX XXXX"
              />
              {user?.role === 'driver' && (
                <p style={{ ...fontBody, fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  Shown to passengers as emergency contact on your ride cards
                </p>
              )}
            </div>

            {/* Role — read only */}
            <div>
              <label style={labelStyle}>Account Role <span style={{ color: '#94a3b8', fontSize: 11 }}>(cannot be changed)</span></label>
              <input
                type="text"
                value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || ''}
                readOnly
                style={{ ...inputStyle(false), background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed', textTransform: 'capitalize' }}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{ marginTop: 24, width: '100%', padding: '13px', background: saving ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', border: 'none', borderRadius: 13, fontSize: 15, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 16px rgba(37,99,235,0.3)', ...fontBody }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* ── License Status (drivers only) ── */}
        {user?.role === 'driver' && (
          <div style={{ background: ls.bg, border: `1px solid ${ls.border}`, borderRadius: 20, padding: '22px 28px', marginBottom: 20 }}>
            <h2 style={{ ...fontHead, fontSize: 16, fontWeight: 700, color: ls.color, marginBottom: 12 }}>
              {ls.icon} License Verification
            </h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ ...fontBody, fontSize: 14, fontWeight: 500, color: ls.color, marginBottom: 2 }}>
                  Status: {ls.label}
                </div>
                <div style={{ ...fontBody, fontSize: 13, color: ls.color, opacity: 0.8 }}>
                  {user?.licenseStatus === 'not_uploaded' && 'Upload your driving license to get verified'}
                  {user?.licenseStatus === 'pending'      && 'Our admin team is reviewing your license'}
                  {user?.licenseStatus === 'approved'     && 'You are verified and can post rides freely'}
                  {user?.licenseStatus === 'rejected'     && 'Please re-upload a clearer image of your license'}
                </div>
              </div>
              {(user?.licenseStatus === 'not_uploaded' || user?.licenseStatus === 'rejected') && (
                <button
                  onClick={() => navigate('/driver/upload-license')}
                  style={{ padding: '9px 18px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', ...fontBody }}
                >
                  {user?.licenseStatus === 'rejected' ? 'Re-upload License' : 'Upload License'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Account Info ── */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8edf5', padding: '22px 28px' }}>
          <h2 style={{ ...fontHead, fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
            Account Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : '—' },
              { label: 'Account type', value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) },
              { label: 'Account status', value: '✅ Active' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                <span style={{ ...fontBody, fontSize: 13, color: '#64748b' }}>{item.label}</span>
                <span style={{ ...fontBody, fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;