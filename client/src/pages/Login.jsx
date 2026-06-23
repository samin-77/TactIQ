import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(formData.usernameOrEmail, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: '450px', margin: '4rem auto', width: '100%' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--color-gold)', marginBottom: '0.25rem' }}>Account Login</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Welcome back to the TactIQ Arena</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 59, 48, 0.1)',
            border: '1px solid var(--color-red)',
            color: 'var(--color-red)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="usernameOrEmail">Username or Email</label>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              required
              className="form-control"
              placeholder="Enter your username or email"
              value={formData.usernameOrEmail}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="form-control"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {submitting ? 'Authenticating...' : <><LogIn size={18} /> Login to Arena</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', borderTop: '1px solid var(--color-border-glass)', paddingTop: '1.25rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>New to TactIQ? </span>
          <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
        </div>
      </div>
    </div>
  );
}
