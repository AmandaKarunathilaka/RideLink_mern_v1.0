import { useState, useRef }    from 'react';
import { useNavigate }         from 'react-router-dom';
import toast                   from 'react-hot-toast';
import { useAuth }             from '../../context/AuthContext.jsx';
import { uploadLicenseApi }    from '../../api/driverApi.js';

const UploadLicense = () => {
  const [file,        setFile]        = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [dragOver,    setDragOver]    = useState(false);
  const fileInputRef = useRef(null);
  const { user, login }     = useAuth();
  const navigate     = useNavigate();

  const handleFileSelect = (selectedFile) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowed.includes(selectedFile.type)) {
      toast.error('Only JPG, PNG and PDF files are allowed');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    setFile(selectedFile);
    if (selectedFile.type !== 'application/pdf') {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview('pdf');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('license', file);

    setLoading(true);
    try {
      const res = await uploadLicenseApi(formData);

      // ← Refresh auth context so dashboard shows "pending" immediately
      const token = localStorage.getItem('token');
      login(token, res.data.user);

      toast.success('License uploaded! Waiting for admin approval.');
      navigate('/driver/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  // Already approved
  if (user?.licenseStatus === 'approved') {
    return (
      <div style={{ padding:'120px 24px 48px', maxWidth:600, margin:'0 auto', textAlign:'center' }}>
        <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:700, color:'#0f172a', marginBottom:8 }}>
          License Already Approved
        </h2>
        <p style={{ color:'#64748b', marginBottom:24 }}>
          Your driving license has been verified. You can now post rides.
        </p>
        <button
          onClick={() => navigate('/driver/dashboard')}
          style={{ background:'#2563eb', color:'white', border:'none', padding:'12px 28px', borderRadius:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:14, fontWeight:500 }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Already pending
  if (user?.licenseStatus === 'pending') {
    return (
      <div style={{ padding:'120px 24px 48px', maxWidth:600, margin:'0 auto', textAlign:'center' }}>
        <div style={{ fontSize:64, marginBottom:16 }}>⏳</div>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:700, color:'#0f172a', marginBottom:8 }}>
          Under Review
        </h2>
        <p style={{ color:'#64748b', marginBottom:24 }}>
          Your license has been submitted and is waiting for admin approval. We'll notify you once it's reviewed.
        </p>
        <button
          onClick={() => navigate('/driver/dashboard')}
          style={{ background:'#2563eb', color:'white', border:'none', padding:'12px 28px', borderRadius:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:14, fontWeight:500 }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding:'120px 24px 64px', maxWidth:640, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <button
            onClick={() => navigate('/driver/dashboard')}
            style={{ background:'#f1f5f9', border:'none', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:13, color:'#64748b', fontFamily:'DM Sans,sans-serif' }}
          >
            ← Back
          </button>
        </div>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:700, color:'#0f172a', marginBottom:8 }}>
          Upload Driving License
        </h1>
        <p style={{ color:'#64748b', fontSize:15, lineHeight:1.6 }}>
          Upload a clear photo or scan of your driving license to get verified. Once approved, you can start posting rides.
        </p>
      </div>

      {/* Info Box */}
      <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:12, padding:'14px 18px', marginBottom:28, display:'flex', gap:12 }}>
        <span style={{ fontSize:20 }}>ℹ️</span>
        <div>
          <p style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:600, color:'#1e40af', marginBottom:4 }}>Requirements</p>
          <ul style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:'#1d4ed8', margin:0, padding:'0 0 0 16px', lineHeight:1.8 }}>
            <li>Clear and readable — all details must be visible</li>
            <li>Valid Sri Lankan driving license</li>
            <li>File format: JPG, PNG or PDF</li>
            <li>Maximum file size: 5MB</li>
          </ul>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border:        `2px dashed ${dragOver ? '#2563eb' : file ? '#10b981' : '#cbd5e1'}`,
          borderRadius:  16,
          padding:       '40px 24px',
          textAlign:     'center',
          cursor:        'pointer',
          background:    dragOver ? '#eff6ff' : file ? '#f0fdf4' : '#f8faff',
          transition:    'all 0.2s ease',
          marginBottom:  24,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          style={{ display:'none' }}
          onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
        />

        {/* Preview */}
        {preview && preview !== 'pdf' && (
          <img
            src={preview}
            alt="License preview"
            style={{ maxHeight:180, maxWidth:'100%', borderRadius:8, marginBottom:16, objectFit:'contain' }}
          />
        )}

        {preview === 'pdf' && (
          <div style={{ fontSize:48, marginBottom:12 }}>📄</div>
        )}

        {!file ? (
          <>
            <div style={{ fontSize:40, marginBottom:12 }}>📁</div>
            <p style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:600, color:'#0f172a', marginBottom:4 }}>
              Drop your license here
            </p>
            <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:'#94a3b8' }}>
              or click to browse — JPG, PNG, PDF up to 5MB
            </p>
          </>
        ) : (
          <>
            <p style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:600, color:'#10b981', marginBottom:4 }}>
              ✓ {file.name}
            </p>
            <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:'#64748b' }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change
            </p>
          </>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        style={{
          width:        '100%',
          padding:      '14px',
          background:   file && !loading ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : '#e2e8f0',
          color:        file && !loading ? 'white' : '#94a3b8',
          border:       'none',
          borderRadius: 13,
          fontFamily:   'DM Sans,sans-serif',
          fontSize:     15,
          fontWeight:   500,
          cursor:       file && !loading ? 'pointer' : 'not-allowed',
          transition:   'all 0.2s ease',
          boxShadow:    file && !loading ? '0 4px 16px rgba(37,99,235,0.35)' : 'none',
        }}
      >
        {loading ? 'Uploading...' : 'Submit License for Verification'}
      </button>

      <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:'#94a3b8', textAlign:'center', marginTop:16 }}>
        🔒 Your document is stored securely and only reviewed by RideLink admins
      </p>
    </div>
  );
};

export default UploadLicense;