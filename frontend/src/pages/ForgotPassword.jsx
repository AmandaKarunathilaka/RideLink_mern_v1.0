import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api   from '../api/axiosConfig.js';

const fontHead = { fontFamily: 'Syne, sans-serif' };
const fontBody = { fontFamily: 'DM Sans, sans-serif' };

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step,     setStep]     = useState(1); // 1=email verify, 2=new password, 3=done
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Step 1 — verify email exists
  const handleVerifyEmail = async () => {
    if (!email.trim()) { toast.error('Please enter your email'); return; }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) { toast.error('Please enter a valid email address'); return; }

    setLoading(true);
    try {
      await api.post('/auth/verify-email', { email });
      toast.success('Email verified ✅');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No account found with this email');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — set new password
  const handleResetPassword = async () => {
    if (!password) { toast.error('Please enter a new password'); return; }
    if (password.length < 8)         { toast.error('Password must be at least 8 characters'); return; }
    if (!/[0-9]/.test(password))     { toast.error('Password must contain at least one number'); return; }
    if (!/[A-Z]/.test(password))     { toast.error('Password must contain at least one uppercase letter'); return; }
    if (password !== confirm)        { toast.error('Passwords do not match'); return; }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, newPassword: password });
      toast.success('Password reset successfully! 🎉');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 11,
    border: '1.5px solid #e2e8f0',
    fontSize: 14,
    ...fontBody,
    outline: 'none',
    background: '#f8faff',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ ...fontBody, minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8edf5', padding: '36px 32px', maxWidth: 420, width: '100%', boxShadow: '0 8px 32px rgba(15,23,42,0.06)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 16, ...fontHead }}>RL</span>
          </div>
          <h1 style={{ ...fontHead, fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
            {step === 1 && 'Forgot Password?'}
            {step === 2 && 'Set New Password'}
            {step === 3 && 'Password Reset!'}
          </h1>
          <p style={{ ...fontBody, fontSize: 13, color: '#64748b' }}>
            {step === 1 && 'Enter your email to continue'}
            {step === 2 && `Creating new password for ${email}`}
            {step === 3 && 'Your password has been updated successfully'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 999, background: s <= step ? '#2563eb' : '#e2e8f0', transition: 'background 0.3s ease' }} />
          ))}
        </div>

        {/* ── STEP 1 — Email ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerifyEmail()}
                placeholder="you@example.com"
                style={inputStyle}
              />
              <p style={{ ...fontBody, fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                Enter the email address linked to your RideLink account
              </p>
            </div>

            <button
              onClick={handleVerifyEmail}
              disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', border: 'none', borderRadius: 13, fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', ...fontBody, boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.3)' }}
            >
              {loading ? 'Verifying...' : 'Continue →'}
            </button>
          </div>
        )}

        {/* ── STEP 2 — New Password ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Password rules */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ ...fontBody, fontSize: 12, color: '#1d4ed8', fontWeight: 500, marginBottom: 4 }}>Password requirements:</p>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {[
                  { rule: 'At least 8 characters', pass: password.length >= 8 },
                  { rule: 'At least one number',   pass: /[0-9]/.test(password) },
                  { rule: 'At least one uppercase', pass: /[A-Z]/.test(password) },
                ].map((r, i) => (
                  <li key={i} style={{ ...fontBody, fontSize: 12, color: r.pass ? '#10b981' : '#64748b', listStyle: 'none', marginBottom: 2 }}>
                    {r.pass ? '✅' : '○'} {r.rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* New password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{ ...inputStyle, paddingRight: 44 }}
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Confirm New Password
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                placeholder="Re-enter new password"
                style={{
                  ...inputStyle,
                  border: `1.5px solid ${confirm && confirm !== password ? '#fca5a5' : '#e2e8f0'}`,
                }}
              />
              {confirm && confirm !== password && (
                <p style={{ ...fontBody, fontSize: 11, color: '#ef4444', marginTop: 4 }}>
                  Passwords do not match
                </p>
              )}
              {confirm && confirm === password && password.length >= 8 && (
                <p style={{ ...fontBody, fontSize: 11, color: '#10b981', marginTop: 4 }}>
                  ✅ Passwords match
                </p>
              )}
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading || password !== confirm || password.length < 8}
              style={{ width: '100%', padding: '13px', background: (loading || password !== confirm || password.length < 8) ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', border: 'none', borderRadius: 13, fontSize: 15, fontWeight: 500, cursor: (loading || password !== confirm || password.length < 8) ? 'not-allowed' : 'pointer', ...fontBody }}
            >
              {loading ? 'Resetting...' : 'Reset Password →'}
            </button>

            <button
              onClick={() => { setStep(1); setPassword(''); setConfirm(''); }}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 13, cursor: 'pointer', ...fontBody, fontWeight: 500, padding: 0 }}
            >
              ← Change email
            </button>
          </div>
        )}

        {/* ── STEP 3 — Done ── */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <p style={{ ...fontBody, fontSize: 14, color: '#64748b', marginBottom: 28 }}>
              You can now sign in with your new password.
            </p>
            <Link
              to="/login"
              style={{ display: 'inline-block', padding: '12px 32px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', borderRadius: 13, fontSize: 15, fontWeight: 500, textDecoration: 'none', ...fontBody, boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}
            >
              Sign In →
            </Link>
          </div>
        )}

        {step !== 3 && (
          <p style={{ ...fontBody, fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 20 }}>
            Remember your password?{' '}
            <Link to="/login" style={{ color: '#2563eb', fontWeight: 500 }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;