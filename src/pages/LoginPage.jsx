import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Compass, KeyRound, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/trips');
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
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
        setError(res.message || 'Google login failed.');
      }
    } catch (err) {
      setError(err.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign In failed or was closed.');
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
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
      <div className="card-cream" style={{ width: '100%', maxWidth: '460px', position: 'relative' }}>
        
        {/* Sticker Badge top corner */}
        <div style={{ position: 'absolute', top: '-14px', right: 'clamp(12px, 3vw, 24px)' }}>
          <span className="sticker-badge">AUTHORIZATION PASS</span>
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
          <span className="eyebrow-label" style={{ display: 'block', marginBottom: '4px' }}>01 / SIGN IN</span>
          <h2 style={{ fontSize: 'clamp(26px, 5vw, 36px)', color: 'var(--color-forest-ink)', letterSpacing: '-0.02em' }}>
            WELCOME BACK
          </h2>
          <p style={{ color: '#555555', fontSize: '13px', marginTop: '4px' }}>
            Access your trip ledgers and active settlements
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
            text="signin_with"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-sage-border)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-moss-gray)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>OR SIGN IN WITH EMAIL</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-sage-border)' }} />
        </div>


        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-forest-ink)', marginBottom: '8px' }}>
              EMAIL ADDRESS
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-sage-border)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="host@tripledger.com"
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
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-forest-ink)', marginBottom: '8px' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-sage-border)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button type="submit" disabled={loading} className="btn-meadow" style={{ justifyContent: 'center', padding: '14px', fontSize: '14px', marginTop: '6px' }}>
            {loading ? 'AUTHENTICATING...' : 'ENTER TRIP WORKSPACE'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px dashed var(--color-sage-border)', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-moss-gray)', marginBottom: '12px' }}>
            QUICK DEMO ACCESSIBILITY:
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button type="button" className="btn-ghost-cream" onClick={() => handleDemoLogin('alex.organizer@tripledger.io')} style={{ fontSize: '12px', padding: '8px 14px' }}>
              ALEX (HOST)
            </button>
            <button type="button" className="btn-ghost-cream" onClick={() => handleDemoLogin('sarah.traveler@tripledger.io')} style={{ fontSize: '12px', padding: '8px 14px' }}>
              SARAH (MEMBER)
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#555555', marginTop: '24px' }}>
          New to TripLedger? <Link to="/register" style={{ color: 'var(--color-forest-ink)', fontWeight: 800, textDecoration: 'underline' }}>Create Account</Link>
        </p>
      </div>
    </div>
  );
};
