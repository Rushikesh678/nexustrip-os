import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Compass, User, Mail, KeyRound, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    venmo_handle: '',
    upi_id: '',
    role: 'member', // Default to member for travelers
    inviteCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        if (res.joinedTripId) {
          navigate(`/trip/${res.joinedTripId}`);
        } else {
          navigate('/trips');
        }
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const res = await loginWithGoogle(credentialResponse.credential);
      if (res.success) {
        navigate('/trips');
      } else {
        setError(res.message || 'Google sign up failed.');
      }
    } catch (err) {
      setError(err.message || 'Google sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign Up failed or was closed.');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 68px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-paper-cream)',
      padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 24px)',
      position: 'relative'
    }}>
      <div className="card-cream" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
        
        {/* Sticker Badge */}
        <div style={{ position: 'absolute', top: '-14px', right: 'clamp(12px, 3vw, 24px)' }}>
          <span className="sticker-badge">NEW EXPLORER PASS</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            backgroundColor: 'var(--color-forest-ink)',
            color: 'var(--color-meadow)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            boxShadow: '0 4px 14px rgba(18, 35, 21, 0.2)'
          }}>
            <Compass size={26} />
          </div>
          <span className="eyebrow-label" style={{ display: 'block', marginBottom: '4px' }}>01 / REGISTRATION</span>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', color: 'var(--color-forest-ink)', letterSpacing: '-0.02em' }}>
            CREATE EXPEDITION ACCOUNT
          </h2>
          <p style={{ color: '#555555', fontSize: '13px', marginTop: '4px' }}>
            Join TripLedger for effortless group expense settlements
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '12px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '18px',
            border: '1px solid #fca5a5'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '100%', overflow: 'hidden', marginBottom: '16px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            shape="rectangular"
            text="signup_with"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-sage-border)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-moss-gray)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>OR REGISTER WITH EMAIL</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-sage-border)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Account Type Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-forest-ink)', marginBottom: '8px' }}>
              CHOOSE ACCOUNT TYPE
            </label>
            <div className="responsive-grid-form">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'member' })}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: formData.role === 'member' ? '2px solid var(--color-forest-ink)' : '1px solid var(--color-sage-border)',
                  backgroundColor: formData.role === 'member' ? '#ffffff' : 'transparent',
                  color: 'var(--color-forest-ink)',

                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: formData.role === 'member' ? '0 2px 8px rgba(18, 35, 21, 0.12)' : 'none'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🎒 Traveler / Member
                </div>
                <div style={{ fontSize: '11px', color: '#666666', marginTop: '3px' }}>
                  Join host trips & log side quests
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'host' })}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: formData.role === 'host' ? '2px solid var(--color-forest-ink)' : '1px solid var(--color-sage-border)',
                  backgroundColor: formData.role === 'host' ? '#ffffff' : 'transparent',
                  color: 'var(--color-forest-ink)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: formData.role === 'host' ? '0 2px 8px rgba(18, 35, 21, 0.12)' : 'none'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  👑 Trip Organizer
                </div>
                <div style={{ fontSize: '11px', color: '#666666', marginTop: '3px' }}>
                  Create trips & invite members
                </div>
              </button>
            </div>
          </div>

          {/* Optional Trip Invite Code for Members */}
          {formData.role === 'member' && (
            <div style={{ backgroundColor: '#f0fdf4', padding: '12px 14px', borderRadius: '10px', border: '1px solid #86efac' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#166534', marginBottom: '6px' }}>
                HAVE A TRIP INVITE CODE? (OPTIONAL)
              </label>
              <input
                type="text"
                name="inviteCode"
                value={formData.inviteCode}
                onChange={handleChange}
                placeholder="e.g. EXP-7A2B"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #86efac',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  outline: 'none',
                  color: '#166534',
                  textTransform: 'uppercase'
                }}
              />
              <span style={{ fontSize: '11px', color: '#15803d', display: 'block', marginTop: '4px' }}>
                You'll be instantly added to your host's trip ledger upon sign up.
              </span>
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-forest-ink)', marginBottom: '6px' }}>
              FULL NAME
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-sage-border)' }} />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Morgan"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-sage-border)',
                  backgroundColor: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  color: 'var(--color-forest-ink)'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-forest-ink)', marginBottom: '6px' }}>
              EMAIL ADDRESS
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-sage-border)' }} />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@tripledger.com"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-sage-border)',
                  backgroundColor: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  color: 'var(--color-forest-ink)'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-forest-ink)', marginBottom: '6px' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-sage-border)' }} />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-sage-border)',
                  backgroundColor: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  color: 'var(--color-forest-ink)'
                }}
              />
            </div>
          </div>

          <div className="responsive-grid-form">
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-forest-ink)', marginBottom: '6px' }}>
                VENMO HANDLE (OPTIONAL)
              </label>
              <input
                type="text"
                name="venmo_handle"
                value={formData.venmo_handle}
                onChange={handleChange}
                placeholder="@alex_morgan"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-sage-border)',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                  color: 'var(--color-forest-ink)'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-forest-ink)', marginBottom: '6px' }}>
                UPI ID (OPTIONAL)
              </label>
              <input
                type="text"
                name="upi_id"
                value={formData.upi_id}
                onChange={handleChange}
                placeholder="alex@upi"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-sage-border)',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                  color: 'var(--color-forest-ink)'
                }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-meadow" style={{ justifyContent: 'center', padding: '14px', fontSize: '14px', marginTop: '8px' }}>
            {loading ? 'CREATING ACCOUNT...' : 'GET STARTED FREE'} <ArrowRight size={18} />
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#555555', marginTop: '24px' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--color-forest-ink)', fontWeight: 800, textDecoration: 'underline' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};
