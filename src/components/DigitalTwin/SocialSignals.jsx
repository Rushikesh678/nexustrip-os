import React from 'react';
import {
  MessageSquare, ThumbsUp, TrendingUp, AlertCircle, ExternalLink,
  RefreshCw, Smile, Meh, Frown, Radio, Hash, Compass
} from 'lucide-react';

export const SocialSignals = ({
  socialData,
  loading,
  onRefresh,
  destinationName = 'Mumbai'
}) => {
  if (loading && !socialData) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid var(--color-sage-border)',
        padding: '36px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-card)'
      }}>
        <Radio size={28} className="spin-animation" color="var(--color-forest-ink)" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontFamily: 'var(--font-deacon)', fontSize: '20px', margin: 0 }}>LISTENING TO PUBLIC SOCIAL SIGNALS...</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '6px' }}>
          Parsing traveler posts and local sentiment streams across Reddit for {destinationName}
        </p>
      </div>
    );
  }

  const data = socialData?.data || socialData || {};
  const sentiment = data.overallSentiment ?? -0.25;
  const sentimentLabel = data.sentimentLabel || (sentiment < -0.3 ? 'Negative (Disrupted)' : sentiment > 0.3 ? 'Positive (Favorable)' : 'Neutral (Mixed)');
  const keywords = data.trendingKeywords || ['#MonsoonRain', '#Waterlogging', '#TransitAlert', '#FlightDelay'];
  const emerging = data.emergingConditions || [];
  const posts = data.posts || [];
  const source = data.source || 'Reddit Public Intelligence Stream';

  // Sentiment Bar Percentage (-1.0 = 0%, 0.0 = 50%, +1.0 = 100%)
  const sentimentPct = Math.min(100, Math.max(0, Math.round(((sentiment + 1) / 2) * 100)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Sentiment & Intelligence Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid var(--color-sage-border)',
        padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffedd5',
                color: '#c2410c',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 800,
                border: '1px solid #fdba74'
              }}>
                <Radio size={12} className="spin-animation" />
                REAL-WORLD GROUND TRUTH
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-deacon)', fontSize: '24px', margin: '6px 0 0', color: 'var(--color-forest-ink)' }}>
              Social Signals & Traveler Sentiment ({destinationName})
            </h3>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn-ghost-cream"
            style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
            {loading ? 'Polling...' : 'Sync Social Feed'}
          </button>
        </div>

        {/* Sentiment Meter Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(0,0,0,0.06)'
        }}>
          {/* Sentiment Gauge */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-moss-gray)' }}>
                Aggregated Traveler Sentiment
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: 800,
                color: sentiment < -0.2 ? '#dc2626' : sentiment > 0.2 ? '#15803d' : '#854d0e'
              }}>
                {sentiment > 0 ? `+${sentiment}` : sentiment} / 1.0
              </span>
            </div>

            {/* Gradient Bar */}
            <div style={{ width: '100%', height: '10px', borderRadius: '6px', background: 'linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #22c55e 100%)', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '-4px',
                left: `${sentimentPct}%`,
                width: '18px',
                height: '18px',
                backgroundColor: '#ffffff',
                border: '3px solid var(--color-forest-ink)',
                borderRadius: '50%',
                transform: 'translateX(-50%)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Frown size={12} color="#dc2626" /> Critical Delays (-1.0)</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Meh size={12} color="#f59e0b" /> Neutral</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Smile size={12} color="#15803d" /> Optimal (+1.0)</span>
            </div>
          </div>

          {/* Sentiment Interpretation Badge */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '14px 18px',
            borderRadius: '14px',
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <span style={{ fontSize: '10px', color: 'var(--color-moss-gray)', fontWeight: 800, textTransform: 'uppercase' }}>
              Status Assessment
            </span>
            <div style={{
              fontSize: '18px',
              fontFamily: 'var(--font-deacon)',
              fontWeight: 900,
              color: sentiment < -0.2 ? '#b91c1c' : sentiment > 0.2 ? '#15803d' : '#854d0e',
              marginTop: '2px'
            }}>
              {sentimentLabel}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b' }}>
              Calculated from {posts.length} real-time user reports in surrounding destination subreddits.
            </p>
          </div>
        </div>

        {/* Trending Keywords Chips */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-moss-gray)', marginBottom: '8px' }}>
            Trending Topic Signals:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {keywords.map((kw, i) => (
              <span
                key={i}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: 'var(--color-forest-ink)',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '16px',
                  border: '1px solid #cbd5e1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Hash size={12} color="var(--color-moss-gray)" /> {kw.replace(/^#/, '')}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Emerging Conditions Detection */}
      {emerging && emerging.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid var(--color-sage-border)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontFamily: 'var(--font-deacon)', fontSize: '18px', margin: 0, color: 'var(--color-forest-ink)', letterSpacing: '0.04em' }}>
              DETECTED EMERGING FIELD HAZARDS
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--color-moss-gray)', fontWeight: 700 }}>
              AI NLP Clustered
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {emerging.map((item, idx) => {
              const isHigh = item.severity === 'high';
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: isHigh ? '#fff1f2' : '#f8fafc',
                    border: `1.5px solid ${isHigh ? '#fecdd3' : '#e2e8f0'}`,
                    borderRadius: '14px',
                    padding: '14px 16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '13px', color: isHigh ? '#9f1239' : '#1e293b' }}>
                      {item.topic}
                    </span>
                    <span style={{
                      backgroundColor: isHigh ? '#e11d48' : '#64748b',
                      color: '#ffffff',
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      textTransform: 'uppercase'
                    }}>
                      {item.severity}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                    {item.impact}
                  </p>
                  <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--color-moss-gray)', textAlign: 'right' }}>
                    Signal Confidence: {Math.round((item.confidence || 0.85) * 100)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Reddit Traveler Posts Feed */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid var(--color-sage-border)',
        padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-deacon)', fontSize: '18px', margin: 0, color: 'var(--color-forest-ink)', letterSpacing: '0.04em' }}>
              PUBLIC TRAVELER FORUM DISPATCHES
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--color-moss-gray)' }}>
              Source: {source}
            </span>
          </div>

          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-forest-ink)' }}>
            {posts.length} Live Threads
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {posts.map((post, idx) => {
            const isNegative = post.sentiment < -0.2;
            const isPositive = post.sentiment > 0.2;

            return (
              <div
                key={post.id || idx}
                style={{
                  backgroundColor: '#fafafa',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      backgroundColor: '#ff4500',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {post.subreddit}
                    </span>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      u/{post.author}
                    </span>
                  </div>

                  <span style={{
                    backgroundColor: isNegative ? '#fee2e2' : isPositive ? '#dcfce7' : '#f3f4f6',
                    color: isNegative ? '#991b1b' : isPositive ? '#166534' : '#374151',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '8px'
                  }}>
                    {isNegative ? 'Negative Sentiment' : isPositive ? 'Positive Sentiment' : 'Neutral'}
                  </span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-forest-ink)', lineHeight: 1.35 }}>
                  {post.title}
                </div>

                {post.summary && (
                  <p style={{ margin: 0, fontSize: '12px', color: '#4b5563', lineHeight: 1.4 }}>
                    {post.summary}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid #f3f4f6', fontSize: '11px', color: '#9ca3af' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4b5563', fontWeight: 600 }}>
                      <ThumbsUp size={12} /> {post.upvotes} upvotes
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4b5563', fontWeight: 600 }}>
                      <MessageSquare size={12} /> {post.numComments || 0} comments
                    </span>
                  </div>

                  {post.url && (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#0284c7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}
                    >
                      View on Reddit <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
