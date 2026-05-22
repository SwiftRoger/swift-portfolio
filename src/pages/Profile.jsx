import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function Profile({ onBack }) {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ bio: '', birth_city: '', age: '', power_level: '' });
  const [avatarApproved, setAvatarApproved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const imgRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ bio: user.bio || '', birth_city: user.birth_city || '', age: user.age !== null ? String(user.age) : '', power_level: user.power_level || 'None' });
      setAvatarUrl(user.avatar_url || '');
      setAvatarApproved(user.avatar_approved || false);
    }
  }, [user]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) { setAvatarPreview(null); return; }
    const reader = new FileReader();
    reader.onload = (event) => setAvatarPreview(event.target.result);
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height));
  };

  const getCroppedImage = () => new Promise((resolve) => {
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = 400; canvas.height = 400;
    ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, 400, 400);
    resolve(canvas.toDataURL('image/jpeg', 0.9));
  });

  const handleSaveProfile = async () => {
    setSaving(true); setSaveError(''); setSaveSuccess('');
    try {
      const ageValue = form.age === '' ? null : parseInt(form.age);
      await updateUser({ bio: form.bio, birth_city: form.birth_city, age: ageValue, power_level: form.power_level });
      setSaveSuccess('Profile saved successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setSaveError('Failed to save profile');
    } finally { setSaving(false); }
  };

  const handleUploadAvatar = async () => {
    if (!avatarPreview) { setUploadError('Please select an image first'); return; }
    setUploading(true); setUploadError(''); setUploadSuccess('');
    try {
      const croppedImage = await getCroppedImage();
      const response = await api.post('/api/auth/avatar', { image: croppedImage });
      setUploadSuccess(response.data.message);
      setAvatarUrl(response.data.url);
      setAvatarPreview(null);
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  if (!user) { window.location.href = '/auth'; return null; }

  const inputStyle = { width: '100%', padding: '0.75rem', background: 'rgba(6,5,10,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#e8e0d0', fontFamily: '"Space Mono", monospace', fontSize: '0.9rem', outline: 'none' };
  const labelStyle = { display: 'block', marginBottom: '0.5rem', color: 'rgba(200,184,154,0.6)', fontFamily: '"Space Mono", monospace', fontSize: '0.8rem', letterSpacing: '0.1em' };

  return (
    <div style={{ minHeight: '100vh', background: '#06050a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: '"Space Mono", monospace' }}>
      <div style={{ background: 'rgba(6,5,10,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '2.5rem', width: '100%', maxWidth: '600px', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(200,184,154,0.5)', fontFamily: '"Space Mono", monospace', fontSize: '0.7rem', letterSpacing: '0.3em', cursor: 'pointer' }}>← BACK</button>
          <button onClick={() => { localStorage.removeItem('portfolio_token'); window.location.href = '/'; }} style={{ background: 'none', border: '1px solid rgba(255,100,100,0.3)', color: 'rgba(255,100,100,0.5)', fontFamily: '"Space Mono", monospace', fontSize: '0.7rem', letterSpacing: '0.3em', cursor: 'pointer', padding: '0.3rem 0.8rem' }}>LOGOUT</button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#e8e0d0', fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem', marginBottom: '0.5rem' }}>Your Profile</h1>
          <p style={{ color: '#c8b89a', fontSize: '0.9rem', letterSpacing: '0.1em' }}>Customize your identity in the Terminus Station</p>
        </div>

        {/* Avatar Section */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {avatarUrl ? (
            <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 1rem', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${avatarApproved ? '#4fc3f7' : '#ff6b6b'}`, boxShadow: avatarApproved ? '0 0 20px rgba(79,195,247,0.3)' : '0 0 20px rgba(255,107,107,0.3)' }}>
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {!avatarApproved && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#ff6b6b', padding: '0.5rem', fontSize: '0.8rem', textAlign: 'center', fontFamily: '"Space Mono", monospace', letterSpacing: '0.1em' }}>
                  Awaiting Approval
                </div>
              )}
            </div>
          ) : (
            <div style={{ width: '150px', height: '150px', margin: '0 auto 1rem', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
              No Avatar
            </div>
          )}

          <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'block', margin: '0 auto 1rem', padding: '0.5rem 1rem', background: 'rgba(6,5,10,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#e8e0d0', fontFamily: '"Space Mono", monospace', fontSize: '0.85rem', cursor: 'pointer' }} />

          {avatarPreview && (
            <div style={{ marginBottom: '1rem' }}>
              <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1} style={{ maxWidth: '100%' }}>
                <img ref={imgRef} src={avatarPreview} alt="Crop preview" onLoad={onImageLoad} style={{ maxWidth: '100%', maxHeight: '300px' }} />
              </ReactCrop>
              <p style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.6rem', color: 'rgba(200,184,154,0.4)', letterSpacing: '0.15em', marginTop: '0.5rem' }}>DRAG TO CROP · SQUARE</p>
            </div>
          )}

          <button onClick={handleUploadAvatar} disabled={uploading || !avatarPreview} style={{ width: '100%', padding: '0.75rem', background: uploading ? '#666' : '#4fc3f7', border: 'none', color: '#000', fontFamily: '"Space Mono", monospace', fontWeight: '600', fontSize: '0.85rem', letterSpacing: '0.2em', cursor: uploading ? 'not-allowed' : 'pointer', opacity: (uploading || !avatarPreview) ? 0.5 : 1, transition: 'all 0.2s' }}>
            {uploading ? 'Uploading...' : 'Upload Avatar'}
          </button>

          {uploadError && <div style={{ background: 'rgba(198,40,40,0.2)', border: '1px solid rgba(198,40,40,0.3)', color: '#ff6b6b', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem', fontFamily: '"Space Mono", monospace', fontSize: '0.8rem', textAlign: 'center' }}>{uploadError}</div>}
          {uploadSuccess && <div style={{ background: 'rgba(68,255,136,0.2)', border: '1px solid rgba(68,255,136,0.3)', color: '#44ff88', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem', fontFamily: '"Space Mono", monospace', fontSize: '0.8rem', textAlign: 'center' }}>{uploadSuccess}</div>}
        </div>

        {/* Profile Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="bio" style={labelStyle}>BIOGRAPHY</label>
            <textarea id="bio" name="bio" value={form.bio} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="birth_city" style={labelStyle}>BIRTH CITY</label>
            <select id="birth_city" name="birth_city" value={form.birth_city} onChange={handleChange} style={inputStyle}>
              <option value="">— Select a city —</option>
              <optgroup label="Valkenheim">
                <option value="Frostgate">Frostgate</option>
                <option value="Blackmere">Blackmere</option>
                <option value="Valken Watch">Valken Watch</option>
              </optgroup>
              <optgroup label="Khardün Reach">
                <option value="Harrowden">Harrowden</option>
                <option value="Saltgrimm">Saltgrimm</option>
                <option value="Cape Riven">Cape Riven</option>
              </optgroup>
              <optgroup label="High Aurelia">
                <option value="Caer Sol">Caer Sol</option>
                <option value="Northquiet">Northquiet</option>
                <option value="Mirrordeep">Mirrordeep</option>
              </optgroup>
              <optgroup label="Sarendor">
                <option value="Lornhaven">Lornhaven</option>
                <option value="Stoneveil">Stoneveil</option>
                <option value="Coilport">Coilport</option>
                <option value="Sunscar Citadel">Sunscar Citadel</option>
              </optgroup>
              <optgroup label="Meridian Spire">
                <option value="Echogate">Echogate</option>
                <option value="Spirecourt">Spirecourt</option>
                <option value="Greenfall">Greenfall</option>
              </optgroup>
              <optgroup label="Ossuan Depths">
                <option value="Brinehollow">Brinehollow</option>
                <option value="Dimreach">Dimreach</option>
                <option value="Last Buoy">Last Buoy</option>
              </optgroup>
            </select>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="age" style={labelStyle}>AGE</label>
            <input type="number" id="age" name="age" value={form.age} onChange={handleChange} min="0" max="150" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="power_level" style={labelStyle}>POWER LEVEL</label>
            <select id="power_level" name="power_level" value={form.power_level} onChange={handleChange} style={inputStyle}>
              <option value="None">None</option>
              <option value="Minor">Minor</option>
              <option value="Moderate">Moderate</option>
              <option value="Major">Major</option>
              <option value="Legendary">Legendary</option>
            </select>
          </div>

          {saveError && <div style={{ background: 'rgba(198,40,40,0.2)', border: '1px solid rgba(198,40,40,0.3)', color: '#ff6b6b', padding: '0.75rem', borderRadius: '4px', marginTop: '1rem', fontFamily: '"Space Mono", monospace', fontSize: '0.85rem', textAlign: 'center' }}>{saveError}</div>}
          {saveSuccess && <div style={{ background: 'rgba(68,255,136,0.2)', border: '1px solid rgba(68,255,136,0.3)', color: '#44ff88', padding: '0.75rem', borderRadius: '4px', marginTop: '1rem', fontFamily: '"Space Mono", monospace', fontSize: '0.85rem', textAlign: 'center' }}>{saveSuccess}</div>}

          <button type="submit" style={{ width: '100%', padding: '0.9rem', background: saving ? '#666' : '#4fc3f7', border: 'none', color: '#000', fontFamily: '"Space Mono", monospace', fontWeight: '600', fontSize: '0.9rem', letterSpacing: '0.2em', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.2s' }} disabled={saving}>
            {saving ? 'Saving...' : 'SAVE PROFILE'}
          </button>
        </form>
      </div>
    </div>
  );
}