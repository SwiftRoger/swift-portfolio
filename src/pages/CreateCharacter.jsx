import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

export default function CreateCharacter({ onBack }) {
  const [form, setForm] = useState({
    name: '',
    birth_city: '',
    backstory: '',
    role: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  if (!user) {
    // Redirect to auth if not logged in
    window.location.href = '/auth';
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate required fields
      if (!form.name.trim()) {
        setError('Character name is required');
        setLoading(false);
        return;
      }

      const response = await api.post('/api/characters', form);
      setSuccess('Character created successfully!');
      
      // Reset form (optional)
      setForm({
        name: '',
        birth_city: '',
        backstory: '',
        role: '',
        image_url: ''
      });
      
      // Optionally redirect to index or show the character
      setTimeout(() => {
        // We could redirect to the character index or show a success message
        // For now, we'll just show the success message and let the user continue
      }, 1500);
    } catch (err) {
      console.error('Create character error:', err);
      setError(err.response?.data?.message || 'Failed to create character');
    } finally {
      setLoading(false);
    }
  };

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
        maxWidth: '500px',
        boxShadow: '0 0 30px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            color: '#e8e0d0',
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '2rem',
            marginBottom: '0.5rem'
          }}>Create Your Character</h1>
          <p style={{
            color: '#c8b89a',
            fontSize: '0.9rem',
            letterSpacing: '0.1em'
          }}>
            Define your identity in the Terminus Station
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="name"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'rgba(200,184,154,0.6)',
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.8rem',
                letterSpacing: '0.1em'
              }}
            >
              CHARACTER NAME
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
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
              htmlFor="backstory"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'rgba(200,184,154,0.6)',
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.8rem',
                letterSpacing: '0.1em'
              }}
            >
              BACKSTORY
            </label>
            <textarea
              id="backstory"
              name="backstory"
              value={form.backstory}
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
              htmlFor="role"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'rgba(200,184,154,0.6)',
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.8rem',
                letterSpacing: '0.1em'
              }}
            >
              ROLE / TITLE
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={form.role}
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
              htmlFor="image_url"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'rgba(200,184,154,0.6)',
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.8rem',
                letterSpacing: '0.1em'
              }}
            >
              IMAGE URL (optional)
            </label>
            <input
              type="text"
              id="image_url"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://example.com/character.jpg"
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

          {error && (
            <div style={{
              background: 'rgba(198,40,40,0.2)',
              border: '1px solid rgba(198,40,40,0.3)',
              color: '#ff6b6b',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1.5rem',
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.85rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: 'rgba(68,255,136,0.2)',
              border: '1px solid rgba(68,255,136,0.3)',
              color: '#44ff88',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1.5rem',
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.85rem',
              textAlign: 'center'
            }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.9rem',
              background: '#4fc3f7',
              border: 'none',
              color: '#000',
              fontFamily: '"Space Mono", monospace',
              fontWeight: '600',
              fontSize: '0.9rem',
              letterSpacing: '0.2em',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
            disabled={loading}
          >
            {loading ? 'CREATING...' : 'CREATE CHARACTER'}
          </button>
        </form>

        {/* Back link */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: '1px solid rgba(192,176,255,0.2)',
              color: '#c0b0ff',
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.8rem',
              letterSpacing: '0.3em',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            ← BACK TO STATION
          </button>
        </div>
      </div>
    </div>
  );
}