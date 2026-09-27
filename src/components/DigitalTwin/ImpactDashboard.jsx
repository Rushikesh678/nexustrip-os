import React, { useState } from 'react';
import {
  Activity, AlertTriangle, ShieldCheck, ShieldAlert, ArrowRight,
  TrendingDown, TrendingUp, DollarSign, CheckCircle2, ChevronDown,
  ChevronUp, Sparkles, AlertCircle, Clock, Users, ArrowUpRight, Zap
} from 'lucide-react';

export const ImpactDashboard = ({
  twinData,
  loading,
  onOpenSimulator,
  onResetSimulation
}) => {
  const [expandedBookingId, setExpandedBookingId] = useState(null);

  if (loading && !twinData) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid var(--color-sage-border)',
        padding: '40px 20px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-card)'
      }}>
        <Sparkles size={32} className="spin-animation" color="var(--color-forest-ink)" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontFamily: 'var(--font-deacon)', fontSize: '20px', margin: 0 }}>RUNNING CASCADING RISK GRAPH PROPAGATION...</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '6px' }}>
          Modeling multi-hop delayed effects across flights, accommodations, activities, and group financials.
        </p>
      </div>
    );
  }

  const data = twinData?.data || twinData || {};
  const overallRiskScore = data.overallRiskScore ?? 35;
  const twinState = (data.twinState || (overallRiskScore > 70 ? 'critical' : overallRiskScore > 38 ? 'degraded' : 'normal')).toLowerCase();
  const entities = data.entities || [];
  const propagationChain = data.propagationChain || [];
  const narrativeSummary = data.narrativeSummary || 'Digital twin simulation active and continuously synchronizing.';
  const isSimulation = data.isSimulation;
  const totalCostImpact = data.totalEstimatedCostImpact || data.totalCostImpact || entities.reduce((s, e) => s + (e.estimatedCostImpact || 0), 0);

  // Status Badge Colors & Icons
  let stateBg = '#f0fdf4';
  let stateBorder = '#22c55e';
  let stateTextColor = '#15803d';
  let StateIcon = ShieldCheck;
  let stateLabel = 'NOMINAL (NORMAL)';

  if (twinState === 'critical') {
    stateBg = '#fef2f2';
    stateBorder = '#ef4444';
    stateTextColor = '#991b1b';
    StateIcon = ShieldAlert;
    stateLabel = 'CRITICAL DISRUPTION';
  } else if (twinState === 'degraded') {
    stateBg = '#fffbeb';
    stateBorder = '#f59e0b';
    stateTextColor = '#92400e';
    StateIcon = AlertTriangle;
    stateLabel = 'DEGRADED / VULNERABLE';
  }

  const toggleExpand = (id) => {
    setExpandedBookingId(expandedBookingId === id ? null : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner: Twin Health State & Risk Index */}
      <div style={{
        backgroundColor: stateBg,
        border: `2px solid ${stateBorder}`,
        borderRadius: '20px',
        padding: '24px',
        boxShadow: 'var(--shadow-preview)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: stateBorder,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 4px 16px ${stateBorder}66`
          }}>
            <StateIcon size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: stateTextColor }}>
                DIGITAL TWIN SYSTEM HEALTH
              </span>
              {isSimulation && (
                <span style={{
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  textTransform: 'uppercase'
                }}>
                  🧪 COUNTERFACTUAL SIMULATION
                </span>
              )}
            </div>
            <div style={{ fontSize: '32px', fontFamily: 'var(--font-deacon)', fontWeight: 900, color: stateTextColor, lineHeight: 1.1, marginTop: '2px' }}>
              {stateLabel}
            </div>
            <div style={{ fontSize: '13px', color: stateTextColor, fontWeight: 600, marginTop: '4px' }}>
              System-wide vulnerability index: <strong>{overallRiskScore}/100</strong> • {entities.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length} critical nodes identified
            </div>
          </div>
        </div>

        {/* Right Side Metrics / Action */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.85)',
            padding: '12px 18px',
            borderRadius: '14px',
            border: '1px solid rgba(0,0,0,0.08)',
            textAlign: 'right'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-moss-gray)', textTransform: 'uppercase', display: 'block' }}>
              Estimated Financial Ripple
            </span>
            <strong style={{ fontSize: '24px', fontFamily: 'var(--font-deacon)', color: totalCostImpact > 5000 ? '#dc2626' : 'var(--color-forest-ink)' }}>
              ₹{Number(totalCostImpact).toLocaleString()}
            </strong>
          </div>

          {isSimulation && (
            <button
              onClick={onResetSimulation}
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: '12px', backgroundColor: 'var(--color-forest-ink)', color: '#ffffff' }}
            >
              Back to Live Data
            </button>
          )}
        </div>
      </div>

      {/* Narrative AI Summary Box */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid var(--color-sage-border)',
        padding: '22px 24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Sparkles size={18} color="var(--color-forest-ink)" />
          <h4 style={{ fontFamily: 'var(--font-deacon)', fontSize: '16px', margin: 0, color: 'var(--color-forest-ink)', letterSpacing: '0.04em' }}>
            AI REASONING & CASUALTY NARRATIVE
          </h4>
        </div>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: '#334155' }}>
          {narrativeSummary}
        </p>
      </div>

      {/* Step-by-Step Cascading Propagation Flow Diagram */}
      {propagationChain && propagationChain.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid var(--color-sage-border)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h4 style={{ fontFamily: 'var(--font-deacon)', fontSize: '18px', margin: 0, color: 'var(--color-forest-ink)', letterSpacing: '0.04em' }}>
              CASCADING PROPAGATION CHAIN (CROSS-ENTITY RIPPLE)
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--color-moss-gray)', fontWeight: 700, textTransform: 'uppercase' }}>
              Sequential Causality Graph
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
            gap: '12px',
            position: 'relative'
          }}>
            {propagationChain.map((step, idx) => {
              const isLast = idx === propagationChain.length - 1;
              const isHigh = idx >= 2;

              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: isHigh ? '#fef2f2' : idx === 0 ? '#f0fdf4' : '#f8fafc',
                    border: `1.5px solid ${isHigh ? '#fca5a5' : idx === 0 ? 'var(--color-meadow)' : '#cbd5e1'}`,
                    borderRadius: '14px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: idx === 0 ? '#15803d' : isHigh ? '#dc2626' : '#475569',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-moss-gray)', textTransform: 'uppercase' }}>
                        Hop #{idx}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', lineHeight: 1.4 }}>
                      {step}
                    </div>
                  </div>

                  {!isLast && (
                    <div style={{ marginTop: '10px', textAlign: 'right', color: 'var(--color-moss-gray)' }}>
                      <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Affected Itinerary Bookings & Probabilistic Risk Breakdown */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid var(--color-sage-border)',
        padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-deacon)', fontSize: '20px', margin: 0, color: 'var(--color-forest-ink)', letterSpacing: '0.04em' }}>
              INDIVIDUAL BOOKING VULNERABILITY MATRIX
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Probabilistic impact scores with 90% confidence uncertainty intervals
            </span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--color-forest-ink)', fontWeight: 700 }}>
            {entities.length} Total Monitored Nodes
          </div>
        </div>

        {/* Entities List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entities.map((entity, index) => {
            const isExpanded = expandedBookingId === (entity.bookingId || index);
            const riskCol = entity.riskLevel === 'critical' ? '#0f172a' : entity.riskLevel === 'high' ? '#dc2626' : entity.riskLevel === 'medium' ? '#f59e0b' : '#22c55e';
            const riskBg = entity.riskLevel === 'critical' ? '#f1f5f9' : entity.riskLevel === 'high' ? '#fef2f2' : entity.riskLevel === 'medium' ? '#fffbeb' : '#f0fdf4';

            const confLow = Math.round((entity.confidenceInterval?.[0] || 0.1) * 100);
            const confHigh = Math.round((entity.confidenceInterval?.[1] || 0.3) * 100);
            const prob = Math.round((entity.probabilityOfImpact || 0.2) * 100);

            return (
              <div
                key={entity.bookingId || index}
                style={{
                  backgroundColor: isExpanded ? '#fbfdfa' : '#ffffff',
                  border: `1.5px solid ${isExpanded ? 'var(--color-forest-ink)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(entity.bookingId || index)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '220px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      backgroundColor: riskBg,
                      color: riskCol,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '18px',
                      border: `1.5px solid ${riskCol}44`,
                      flexShrink: 0
                    }}>
                      {entity.type === 'transportation' ? '✈️' : entity.type === 'accommodation' ? '🏨' : entity.type === 'activity' ? '🎟️' : entity.type === 'meal' ? '🍽️' : '📍'}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-deacon)', fontSize: '17px', fontWeight: 800, color: 'var(--color-forest-ink)' }}>
                          {entity.bookingName}
                        </span>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-moss-gray)', fontWeight: 700 }}>
                          • {entity.type}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                        {entity.directEffect}
                      </div>
                    </div>
                  </div>

                  {/* Right Badges & Probabilities */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Probabilistic Confidence Bar */}
                    <div style={{ textAlign: 'right', minWidth: '100px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-forest-ink)' }}>
                        {prob}% Impact Prob
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--color-moss-gray)' }}>
                        CI: [{confLow}% – {confHigh}%]
                      </div>
                    </div>

                    <span style={{
                      backgroundColor: riskCol,
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '4px 12px',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {entity.riskLevel} ({entity.riskScore})
                    </span>

                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-forest-ink)' }}>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div style={{
                    padding: '16px 20px 20px',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    backgroundColor: '#fafaf9',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}>
                    {/* Cascading Effects List */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#991b1b', marginBottom: '6px' }}>
                        🔗 Cascading Ripple Effects
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {entity.cascadingEffects?.map((eff, eIdx) => (
                          <div key={eIdx} style={{ fontSize: '12px', color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{ color: '#dc2626', fontWeight: 800 }}>↳</span>
                            <span>{eff}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Action Box */}
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      border: '1.5px solid var(--color-meadow)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Zap size={16} color="var(--color-forest-ink)" />
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-forest-ink)', textTransform: 'uppercase' }}>
                            RECOMMENDED MITIGATION
                          </span>
                          <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 600, color: 'var(--color-forest-ink)' }}>
                            {entity.recommendedAction}
                          </p>
                        </div>
                      </div>

                      {entity.estimatedCostImpact > 0 && (
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626' }}>
                          Est. Cost Risk: ₹{Number(entity.estimatedCostImpact).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
