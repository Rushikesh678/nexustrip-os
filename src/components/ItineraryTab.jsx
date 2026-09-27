import React, { useState } from 'react';
import {
  Plus, Calendar, Clock, MapPin, Sparkles, AlertTriangle, CheckCircle2,
  Receipt, CalendarCheck, Trash2, Edit, Users, ChevronDown, ChevronUp,
  ExternalLink, Compass, DollarSign, Camera
} from 'lucide-react';
import { api } from '../services/api';

const CATEGORY_META = {
  FOOD: { label: 'Dining', icon: '🍽️', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  ACCOMMODATION: { label: 'Lodging', icon: '🏨', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  TRANSPORT: { label: 'Transport', icon: '🚗', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  ACTIVITY: { label: 'Activity', icon: '🏄', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  LEISURE: { label: 'Leisure', icon: '🌴', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  OTHER: { label: 'Other', icon: '📌', color: '#4b5563', bg: '#f9fafb', border: '#e5e7eb' }
};

const TIME_SLOT_LABELS = {
  morning: '🌅 Morning (08:00 - 12:00)',
  afternoon: '☀️ Afternoon (12:00 - 17:00)',
  evening: '🌇 Evening (17:00 - 21:00)',
  night: '🌙 Night (21:00+)',
  all_day: '📅 All Day',
  custom: '⏱️ Custom Hours'
};

export const ItineraryTab = ({
  trip,
  participants,
  bookings,
  itineraryData,
  onRefresh,
  onOpenAddExpenseWithBlock,
  onOpenReceiptModalWithBlock,
  isHost
}) => {
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [showLinkBookingModal, setShowLinkBookingModal] = useState(null);
  const [expandedBlocks, setExpandedBlocks] = useState({});
  const [generatingAuto, setGeneratingAuto] = useState(false);

  const itinerary = itineraryData?.itinerary || [];
  const summary = itineraryData?.summary || {
    totalBlocks: 0,
    totalEstimated: 0,
    totalActual: 0,
    totalVariance: 0,
    untrackedCount: 0
  };

  // Group blocks by day_number
  const daysMap = {};
  itinerary.forEach(block => {
    const d = block.day_number || 1;
    if (!daysMap[d]) {
      daysMap[d] = {
        dayNumber: d,
        date: block.date,
        blocks: []
      };
    }
    daysMap[d].blocks.push(block);
  });

  const dayNumbers = Object.keys(daysMap).map(Number).sort((a, b) => a - b);

  const toggleExpand = (blockId) => {
    setExpandedBlocks(prev => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  const handleAutoGenerate = async () => {
    if (itinerary.length > 0 && !window.confirm('Auto-generate will sync your bookings and dates into the timeline. Proceed?')) {
      return;
    }
    setGeneratingAuto(true);
    try {
      const res = await api.autoGenerateItinerary(trip._id);
      if (res.success) {
        onRefresh();
      }
    } catch (err) {
      alert(err.message || 'Failed to auto-generate itinerary.');
    } finally {
      setGeneratingAuto(false);
    }
  };

  const handleDeleteBlock = async (blockId) => {
    if (!window.confirm('Are you sure you want to remove this time block? Linked expenses/bookings will remain intact in their respective tabs.')) {
      return;
    }
    try {
      await api.deleteItineraryBlock(trip._id, blockId);
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to delete block.');
    }
  };

  const filteredDays = selectedDay === 'ALL'
    ? dayNumbers
    : dayNumbers.filter(d => d === Number(selectedDay));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner / Summary Card */}
      <div className="card" style={{ padding: '20px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={22} color="var(--color-primary)" />
              <h2 style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-deacon)', color: 'var(--color-forest-ink)', margin: 0 }}>
                TRIP ITINERARY & TIME BLOCKS
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-muted)' }}>
              Linked financial schedule: plan activities, assign multiple restaurant tables or hotel rooms, and match OCR receipts.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleAutoGenerate}
              disabled={generatingAuto}
              style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={15} color="#854d0e" />
              {generatingAuto ? 'Generating...' : 'Auto-Sync Bookings'}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
              style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add Time Block
            </button>
          </div>
        </div>

        {/* Financial Rollup Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          paddingTop: '14px',
          borderTop: '1px solid var(--color-frost)'
        }}>
          <div style={{ backgroundColor: 'rgba(18, 35, 21, 0.03)', padding: '10px 14px', borderRadius: '10px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-moss-gray)', display: 'block' }}>
              Activities Planned
            </span>
            <strong style={{ fontSize: '20px', fontFamily: 'var(--font-deacon)', color: 'var(--color-forest-ink)' }}>
              {summary.totalBlocks}
            </strong>
          </div>

          <div style={{ backgroundColor: 'rgba(18, 35, 21, 0.03)', padding: '10px 14px', borderRadius: '10px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-moss-gray)', display: 'block' }}>
              Estimated Budget
            </span>
            <strong style={{ fontSize: '20px', fontFamily: 'var(--font-deacon)', color: 'var(--color-forest-ink)' }}>
              ₹{summary.totalEstimated.toFixed(2)}
            </strong>
          </div>

          <div style={{ backgroundColor: 'rgba(18, 35, 21, 0.03)', padding: '10px 14px', borderRadius: '10px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-moss-gray)', display: 'block' }}>
              Actual Tracked Spend
            </span>
            <strong style={{ fontSize: '20px', fontFamily: 'var(--font-deacon)', color: '#15803d' }}>
              ₹{summary.totalActual.toFixed(2)}
            </strong>
          </div>

          <div style={{
            backgroundColor: summary.totalVariance > 0 ? '#fef2f2' : '#f0fdf4',
            padding: '10px 14px',
            borderRadius: '10px',
            border: `1px solid ${summary.totalVariance > 0 ? '#fca5a5' : '#86efac'}`
          }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: summary.totalVariance > 0 ? '#991b1b' : '#166534', display: 'block' }}>
              Variance vs Target
            </span>
            <strong style={{ fontSize: '18px', fontFamily: 'var(--font-deacon)', color: summary.totalVariance > 0 ? '#b91c1c' : '#15803d' }}>
              {summary.totalVariance > 0 ? `+₹${summary.totalVariance.toFixed(2)} Over` : `₹${Math.abs(summary.totalVariance).toFixed(2)} Under`}
            </strong>
          </div>

          {summary.untrackedCount > 0 && (
            <div style={{ backgroundColor: '#fffbeb', padding: '10px 14px', borderRadius: '10px', border: '1px solid #fde68a' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#854d0e', display: 'block' }}>
                Pending Receipts
              </span>
              <strong style={{ fontSize: '18px', fontFamily: 'var(--font-deacon)', color: '#b45309' }}>
                {summary.untrackedCount} Untracked
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Day Filter Pills */}
      {dayNumbers.length > 0 && (
        <div className="mobile-tabs-scroll" style={{ gap: '8px', paddingBottom: '4px' }}>
          <button
            type="button"
            onClick={() => setSelectedDay('ALL')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: selectedDay === 'ALL' ? '2px solid var(--color-forest-ink)' : '1px solid var(--color-border)',
              backgroundColor: selectedDay === 'ALL' ? 'var(--color-forest-ink)' : '#ffffff',
              color: selectedDay === 'ALL' ? 'var(--color-meadow)' : 'var(--color-forest-ink)',
              fontWeight: 700,
              fontSize: '12px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            All Days ({itinerary.length})
          </button>

          {dayNumbers.map(d => {
            const dayObj = daysMap[d];
            const dateStr = dayObj?.date ? new Date(dayObj.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Day ${d}`;
            const isSel = selectedDay === String(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDay(String(d))}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: isSel ? '2px solid var(--color-forest-ink)' : '1px solid var(--color-border)',
                  backgroundColor: isSel ? 'var(--color-forest-ink)' : '#ffffff',
                  color: isSel ? 'var(--color-meadow)' : 'var(--color-forest-ink)',
                  fontWeight: 700,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Day {d} • {dateStr}</span>
                <span style={{
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: isSel ? 'var(--color-meadow)' : 'rgba(0,0,0,0.06)',
                  color: isSel ? 'var(--color-forest-ink)' : 'inherit',
                  fontWeight: 800
                }}>
                  {dayObj.blocks.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {itinerary.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Compass size={32} color="var(--color-primary)" />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-forest-ink)', marginBottom: '8px' }}>
            No Itinerary Blocks Yet
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-muted)', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            Create schedule blocks for your trip! You can attach multiple hotel room bookings, multiple restaurant table checks, or scan bills straight into each time slot.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button type="button" className="btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Create First Time Block
            </button>
            <button type="button" className="btn-secondary" onClick={handleAutoGenerate} disabled={generatingAuto}>
              <Sparkles size={16} color="#854d0e" /> Auto-Generate from Dates
            </button>
          </div>
        </div>
      )}

      {/* Timeline Day-by-Day List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {filteredDays.map(d => {
          const dayObj = daysMap[d];
          if (!dayObj) return null;

          const dayDate = dayObj.date ? new Date(dayObj.date) : null;
          const formattedDate = dayDate ? dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) : `Day ${d}`;

          const dayEst = dayObj.blocks.reduce((sum, b) => sum + (b.estimated_cost || 0), 0);
          const dayActual = dayObj.blocks.reduce((sum, b) => sum + (b.actual_cost || 0), 0);

          return (
            <div key={d} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Day Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-forest-ink)',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(18, 35, 21, 0.12)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={18} color="var(--color-meadow)" />
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-meadow)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em' }}>
                      DAY {d}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-deacon)' }}>
                      {formattedDate}
                    </h3>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px' }}>
                  <span>Est: <strong>₹{dayEst.toFixed(2)}</strong></span>
                  <span>Actual: <strong style={{ color: 'var(--color-meadow)' }}>₹{dayActual.toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Time Blocks in this Day */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                paddingLeft: '14px',
                borderLeft: '3px solid rgba(18, 35, 21, 0.15)',
                marginLeft: '8px'
              }}>
                {dayObj.blocks.map(block => {
                  const bMeta = CATEGORY_META[block.category] || CATEGORY_META.OTHER;
                  const isExpanded = !!expandedBlocks[block._id];
                  const hasMultiItems = (block.linked_expenses?.length || 0) + (block.linked_bookings?.length || 0) > 1;
                  const totalItems = (block.linked_expenses?.length || 0) + (block.linked_bookings?.length || 0);

                  return (
                    <div
                      key={block._id}
                      className="card"
                      style={{
                        padding: '18px 20px',
                        backgroundColor: '#ffffff',
                        borderLeft: `4px solid ${bMeta.color}`,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {/* Block Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: bMeta.bg,
                            color: bMeta.color,
                            border: `1px solid ${bMeta.border}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span>{bMeta.icon}</span> {bMeta.label}
                          </span>

                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#f1f5f9',
                            color: 'var(--color-forest-ink)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Clock size={12} />
                            {block.start_time ? `${block.start_time}${block.end_time ? ` - ${block.end_time}` : ''}` : TIME_SLOT_LABELS[block.time_slot] || block.time_slot}
                          </span>

                          {hasMultiItems && (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
                              border: '1px solid #bae6fd'
                            }}>
                              👥 Multi-Unit ({totalItems} Bills/Rooms)
                            </span>
                          )}

                          {block.status && block.status !== 'PLANNED' && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: block.status === 'COMPLETED' ? '#dcfce7' : '#fee2e2',
                              color: block.status === 'COMPLETED' ? '#15803d' : '#b91c1c'
                            }}>
                              {block.status}
                            </span>
                          )}
                        </div>

                        {/* Edit / Delete Buttons */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setEditingBlock(block)}
                            style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--color-muted)' }}
                            title="Edit Block"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlock(block._id)}
                            style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#dc2626' }}
                            title="Delete Block"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Location */}
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: 'var(--color-forest-ink)' }}>
                        {block.title}
                      </h4>

                      {block.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-muted)', marginBottom: '8px' }}>
                          <MapPin size={14} color="var(--color-primary)" />
                          <span>{block.location}</span>
                        </div>
                      )}

                      {block.notes && (
                        <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--color-charcoal)', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '8px', borderLeft: '2px solid #cbd5e1' }}>
                          {block.notes}
                        </p>
                      )}

                      {/* Participant Crew Tag */}
                      {block.assigned_participants && block.assigned_participants.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-muted)', marginBottom: '12px' }}>
                          <Users size={14} />
                          <span>Assigned Crew:</span>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {block.assigned_participants.map(p => (
                              <span key={p._id || p} style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, color: 'var(--color-forest-ink)' }}>
                                {p.name || 'Member'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Financial Bar for this block */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid var(--color-frost)',
                        marginBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                          <span>Target Budget: <strong>₹{(block.estimated_cost || 0).toFixed(2)}</strong></span>
                          <span>Actual Spent: <strong style={{ color: block.actual_cost > 0 ? '#15803d' : 'var(--color-muted)' }}>₹{(block.actual_cost || 0).toFixed(2)}</strong></span>
                        </div>

                        <div>
                          {block.is_untracked && (
                            <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                              ⚠️ Pending Receipts
                            </span>
                          )}
                          {!block.is_untracked && block.estimated_cost > 0 && (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: block.is_over_budget ? '#fee2e2' : '#dcfce7',
                              color: block.is_over_budget ? '#991b1b' : '#166534',
                              border: `1px solid ${block.is_over_budget ? '#fca5a5' : '#86efac'}`
                            }}>
                              {block.variance > 0 ? `+₹${block.variance.toFixed(2)} Over Target` : `₹${Math.abs(block.variance).toFixed(2)} Within Budget`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Linked Multi-Item Entries (Multiple tables, multiple rooms) */}
                      {totalItems > 0 && (
                        <div style={{ marginTop: '8px', borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>
                          <button
                            type="button"
                            onClick={() => toggleExpand(block._id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px 0',
                              fontSize: '13px',
                              fontWeight: 700,
                              color: 'var(--color-forest-ink)'
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Receipt size={14} color="var(--color-primary)" />
                              Linked Expenses & Bookings ({totalItems})
                            </span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>

                          {isExpanded && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                              {/* Linked Expenses */}
                              {block.linked_expenses?.map(exp => (
                                <div
                                  key={exp._id}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    backgroundColor: '#f1f5f9',
                                    fontSize: '13px'
                                  }}
                                >
                                  <div>
                                    <div style={{ fontWeight: 700, color: 'var(--color-forest-ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span>🧾 {exp.description}</span>
                                      {exp.subgroupTag && (
                                        <span style={{ fontSize: '10px', backgroundColor: '#e0e7ff', color: '#3730a3', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                          {exp.subgroupTag}
                                        </span>
                                      )}
                                    </div>
                                    <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                                      Paid by {exp.payerId?.name || 'Member'} • {exp.participants?.length || 0} participants
                                    </span>
                                  </div>
                                  <strong style={{ fontSize: '14px', color: '#15803d' }}>
                                    ₹{Number(exp.amount || 0).toFixed(2)}
                                  </strong>
                                </div>
                              ))}

                              {/* Linked Bookings */}
                              {block.linked_bookings?.map(bkg => (
                                <div
                                  key={bkg._id}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    backgroundColor: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    fontSize: '13px'
                                  }}
                                >
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span>🏨 Booking: {bkg.description}</span>
                                      {bkg.subgroupTag && (
                                        <span style={{ fontSize: '10px', backgroundColor: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                          {bkg.subgroupTag}
                                        </span>
                                      )}
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#3b82f6' }}>
                                      Vendor: {bkg.vendor_name || 'Direct'} • {bkg.allocation_model} split
                                    </span>
                                  </div>
                                  <strong style={{ fontSize: '14px', color: '#1e40af' }}>
                                    ₹{Number(bkg.total_cost || 0).toFixed(2)}
                                  </strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quick Action Footer */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: '8px',
                        marginTop: '14px',
                        paddingTop: '10px',
                        borderTop: '1px solid var(--color-frost)',
                        flexWrap: 'wrap'
                      }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => onOpenAddExpenseWithBlock(block)}
                          style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Plus size={14} /> Add Expense
                        </button>

                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => onOpenReceiptModalWithBlock(block)}
                          style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#0369a1' }}
                        >
                          <Camera size={14} /> Scan Bill (OCR)
                        </button>

                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setShowLinkBookingModal(block)}
                          style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <CalendarCheck size={14} /> Link Booking
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD ITINERARY BLOCK MODAL */}
      {showAddModal && (
        <ItineraryBlockModal
          trip={trip}
          participants={participants}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            onRefresh();
          }}
        />
      )}

      {/* EDIT ITINERARY BLOCK MODAL */}
      {editingBlock && (
        <ItineraryBlockModal
          trip={trip}
          participants={participants}
          initialData={editingBlock}
          onClose={() => setEditingBlock(null)}
          onSuccess={() => {
            setEditingBlock(null);
            onRefresh();
          }}
        />
      )}

      {/* LINK BOOKING MODAL */}
      {showLinkBookingModal && (
        <LinkBookingModal
          block={showLinkBookingModal}
          bookings={bookings}
          onClose={() => setShowLinkBookingModal(null)}
          onSuccess={() => {
            setShowLinkBookingModal(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

/* ITINERARY BLOCK MODAL (For Add & Edit) */
const ItineraryBlockModal = ({ trip, participants, initialData = null, onClose, onSuccess }) => {
  const isEdit = !!initialData;
  const [submitting, setSubmitting] = useState(false);

  // Compute default date based on trip start date
  const defaultDate = initialData?.date
    ? new Date(initialData.date).toISOString().split('T')[0]
    : trip.start_date.split('T')[0];

  const [form, setForm] = useState({
    day_number: initialData?.day_number || 1,
    date: defaultDate,
    time_slot: initialData?.time_slot || 'morning',
    start_time: initialData?.start_time || '',
    end_time: initialData?.end_time || '',
    title: initialData?.title || '',
    location: initialData?.location || '',
    category: initialData?.category || 'ACTIVITY',
    estimated_cost: initialData?.estimated_cost !== undefined ? initialData.estimated_cost : '',
    status: initialData?.status || 'PLANNED',
    assigned_participants: initialData?.assigned_participants?.map(p => p._id || p) || [],
    notes: initialData?.notes || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Activity title is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        location: form.location.trim(),
        estimated_cost: Number(form.estimated_cost || 0),
        currency: trip.currency || 'INR'
      };

      if (isEdit) {
        await api.updateItineraryBlock(trip._id, initialData._id, payload);
      } else {
        await api.createItineraryBlock(trip._id, payload);
      }
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to save time block.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-forest-ink)', margin: 0 }}>
              {isEdit ? 'Edit Itinerary Time Block' : 'Add Itinerary Time Block'}
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
              Set scheduled activity, estimated budget & participant crew
            </span>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--color-muted)' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Activity Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Group Dinner at Beachside, Hotel Check-in, Scuba Diving"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
            />
          </div>

          <div className="responsive-grid-form" style={{ gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Day Number *</label>
              <input
                type="number"
                min="1"
                required
                value={form.day_number}
                onChange={e => setForm({ ...form, day_number: Number(e.target.value) })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Date *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              />
            </div>
          </div>

          <div className="responsive-grid-form" style={{ gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Category *</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              >
                <option value="ACTIVITY">🏄 Activity / Tour</option>
                <option value="FOOD">🍽️ Dining & Food</option>
                <option value="ACCOMMODATION">🏨 Accommodation / Check-In</option>
                <option value="TRANSPORT">🚗 Transport / Flights</option>
                <option value="LEISURE">🌴 Leisure & Free Time</option>
                <option value="OTHER">📌 Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Time Slot</label>
              <select
                value={form.time_slot}
                onChange={e => setForm({ ...form, time_slot: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              >
                <option value="morning">🌅 Morning (08:00 - 12:00)</option>
                <option value="afternoon">☀️ Afternoon (12:00 - 17:00)</option>
                <option value="evening">🌇 Evening (17:00 - 21:00)</option>
                <option value="night">🌙 Night (21:00+)</option>
                <option value="all_day">📅 All Day</option>
                <option value="custom">⏱️ Custom Specific Hours</option>
              </select>
            </div>
          </div>

          {/* Custom Time inputs if custom time slot selected */}
          <div className="responsive-grid-form" style={{ gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Start Time (Optional)</label>
              <input
                type="time"
                value={form.start_time}
                onChange={e => setForm({ ...form, start_time: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>End Time (Optional)</label>
              <input
                type="time"
                value={form.end_time}
                onChange={e => setForm({ ...form, end_time: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              />
            </div>
          </div>

          <div className="responsive-grid-form" style={{ gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Location / Venue</label>
              <input
                type="text"
                placeholder="e.g. Candolim Beach, Pier 4"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Target Budget (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.estimated_cost}
                onChange={e => setForm({ ...form, estimated_cost: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', fontWeight: 700 }}
              />
            </div>
          </div>

          {/* Assigned Participants */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Participating Crew (Leave empty for All Members)</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" onClick={() => setForm({ ...form, assigned_participants: participants.map(p => p._id) })} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>Select All</button>
                <button type="button" onClick={() => setForm({ ...form, assigned_participants: [] })} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>Clear</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px' }}>
              {participants.map(p => {
                const isChecked = form.assigned_participants.includes(p._id);
                return (
                  <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', backgroundColor: isChecked ? 'rgba(85, 221, 74, 0.08)' : 'transparent' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({ ...form, assigned_participants: [...form.assigned_participants, p._id] });
                        } else {
                          setForm({ ...form, assigned_participants: form.assigned_participants.filter(id => id !== p._id) });
                        }
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{p.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Notes & Reservation Details</label>
            <textarea
              rows="2"
              placeholder="e.g. Reservation under Alice, table for 10 at 8 PM, dress code smart casual"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Block' : 'Create Time Block'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* LINK EXISTING BOOKING MODAL */
const LinkBookingModal = ({ block, bookings, onClose, onSuccess }) => {
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [subgroupTag, setSubgroupTag] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableBookings = bookings.filter(b => !b.itineraryBlockId || b.itineraryBlockId === block._id);

  const handleLink = async (e) => {
    e.preventDefault();
    if (!selectedBookingId) {
      alert('Please select a booking to link');
      return;
    }
    setSubmitting(true);
    try {
      await api.updateBooking(block.trip_id, selectedBookingId, {
        itineraryBlockId: block._id,
        subgroupTag: subgroupTag.trim()
      });
      onSuccess();
    } catch (err) {
      alert(err.message || 'Failed to link booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-forest-ink)', margin: 0 }}>
              Link Booking to "{block.title}"
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
              Attach vendor booking (e.g. hotel room, taxi, tour) to this time block
            </span>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--color-muted)' }}>×</button>
        </div>

        <form onSubmit={handleLink} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Select Booking *</label>
            <select
              value={selectedBookingId}
              onChange={e => setSelectedBookingId(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
            >
              <option value="">-- Choose Booking --</option>
              {availableBookings.map(b => (
                <option key={b._id} value={b._id}>
                  {b.description} (₹{b.total_cost}) - {b.vendor_name || 'Vendor'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
              Sub-unit / Room / Table Label (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Room 101 (Deluxe King), Van 1"
              value={subgroupTag}
              onChange={e => setSubgroupTag(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Linking...' : 'Link to Block'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
