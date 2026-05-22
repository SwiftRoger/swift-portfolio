import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, signup } = useAuth();

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
      if (mode === 'login') {
        const result = await login({
          username: form.username,
          password: form.password
        });
        if (result.success) {
          setSuccess('Login successful!');
          // Redirect to homepage or dashboard after delay
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        // Validate passwords match
        if (form.password !== form.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        
        const result = await signup({
          username: form.username,
          email: form.email,
          password: form.password
        });
        if (result.success) {
          setSuccess('Account created successfully!');
          // Auto-login after signup
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          setError(result.error || 'Signup failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
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
        maxWidth: '400px',
        boxShadow: '0 0 30px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            color: '#e8e0d0',
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '2rem',
            marginBottom: '0.5rem'
          }}>Terminus Station</h1>
          <p style={{
            color: '#c8b89a',
            fontSize: '0.9rem',
            letterSpacing: '0.1em'
          }}>
            {mode === 'login' ? 'Access Your Character' : 'Create Your Identity'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <button
            onClick={() => setMode('login')}
            style={{
              background: mode === 'login' ? 'rgba(192,176,255,0.2)' : 'transparent',
              border: 'none',
              color: mode === 'login' ? '#e8e0d0' : 'rgba(200,184,154,0.6)',
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.9rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              borderBottom: mode === 'login' ? '2px solid #c0b0ff' : 'transparent'
            }}
          >
            LOGIN
          </button>
          <button
            onClick={() => setMode('signup')}
            style={{
              background: mode === 'signup' ? 'rgba(192,176,255,0.2)' : 'transparent',
              border: 'none',
              color: mode === 'signup' ? '#e8e0d0' : 'rgba(200,184,154,0.6)',
              fontFamily: '"Space Mono", monospace',
              fontSize: '0.9rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              borderBottom: mode === 'signup' ? '2px solid #c0b0ff' : 'transparent'
            }}
          >
            SIGN UP
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="username"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'rgba(200,184,154,0.6)',
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.8rem',
                letterSpacing: '0.1em'
              }}
            >
              USERNAME
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
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

          {mode === 'signup' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'rgba(200,184,154,0.6)',
                  fontFamily: '"Space Mono", monospace',
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em'
                }}
              >
                EMAIL
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
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
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'rgba(200,184,154,0.6)',
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.8rem',
                letterSpacing: '0.1em'
              }}
            >
              PASSWORD
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
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

          {mode === 'signup' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'rgba(200,184,154,0.6)',
                  fontFamily: '"Space Mono", monospace',
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em'
                }}
              >
                CONFIRM PASSWORD
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
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
          )}

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
              background: mode === 'login' ? '#4fc3f7' : '#4fc3f7',
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
            {loading ? 'PROCESSING...' : mode === 'login' ? 'ACCESS STATION' : 'CREATE IDENTITY'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'rgba(200,184,154,0.4)' }}>
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <span
                onClick={() => setMode('signup')}
                style={{
                  color: '#c0b0ff',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Sign up here
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span
                onClick={() => setMode('login')}
                style={{
                  color: '#c0b0ff',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Login here
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}