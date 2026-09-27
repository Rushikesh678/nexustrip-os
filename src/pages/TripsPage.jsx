import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Calendar, MapPin, IndianRupee, Users, ChevronRight, Sparkles, Compass, ShieldCheck, KeyRound, Copy, Check, Trash2, AlertTriangle } from 'lucide-react';

export const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [joiningTrip, setJoiningTrip] = useState(false);
  const [tripFilter, setTripFilter] = useState('ALL'); // 'ALL' | 'HOSTED' | 'MEMBER'
  const [copiedCode, setCopiedCode] = useState('');
  const [tripToDelete, setTripToDelete] = useState(null);
  const [isDeletingTrip, setIsDeletingTrip] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'INR',
    budget: 3500,
    cost_sharing_model: 'equal',
    refund_policy: 'full'
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTrips = async () => {
    try {
      const res = await api.getTrips();
      if (res.success) {
        setTrips(res.trips);
      }
    } catch (err) {
      console.error('Fetch trips error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createTrip(formData);
      if (res.success) {
        setShowModal(false);
        fetchTrips();
        navigate(`/trip/${res.trip._id}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to create trip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinTrip = async (e) => {
    e.preventDefault();
    if (!joinInviteCode.trim()) return;
    setJoiningTrip(true);
    try {
      const res = await api.joinTripByCode(joinInviteCode.trim());
      if (res.success && res.tripId) {
        setShowJoinModal(false);
        setJoinInviteCode('');
        fetchTrips();
        navigate(`/trip/${res.tripId}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to join trip. Please check your invite code.');
    } finally {
      setJoiningTrip(false);
    }
  };

  const handleCopyCode = (e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;
    setIsDeletingTrip(true);
    try {
      const res = await api.deleteTrip(tripToDelete._id);
      if (res.success) {
        setTripToDelete(null);
        fetchTrips();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete trip');
    } finally {
      setIsDeletingTrip(false);
    }
  };

  const handleQuickSeedDemo = async () => {
    setSubmitting(true);
    try {
      const res = await api.createTrip({
        name: 'Thailand Ski & Beach Adventure 2026',
        destination: 'Phuket & Chiang Mai, Thailand',
        description: '7-day group trip exploring islands, street food, and mountain trails.',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: 'INR',
        budget: 4500,
        cost_sharing_model: 'equal',
        refund_policy: 'full'
      });

      if (res.success && res.trip) {
        const tripId = res.trip._id;
        // Add sample participants
        await api.addParticipant(tripId, { name: 'Alice Walker', email: 'alice.walker@example.com', cost_tier: 'STANDARD', tier_multiplier: 1.0 });
        await api.addParticipant(tripId, { name: 'Bob Miller', email: 'bob.miller@example.com', cost_tier: 'STUDENT', tier_multiplier: 0.8 });
        await api.addParticipant(tripId, { name: 'Charlie Zhang', email: 'charlie.zhang@example.com', cost_tier: 'SPONSOR', tier_multiplier: 1.2 });

        // Add sample bookings & expenses
        await api.createBooking(tripId, {
          description: 'Grand Beach Resort Villa (4 Nights)',
          location: 'Phuket, Thailand',
          type: 'accommodation',
          vendor_name: 'Grand Beach Resort',
          total_cost: 1600,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          quantity: 2
        });

        await api.createBooking(tripId, {
          description: 'Private Island Catamaran Tour',
          location: 'Phuket, Thailand',
          type: 'activity',
          vendor_name: 'Phuket Marine Excursions',
          total_cost: 600,
          start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });

        // Get participants
        const partsRes = await api.getParticipants(tripId);
        if (partsRes.participants && partsRes.participants.length > 0) {
          const p1 = partsRes.participants[0]._id;
          const p2 = partsRes.participants[1]?._id || p1;

          await api.createExpense(tripId, {
            description: 'Group Welcome Dinner & Drinks',
            merchant: 'Tiki Beachfront Bistro',
            category: 'FOOD',
            amount: 320,
            payerId: p1
          });

          await api.createExpense(tripId, {
            description: 'Airport Shuttle & Taxi Fare',
            merchant: 'Phuket Express Shuttle',
            category: 'TRANSPORT',
            amount: 140,
            payerId: p2
          });
        }

        fetchTrips();
        navigate(`/trip/${tripId}`);
      }
    } catch (err) {
      console.error('Seed demo error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-paper-cream)', minHeight: 'calc(100vh - 68px)', padding: 'clamp(20px, 4vw, 48px) clamp(16px, 3vw, 24px)' }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px', marginBottom: '28px' }}>
          <div>
            <span className="eyebrow-label">01 / EXPEDITIONS & TRIP LEDGERS</span>
            <h1 className="deacon-display" style={{ fontSize: 'clamp(30px, 5vw, 64px)', color: 'var(--color-forest-ink)', marginTop: '6px' }}>
              MY GROUP TRIPS
            </h1>
            <p style={{ color: '#555555', fontSize: '15px', marginTop: '4px' }}>
              Double-entry debits, mid-trip prorated balances, and zero-conflict settlements
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: 'auto' }}>
            <button className="btn-ghost-cream" onClick={handleQuickSeedDemo} disabled={submitting}>
              <Sparkles size={16} color="var(--color-forest-ink)" /> LOAD DEMO TRIP
            </button>
            <button className="btn-ghost-cream" onClick={() => setShowJoinModal(true)}>
              <KeyRound size={16} color="var(--color-forest-ink)" /> JOIN WITH CODE
            </button>
            <button className="btn-meadow" onClick={() => setShowModal(true)}>
              <Plus size={18} /> CREATE NEW TRIP
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        {!loading && trips.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setTripFilter('ALL')}
              className={tripFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}
            >
              All Expeditions ({trips.length})
            </button>
            <button
              onClick={() => setTripFilter('HOSTED')}
              className={tripFilter === 'HOSTED' ? 'btn-primary' : 'btn-secondary'}
            >
              👑 Hosted by Me ({trips.filter(t => t.isOrganizer).length})
            </button>
            <button
              onClick={() => setTripFilter('MEMBER')}
              className={tripFilter === 'MEMBER' ? 'btn-primary' : 'btn-secondary'}
            >
              🎒 Joined as Member ({trips.filter(t => !t.isOrganizer).length})
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-moss-gray)', fontWeight: 700 }}>
            Loading your trip ledgers...
          </div>
        ) : trips.length === 0 ? (
          /* Empty State */
          <div className="card-cream" style={{ textAlign: 'center', padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', right: 'clamp(16px, 4vw, 32px)' }}>
              <span className="sticker-badge">GET STARTED</span>
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: 'var(--color-forest-ink)',
              color: 'var(--color-meadow)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}>
              <Compass size={32} />
            </div>
            <h3 style={{ fontSize: 'clamp(22px, 4vw, 28px)', color: 'var(--color-forest-ink)', marginBottom: '10px' }}>NO ACTIVE EXPEDITIONS YET</h3>
            <p style={{ color: '#555555', maxWidth: '500px', margin: '0 auto 24px auto', fontSize: '14px', lineHeight: 1.5 }}>
              Create your first group trip, enter an invite code from your organizer, or load our pre-populated demo trip to experience transparent double-entry expense sharing and automated settlement.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-meadow" onClick={() => setShowModal(true)}>
                <Plus size={18} /> CREATE FIRST TRIP
              </button>
              <button className="btn-ghost-cream" onClick={() => setShowJoinModal(true)}>
                <KeyRound size={16} /> JOIN WITH CODE
              </button>
              <button className="btn-ghost-cream" onClick={handleQuickSeedDemo}>
                <Sparkles size={16} /> LOAD DEMO TRIP
              </button>
            </div>
          </div>
        ) : (
          /* Trip Cards Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>

            {trips
              .filter(trip => {
                if (tripFilter === 'HOSTED') return trip.isOrganizer;
                if (tripFilter === 'MEMBER') return !trip.isOrganizer;
                return true;
              })
              .map(trip => (
              <div
                key={trip._id}
                className="card-cream"
                onClick={() => navigate(`/trip/${trip._id}`)}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: '#f8f4ed'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--color-forest-ink)';
                  e.currentTarget.style.boxShadow = '0 16px 48px rgba(18, 35, 21, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--color-sage-border)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-preview)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span className={trip.status === 'active' ? 'sticker-badge' : 'sticker-badge-navy'}>
                        {trip.status.replace('_', ' ')}
                      </span>
                      {trip.isOrganizer ? (
                        <span className="badge badge-success">👑 HOST</span>
                      ) : (
                        <span className="badge badge-primary">🎒 MEMBER</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-forest-ink)', backgroundColor: 'rgba(85,221,74,0.2)', padding: '4px 10px', borderRadius: '6px' }}>
                        {trip.currency || 'INR'} ₹{trip.budget?.toLocaleString() || '0'}
                      </span>
                      {trip.isOrganizer && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTripToDelete(trip);
                          }}
                          style={{
                            background: '#fee2e2',
                            border: '1px solid #fca5a5',
                            color: '#dc2626',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            transition: 'all 0.15s ease'
                          }}
                          title="Delete Entire Trip"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '26px', marginBottom: '10px', color: 'var(--color-forest-ink)', lineHeight: 0.9 }}>
                    {trip.name}
                  </h3>

                  {trip.destination && (
                    <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555555', fontSize: '14px', marginBottom: '14px', fontWeight: 500 }}>
                      <MapPin size={16} color="var(--color-forest-ink)" /> {trip.destination}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--color-moss-gray)', marginBottom: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="var(--color-forest-ink)" />
                      {new Date(trip.start_date).toLocaleDateString()} – {new Date(trip.end_date).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Shareable Invite Code */}
                  {trip.inviteCode && (
                    <div style={{ marginBottom: '16px' }}>
                      <button
                        type="button"
                        onClick={(e) => handleCopyCode(e, trip.inviteCode)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--color-sage-border)',
                          borderRadius: '8px',
                          padding: '4px 10px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: 'var(--color-forest-ink)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        title="Click to copy invite code for members"
                      >
                        <KeyRound size={13} color="var(--color-forest-ink)" />
                        <span>Code: {trip.inviteCode}</span>
                        {copiedCode === trip.inviteCode ? (
                          <span style={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: '2px' }}><Check size={12} /> Copied!</span>
                        ) : (
                          <Copy size={12} color="var(--color-moss-gray)" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px dashed var(--color-sage-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#555555' }}>
                    Organizer: <strong style={{ color: 'var(--color-forest-ink)' }}>{trip.organizer_id?.name || 'You'}</strong>
                  </span>
                  <span style={{ color: 'var(--color-forest-ink)', display: 'flex', alignItems: 'center', fontWeight: 800, fontSize: '13px', letterSpacing: '0.05em' }}>
                    OPEN WORKSPACE <ChevronRight size={16} color="var(--color-meadow)" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Join Trip with Code Modal */}
        {showJoinModal && (
          <div className="modal-overlay">
            <div className="modal-dialog" style={{ maxWidth: '440px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <span className="eyebrow-label">EXPEDITION PASS</span>
                  <h3 style={{ fontSize: '24px', color: 'var(--color-forest-ink)', marginTop: '4px' }}>JOIN GROUP TRIP</h3>
                </div>
                <button
                  onClick={() => setShowJoinModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--color-forest-ink)', fontWeight: 800 }}
                >
                  ×
                </button>
              </div>

              <p style={{ color: '#555555', fontSize: '14px', marginBottom: '20px', lineHeight: 1.4 }}>
                Enter the Trip Invite Code shared by your host to instantly access the ledger and log your side quests.
              </p>

              <form onSubmit={handleJoinTrip} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-forest-ink)', marginBottom: '6px' }}>
                    TRIP INVITE CODE *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EXP-7A2B"
                    value={joinInviteCode}
                    onChange={(e) => setJoinInviteCode(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '2px solid var(--color-forest-ink)',
                      backgroundColor: '#ffffff',
                      fontSize: '16px',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-forest-ink)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowJoinModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={joiningTrip} className="btn-meadow">
                    {joiningTrip ? 'JOINING...' : 'JOIN TRIP LEDGER →'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Trip Modal */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(18, 35, 21, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '24px'
          }}>
            <div className="card-cream" style={{ width: '100%', maxWidth: '540px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', right: '24px' }}>
                <span className="sticker-badge">NEW LEDGER</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <span className="eyebrow-label">CREATE EXPEDITION</span>
                  <h3 style={{ fontSize: '28px', color: 'var(--color-forest-ink)', marginTop: '4px' }}>NEW GROUP TRIP</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--color-forest-ink)', fontWeight: 800 }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateTrip} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-forest-ink)', marginBottom: '6px' }}>
                    TRIP NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thailand Beach & Ski 2026"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid var(--color-sage-border)',
                      backgroundColor: '#ffffff',
                      fontSize: '14px',
                      outline: 'none',
                      color: 'var(--color-forest-ink)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-forest-ink)', marginBottom: '6px' }}>
                    DESTINATION
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Phuket, Thailand"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid var(--color-sage-border)',
                      backgroundColor: '#ffffff',
                      fontSize: '14px',
                      outline: 'none',
                      color: 'var(--color-forest-ink)'
                    }}
                  />
                </div>

                <div className="responsive-grid-form">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-forest-ink)', marginBottom: '6px' }}>
                      START DATE *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-forest-ink)', marginBottom: '6px' }}>
                      END DATE *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
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

                <div className="responsive-grid-form">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-forest-ink)', marginBottom: '6px' }}>
                      CURRENCY
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1px solid var(--color-sage-border)',
                        backgroundColor: '#ffffff',
                        fontSize: '13px',
                        outline: 'none',
                        color: 'var(--color-forest-ink)'
                      }}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="THB">THB (฿)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-forest-ink)', marginBottom: '6px' }}>
                      ESTIMATED BUDGET
                    </label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '10px',
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                  <button type="button" className="btn-ghost-cream" onClick={() => setShowModal(false)}>
                    CANCEL
                  </button>
                  <button type="submit" disabled={submitting} className="btn-meadow">
                    {submitting ? 'CREATING...' : 'OPEN WORKSPACE'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Trip Confirmation Modal */}
        {tripToDelete && (
          <div className="modal-overlay" onClick={() => !isDeletingTrip && setTripToDelete(null)}>
            <div className="modal-dialog" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
                  <AlertTriangle size={24} />
                  <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>Delete Entire Trip</h3>
                </div>
                <button
                  onClick={() => !isDeletingTrip && setTripToDelete(null)}
                  style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--color-moss-gray)' }}
                >
                  ×
                </button>
              </div>

              <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fca5a5', padding: '14px', borderRadius: '10px', marginBottom: '18px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#991b1b', lineHeight: 1.5 }}>
                  <strong>CRITICAL WARNING:</strong> You are about to permanently delete <strong>"{tripToDelete.name}"</strong>.
                  This action cannot be undone. All recorded expenses, group bookings, side quests, audit records, ledger entries, and final settlements will be permanently erased.
                </p>
              </div>

              <DeleteTripNameConfirmForm
                trip={tripToDelete}
                onConfirm={handleDeleteTrip}
                onCancel={() => setTripToDelete(null)}
                isDeleting={isDeletingTrip}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

/* DELETE TRIP NAME CONFIRM FORM */
const DeleteTripNameConfirmForm = ({ trip, onConfirm, onCancel, isDeleting }) => {
  const [confirmInput, setConfirmInput] = useState('');
  const isMatch = confirmInput.trim() === trip.name.trim();

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-forest-ink)', marginBottom: '6px' }}>
          To confirm deletion, please type the trip name <strong style={{ color: '#dc2626' }}>{trip.name}</strong> below:
        </label>
        <input
          type="text"
          value={confirmInput}
          onChange={(e) => setConfirmInput(e.target.value)}
          placeholder={`Type "${trip.name}" here`}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: `2px solid ${isMatch ? '#dc2626' : 'var(--color-sage-border)'}`,
            fontSize: '14px',
            fontWeight: 600,
            backgroundColor: '#ffffff',
            outline: 'none',
            color: 'var(--color-forest-ink)'
          }}
        />
        {confirmInput && !isMatch && (
          <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
            Name doesn't match yet. Please type the exact trip name.
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!isMatch || isDeleting}
          style={{
            backgroundColor: isMatch ? '#dc2626' : '#9ca3af',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 800,
            fontSize: '13px',
            letterSpacing: '0.05em',
            cursor: isMatch && !isDeleting ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease'
          }}
        >
          {isDeleting ? 'DELETING EXPEDITION...' : 'I UNDERSTAND, DELETE TRIP'}
        </button>
      </div>
    </div>
  );
};
