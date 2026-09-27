import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, LogOut, User as UserIcon, PlusCircle, Luggage, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav style={{
        backgroundColor: 'var(--color-forest-ink)',
        color: 'var(--color-paper-cream)',
        height: '68px',
        padding: '0 clamp(16px, 4vw, 32px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--color-sage-border)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        {/* Brand Logo */}
        <Link to="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'var(--color-meadow)',
            color: 'var(--color-forest-ink)',
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            flexShrink: 0
          }}>
            <Compass size={20} />
          </div>
          <span style={{
            fontFamily: 'var(--font-deacon)',
            fontWeight: 900,
            fontSize: 'clamp(20px, 4vw, 24px)',
            letterSpacing: '-0.02em',
            color: 'var(--color-paper-cream)',
            textTransform: 'uppercase'
          }}>
            TRIP<span style={{ color: 'var(--color-meadow)' }}>LEDGER</span>
          </span>
        </Link>

        {/* Desktop Nav Center Links */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <Link to="/" style={{
            color: 'var(--color-paper-cream)',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            transition: 'color 0.15s ease'
          }}>
            EXPLORE
          </Link>
          <Link to="/trips" style={{
            color: 'var(--color-paper-cream)',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.15s ease'
          }}>
            <Luggage size={15} color="var(--color-meadow)" /> MY TRIPS
          </Link>
        </div>

        {/* Desktop Right User / Auth Cluster */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'rgba(243, 237, 228, 0.08)',
                padding: '6px 14px',
                borderRadius: '9999px',
                border: '1px solid var(--color-sage-border)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-meadow)',
                  color: 'var(--color-forest-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '13px'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-paper-cream)' }}>{user.name}</span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  backgroundColor: user.role === 'member' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(85, 221, 74, 0.2)',
                  color: user.role === 'member' ? '#7dd3fc' : 'var(--color-meadow)',
                  border: `1px solid ${user.role === 'member' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(85, 221, 74, 0.4)'}`,
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  letterSpacing: '0.05em'
                }}>
                  {user.role === 'member' ? '🎒 Traveler' : '👑 Host'}
                </span>
              </div>

              <button
                onClick={() => { logout(); navigate('/'); }}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-sage-border)',
                  color: 'var(--color-moss-gray)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.05em'
                }}
              >
                <LogOut size={14} /> LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost-dark" style={{ padding: '8px 18px', fontSize: '12px' }}>
                LOG IN
              </Link>
              <Link to="/register" className="btn-meadow" style={{ padding: '8px 20px', fontSize: '12px' }}>
                GET STARTED
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="show-mobile-only"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          style={{
            background: 'rgba(243, 237, 228, 0.1)',
            border: '1px solid var(--color-sage-border)',
            borderRadius: '8px',
            color: 'var(--color-paper-cream)',
            width: '40px',
            height: '40px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0
          }}
        >
          {mobileMenuOpen ? <X size={22} color="var(--color-meadow)" /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Drawer Menu & Overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '68px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 7, 27, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            backgroundColor: 'var(--color-forest-ink)',
            borderBottom: '2px solid var(--color-sage-border)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto'
          }}>
            {/* If logged in, show user info card */}
            {user && (
              <div style={{
                backgroundColor: 'rgba(243, 237, 228, 0.08)',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid var(--color-sage-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-meadow)',
                  color: 'var(--color-forest-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-paper-cream)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-moss-gray)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  backgroundColor: user.role === 'member' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(85, 221, 74, 0.25)',
                  color: user.role === 'member' ? '#7dd3fc' : 'var(--color-meadow)',
                  border: `1px solid ${user.role === 'member' ? '#38bdf8' : 'var(--color-meadow)'}`,
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap'
                }}>
                  {user.role === 'member' ? '🎒 Traveler' : '👑 Host'}
                </span>
              </div>
            )}

            {/* Navigation Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                to="/"
                onClick={closeMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--color-paper-cream)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                <Compass size={18} color="var(--color-meadow)" /> EXPLORE EXPEDITIONS
              </Link>

              <Link
                to="/trips"
                onClick={closeMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--color-paper-cream)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                <Luggage size={18} color="var(--color-meadow)" /> MY GROUP TRIPS
              </Link>
            </div>

            {/* Action Buttons */}
            <div style={{ paddingTop: '8px', borderTop: '1px solid var(--color-sage-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {user ? (
                <button
                  onClick={() => {
                    closeMenu();
                    logout();
                    navigate('/');
                  }}
                  className="btn-danger-cream"
                  style={{ justifyContent: 'center', padding: '12px', fontSize: '13px', width: '100%' }}
                >
                  <LogOut size={16} /> LOG OUT OF TRIPLEDGER
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="btn-ghost-dark"
                    style={{ justifyContent: 'center', padding: '12px', fontSize: '13px', width: '100%' }}
                  >
                    LOG IN
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="btn-meadow"
                    style={{ justifyContent: 'center', padding: '12px', fontSize: '13px', width: '100%' }}
                  >
                    GET STARTED FREE
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Clickable Backdrop to close */}
          <div style={{ flex: 1 }} onClick={closeMenu} />
        </div>
      )}
    </>
  );
};

