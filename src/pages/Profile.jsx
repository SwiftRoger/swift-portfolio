import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

export default function Profile({ onBack }) {
  const { user, loading, updateUser } = useAuth();
  const [form, setForm] = useState({
    bio: '',
    birth_city: '',
    age: '',
    power_level: ''
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        bio: user.bio || '',
        birth_city: user.birth_city || '',
        age: user.age !== null ? String(user.age) : '',
        power_level: user.power_level || 'None'
      });
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setAvatarPreview(null);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    
    try {
      const ageValue = form.age === '' ? null : parseInt(form.age);
      await updateUser({
        bio: form.bio,
        birth_city: form.birth_city,
        age: ageValue,
        power_level: form.power_level
      });
      
      setSaveSuccess('Profile saved successfully!');
      setTimeout(() => {
        setSaveSuccess('');
      }, 3000);
    } catch (err) {
      setSaveError('Failed to save profile');
      console.error('Save profile error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarPreview) {
      setUploadError('Please select an image first');
      return;
    }
    
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    
    try {
      const response = await api.post('/api/auth/avatar', { image: avatarPreview });
      setUploadSuccess(response.data.message);
      setAvatarUrl(response.data.url);
      
      // Clear preview after upload
      setAvatarPreview(null);
      
      setTimeout(() => {
        setUploadSuccess('');
      }, 3000);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed');
      console.error('Upload avatar error:', err);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    // Redirect to auth if not logged in
    window.location.href = '/auth';
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#06050a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: '"Space Mono", monospace'
    }}>
      <div style={{
        background: 'rgba(6,5,10,0.8)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '600px',
        boxShadow: '0 0 30px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(200,184,154,0.5)', fontFamily: '"Space Mono", monospace', fontSize: '0.7rem', letterSpacing: '0.3em', cursor: 'pointer' }}>← BACK</button>
            <button onClick={() => { localStorage.removeItem('portfolio_token'); window.location.href = '/' }} style={{ background: 'none', border: '1px solid rgba(255,100,100,0.3)', color: 'rgba(255,100,100,0.5)', fontFamily: '"Space Mono", monospace', fontSize: '0.7rem', letterSpacing: '0.3em', cursor: 'pointer', padding: '0.3rem 0.8rem' }}>LOGOUT</button>
          </div>
          <h1 style={{
            color: '#e8e0d0',
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '2rem',
            marginBottom: '0.5rem'
          }}>Your Profile</h1>
          <p style={{
            color: '#c8b89a',
            fontSize: '0.9rem',
            letterSpacing: '0.1em'
          }}>
            Customize your identity in the Terminus Station
          </p>
        </div>

        {/* Avatar Section */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {avatarUrl ? (
            <div style={{
              position: 'relative',
              width: '150px',
              height: '150px',
              margin: '0 auto 1rem',
              borderRadius: '50%',
              overflow: 'hidden',
              border: `2px solid ${user.avatar_approved ? '#4fc3f7' : '#ff6b6b'}`,
              boxShadow: user.avatar_approved 
                ? '0 0 20px rgba(79,195,247,0.3)' 
                : '0 0 20px rgba(255,107,107,0.3)'
            }}>
              <img
                src={avatarUrl}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {!user.avatar_approved && (
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#ff6b6b',
                  padding: '0.5rem',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  fontFamily: '"Space Mono", monospace',
                  letterSpacing: '0.1em'
                }}>
                  Awaiting Approval
                </div>
              )}
            </div>
          ) : (
            <div style={{
              width: '150px',
              height: '150px',
              margin: '0 auto 1rem',
              borderRadius: '50%',
              border: '2px dashed rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)'
            }}>
              No Avatar
            </div>
          )}
          
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{
              display: 'block',
              margin: '0 auto 1rem',
              padding: '0.5rem 1rem',
              background: 'rgba(6,5,10,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              color: '#e8e0d0',
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          />
          
          <button
            onClick={handleUploadAvatar}
            disabled={uploading || !avatarPreview}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: uploading ? '#666' : '#4fc3f7',
              border: 'none',
              color: '#000',
              fontFamily: '"Space Mono", monospace',
              fontWeight: '600',
              fontSize: '0.85rem',
              letterSpacing: '0.2em',
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Avatar'}
          </button>
          
          {uploadError && (
            <div style={{
              background: 'rgba(198,40,40,0.2)',
              border: '1px solid rgba(198,40,40,0.3)',
              color: '#ff6b6b',
              padding: '0.5rem',
              borderRadius: '4px',
              marginTop: '0.5rem',
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.8rem',
              textAlign: 'center'
            }}>
              {uploadError}
            </div>
          )}
          
          {uploadSuccess && (
            <div style={{
              background: 'rgba(68,255,136,0.2)',
              border: '1px solid rgba(68,255,136,0.3)',
              color: '#44ff88',
              padding: '0.5rem',
              borderRadius: '4px',
              marginTop: '0.5rem',
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.8rem',
              textAlign: 'center'
            }}>
              {uploadSuccess}
            </div>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSaveProfile();
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="bio"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'rgba(200,184,154,0.6)',
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.8rem',
                letterSpacing: '0.1em'
              }}
            >
              BIOGRAPHY
            </label>
            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(6,5,10,0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                color: '#e8e0d0',
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="birth_city"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'rgba(200,184,154,0.6)',
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.8rem',
                letterSpacing: '0.1em'
              }}
            >
              BIRTH CITY
            </label>
            <input
              type="text"
              id="birth_city"
              name="birth_city"
              value={form.birth_city}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(6,5,10,0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                color: '#e8e0d0',
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="age"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'rgba(200,184,154,0.6)',
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.8rem',
                letterSpacing: '0.1em'
              }}
            >
              AGE
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={form.age}
              onChange={handleChange}
              min="0"
              max="150"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(6,5,10,0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                color: '#e8e0d0',
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="power_level"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'rgba(200,184,154,0.6)',
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.8rem',
                letterSpacing: '0.1em'
              }}
            >
              POWER LEVEL
            </label>
            <select
              id="power_level"
              name="power_level"
              value={form.power_level}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(6,5,10,0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                color: '#e8e0d0',
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            >
              <option value="None">None</option>
              <option value="Minor">Minor</option>
              <option value="Moderate">Moderate</option>
              <option value="Major">Major</option>
              <option value="Legendary">Legendary</option>
            </select>
          </div>

          {saveError && (
            <div style={{
              background: 'rgba(198,40,40,0.2)',
              border: '1px solid rgba(198,40,40,0.3)',
              color: '#ff6b6b',
              padding: '0.75rem',
              borderRadius: '4px',
              marginTop: '1rem',
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.85rem',
              textAlign: 'center'
            }}>
              {saveError}
            </div>
          )}
          
          {saveSuccess && (
            <div style={{
              background: 'rgba(68,255,136,0.2)',
              border: '1px solid rgba(68,255,136,0.3)',
              color: '#44ff88',
              padding: '0.75rem',
              borderRadius: '4px',
              marginTop: '1rem',
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.85rem',
              textAlign: 'center'
            }}>
              {saveSuccess}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.9rem',
              background: saving ? '#666' : '#4fc3f7',
              border: 'none',
              color: '#000',
              fontFamily: '"Space Mono", monospace',
              fontWeight: '600',
              fontSize: '0.9rem',
              letterSpacing: '0.2em',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'SAVE PROFILE'}
          </button>
        </form>
      </div>
    </div>
  );
}