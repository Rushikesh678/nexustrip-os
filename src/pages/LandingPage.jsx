import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass, ArrowRight, ShieldCheck, Zap, Users, Receipt, CheckCircle2,
  Calculator, Sparkles, Scale, Layers, MapPin,
  CalendarCheck, Clock, FileText, BookOpen, Camera,
  Check, TrendingUp, KeyRound, Tag, Utensils
} from 'lucide-react';

export const LandingPage = () => {
  // Interactive Calculator State
  const [numTravelers, setNumTravelers] = useState(5);
  const [totalExpenses, setTotalExpenses] = useState(4800);
  const [studentDiscount, setStudentDiscount] = useState(true);
  const [hasSponsor, setHasSponsor] = useState(true);

  // Interactive Feature Explorer Tab State
  const [activeFeatureTab, setActiveFeatureTab] = useState('itinerary');

  // Calculated stats for demo calculator
  // Total weight: standard = 1.0, student = 0.8, sponsor = 1.5
  const sponsorWeight = hasSponsor ? 1.5 : 1.0;
  const studentWeight = studentDiscount ? 0.8 : 1.0;
  const standardCount = Math.max(1, numTravelers - (hasSponsor ? 1 : 0) - (studentDiscount ? 1 : 0));
  const totalWeights = (hasSponsor ? sponsorWeight : 0) + (studentDiscount ? studentWeight : 0) + (standardCount * 1.0);
  
  const baseShare = totalExpenses / (totalWeights || 1);
  const calculatedStandardShare = baseShare.toFixed(2);
  const calculatedStudentShare = (baseShare * 0.8).toFixed(2);
  const calculatedSponsorShare = (baseShare * 1.5).toFixed(2);
  const minimizedTransactions = Math.max(1, numTravelers - 1);
  const rawPairwiseTransactions = (numTravelers * (numTravelers - 1)) / 2;

  // Feature Explorer Modules
  const featureModules = [
    {
      id: 'itinerary',
      title: 'Day-by-Day Itinerary',
      icon: Compass,
      badge: 'COLLABORATIVE TIMELINE',
      color: 'var(--color-meadow)',
      tagline: 'Time-slotted multi-day schedule with direct cost & booking integration',
      description: 'Organize each day into Morning, Afternoon, Evening, and Night blocks. Tag activities with categories like Dining, Lodging, Transport, and Adventures. Attach actual expenses and bookings directly to specific blocks with 1-click.',
      highlights: [
        'Time slot grouping: Morning, Afternoon, Evening, Night & Custom hours',
        'Direct 1-click links to group expenses and OCR receipt scans',
        'Auto-generate itinerary from confirmed bookings and trip dates',
        'Visual category tags with cost estimates vs actual variances'
      ]
    },
    {
      id: 'expenses',
      title: 'Expenses & Side Quests',
      icon: Receipt,
      badge: 'ADVANCED SPLITTING',
      color: 'var(--color-river-blue)',
      tagline: 'Equal, percentage, tiered multipliers & isolated side-quest sub-groups',
      description: 'No more one-size-fits-all splitting. Split by exact amounts, percentage shares, or custom multipliers (Student 0.8x, Sponsor 1.5x). Run Side Quests for private sub-adventures (e.g., scuba diving) without billing uninvolved friends.',
      highlights: [
        '4 Split Modes: Equal, Weighted %, Custom Amounts & Multipliers',
        'Side Quests: Isolate sub-group costs from non-participating members',
        'Multi-Payer support: Record expenses funded by multiple people',
        'Automated early departure freeze so departed travelers aren\'t billed'
      ]
    },
    {
      id: 'ocr',
      title: 'Smart Receipt OCR',
      icon: Camera,
      badge: 'AUTOMATED SCANNER',
      color: 'var(--color-sun-yellow)',
      tagline: 'Instant itemized bill extraction with drag-and-drop participant assignment',
      description: 'Snap a picture of any cafe bill, grocery invoice, or tour receipt. The OCR engine parses line items, taxes, tips, and service fees, letting you assign individual meals and drinks to specific travelers in seconds.',
      highlights: [
        'Instant camera upload or drag-and-drop bill image processing',
        'Automated line-item, subtotal, tax, and tip extraction',
        'Assign items to one or multiple travelers with individual checkboxes',
        'Direct ledger injection into trip expenses with verified receipts'
      ]
    },
    {
      id: 'bookings',
      title: 'Bookings & Reservations',
      icon: CalendarCheck,
      badge: 'CENTRALIZED VAULT',
      color: '#a78bfa',
      tagline: 'All flights, hotels, Airbnb stays, car rentals & tickets in one secure hub',
      description: 'Keep your group organized with structured reservation cards. Track confirmation numbers, check-in / check-out times, departure gates, ticket attachments, and reservation statuses (Confirmed, Pending, Cancelled).',
      highlights: [
        'Support for Flights, Hotels, Airbnbs, Car Rentals, Trains & Events',
        'Store confirmation codes, provider links, and voucher attachments',
        'Track payer attribution and shared cost distribution seamlessly',
        'Sync booking dates directly into your master trip itinerary'
      ]
    },
    {
      id: 'settlement',
      title: 'Settlement & Debt Minimizer',
      icon: Scale,
      badge: 'GRAPH SIMPLIFICATION',
      color: 'var(--color-meadow)',
      tagline: 'Greedy algorithm that collapses complex debt webs into minimum payments',
      description: 'Eliminate awkward multi-way transfers. TripLedger calculates the mathematical net balances of every traveler and optimizes debts to minimize the total number of transactions required to settle up completely.',
      highlights: [
        'Reduces N*(N-1)/2 complex debts to at most N-1 simple direct transfers',
        'Direct UPI & payment tracking with 1-click "Mark as Paid" status',
        'Interactive Settlement Matrix showing pairwise balance details',
        'Audit-verified receipts for each settled payment'
      ]
    },
    {
      id: 'ledger',
      title: 'Double-Entry Audit Ledger',
      icon: BookOpen,
      badge: 'MATHEMATICAL RIGOR',
      color: 'var(--color-river-blue)',
      tagline: 'Strict debit and credit financial accounting with immutable audit trail',
      description: 'Built on real accounting principles. Every transaction generates matching debit and credit entries. Every recalculation, refund, and payment is permanently timestamped for complete trust and transparency.',
      highlights: [
        'Strict Double-Entry bookkeeping: Total Debits strictly equal Total Credits',
        'Immutable timestamped transaction log with actor ID tracking',
        'Filterable audit view by traveler, date range, and expense category',
        'Zero math discrepancies — guaranteed financial accuracy'
      ]
    },
    {
      id: 'recommendations',
      title: 'Smart AI Recommendations',
      icon: Sparkles,
      badge: 'DESTINATION AI',
      color: 'var(--color-sun-yellow)',
      tagline: 'Curated spots, cafes, attractions & activities with 1-click itinerary add',
      description: 'Discover the best attractions, dining hotspots, adventure activities, nightlife, and local travel tips for your destination. Easily add any recommended place straight into your daily schedule with a single click.',
      highlights: [
        'Curated categories: Dining, Sightseeing, Adventure, Nightlife & Hidden Gems',
        'Real-time destination switching for multi-city road trips',
        '1-click "Add to Itinerary" with pre-filled category and location details',
        'Detailed descriptions, price hints, and insider tips'
      ]
    },
    {
      id: 'reports',
      title: 'Trip Financial Reports',
      icon: FileText,
      badge: 'EXECUTIVE EXPORT',
      color: '#fb923c',
      tagline: 'Visual category analytics, per-person statements & PDF / CSV ledger export',
      description: 'Get a crystal-clear post-trip financial debrief. View category spending charts, budget variance reports, individual statements for each member, and download complete PDF and CSV files for tax or personal records.',
      highlights: [
        'Category breakdown charts: Food, Lodging, Transport, Activities, Misc',
        'Individual statements: exactly what each member paid, consumed & settled',
        'Budget vs Actual variance metrics with over-budget alerts',
        'Print-ready PDF reports and raw ledger CSV exports'
      ]
    }
  ];

  const currentFeature = featureModules.find(m => m.id === activeFeatureTab) || featureModules[0];

  return (
    <div style={{ backgroundColor: 'var(--color-paper-cream)', minHeight: '100vh', color: 'var(--color-charcoal)' }}>
      
      {/* 1. HERO SECTION */}
      <section style={{
        backgroundColor: 'var(--color-forest-ink)',
        color: 'var(--color-paper-cream)',
        paddingTop: 'clamp(40px, 8vw, 80px)',
        paddingBottom: 'clamp(50px, 9vw, 90px)',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '2px solid var(--color-sage-border)'
      }}>
        <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)' }}>

          {/* Top Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span className="eyebrow-label">00 / THE COMPLETE GROUP TRIP OPERATING SYSTEM</span>
            <div style={{ height: '1px', flex: 1, minWidth: '40px', backgroundColor: 'var(--color-sage-border)' }} />
            <span style={{ fontSize: '11px', color: 'var(--color-meadow)', fontWeight: 700, letterSpacing: '0.1em' }}>
              ● 10 CORE INTEGRATED MODULES
            </span>
          </div>

          {/* Massive Display Title */}
          <h1 className="deacon-display" style={{
            fontSize: 'clamp(38px, 7.5vw, 104px)',
            color: 'var(--color-paper-cream)',
            marginBottom: '18px',
            maxWidth: '1060px',
            lineHeight: 0.92
          }}>
            PLAN TOGETHER.<br />
            SPLIT PRECISELY.<br />
            <span style={{ color: 'var(--color-meadow)' }}>SETTLE WITHOUT THE DRAMA.</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(15px, 2.1vw, 21px)',
            color: '#c9d1c8',
            maxWidth: '780px',
            lineHeight: 1.5,
            marginBottom: '32px',
            fontFamily: 'var(--font-graphik)'
          }}>
            The all-in-one group trip platform engineered with <strong>double-entry ledger rigor</strong>. Day-by-day collaborative itineraries, receipt OCR scanning, isolated side quests, centralized bookings hub, AI discovery, and minimal debt settlements.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', marginBottom: '36px' }}>
            <Link to="/register" className="btn-meadow" style={{ flexGrow: 0 }}>
              START FREE TRIP <ArrowRight size={18} />
            </Link>
            <a href="#feature-explorer" className="btn-ghost-dark" style={{ flexGrow: 0 }}>
              EXPLORE ALL FEATURES
            </a>
            <a href="#calculator" className="btn-ghost-dark" style={{ flexGrow: 0 }}>
              LIVE SPLIT CALCULATOR
            </a>
          </div>

          {/* Quick Feature Ticker Pills */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '40px',
            borderTop: '1px solid rgba(86,96,83,0.6)',
            paddingTop: '16px'
          }}>
            {[
              { icon: Compass, text: 'Day-by-Day Itinerary' },
              { icon: Receipt, text: 'Side Quest Sub-Splits' },
              { icon: Camera, text: 'Smart OCR Bill Scanner' },
              { icon: CalendarCheck, text: 'Centralized Bookings' },
              { icon: Scale, text: 'Minimal Debt Settle' },
              { icon: BookOpen, text: 'Double-Entry Ledger' },
              { icon: Sparkles, text: 'AI Destination Insights' },
              { icon: FileText, text: 'Executive PDF Reports' }
            ].map((pill, idx) => {
              const Icon = pill.icon;
              return (
                <div key={idx} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  color: '#e5e7eb',
                  fontWeight: 600
                }}>
                  <Icon size={13} color="var(--color-meadow)" />
                  {pill.text}
                </div>
              );
            })}
          </div>

          {/* HERO IMAGE FRAMEWORK */}
          <div style={{
            position: 'relative',
            borderRadius: '20px',
            border: '2px solid var(--color-sage-border)',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
            backgroundColor: 'var(--color-deep-navy)'
          }}>
            <img
              src="/forest.png"
              alt="Vintage Forest Expedition Hero Artwork"
              style={{
                width: '100%',
                maxHeight: '440px',
                minHeight: '220px',
                objectFit: 'cover',
                display: 'block'
              }}
            />

            {/* Overlapping Badges */}
            <div style={{ position: 'absolute', top: 'clamp(10px, 2.5vw, 24px)', left: 'clamp(10px, 2.5vw, 24px)' }}>
              <span className="sticker-badge">FULL EXPEDITION ENGINE</span>
            </div>

            <div style={{ position: 'absolute', top: 'clamp(10px, 2.5vw, 24px)', right: 'clamp(10px, 2.5vw, 24px)' }}>
              <span className="sticker-badge-navy">DOUBLE-ENTRY LEDGER VERIFIED</span>
            </div>

            {/* Floating Live Trip Status Card */}
            <div style={{
              position: 'absolute',
              bottom: 'clamp(10px, 2.5vw, 20px)',
              left: 'clamp(10px, 2.5vw, 20px)',
              right: 'clamp(10px, 2.5vw, 20px)',
              backgroundColor: 'rgba(18, 35, 21, 0.94)',
              backdropFilter: 'blur(10px)',
              padding: 'clamp(12px, 2vw, 16px) clamp(14px, 3vw, 20px)',
              borderRadius: '14px',
              border: '1px solid var(--color-sage-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-meadow)',
                  color: 'var(--color-forest-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  flexShrink: 0
                }}>
                  <Compass size={22} />
                </div>
                <div>
                  <h4 style={{ color: 'var(--color-paper-cream)', fontSize: '15px', marginBottom: '2px', fontWeight: 800 }}>
                    MANALI HIMALAYAN EXPEDITION 2026
                  </h4>
                  <p style={{ color: 'var(--color-moss-gray)', fontSize: '12px' }}>
                    6 Members • ₹48,500 Group Spend • 100% Balanced • 2 Side Quests Active
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge badge-success" style={{ fontSize: '11px' }}>
                  <ShieldCheck size={12} /> Ledger In Sync
                </span>
                <span className="badge badge-sidequest" style={{ fontSize: '11px' }}>
                  OCR Active
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* 2. THE 10 CORE PLATFORM PILLARS (ALL WEBSITE FEATURES SHOWCASE) */}
      <section style={{ padding: 'clamp(48px, 8vw, 96px) 0', borderBottom: '1px solid var(--color-sage-border)' }}>
        <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto clamp(36px, 6vw, 64px) auto' }}>
            <span className="eyebrow-label">01 / COMPLETE FEATURE DIRECTORY</span>
            <h2 style={{ fontSize: 'clamp(28px, 5.5vw, 62px)', marginTop: '12px', color: 'var(--color-forest-ink)' }}>
              EVERY FEATURE YOUR TRIP NEEDS.<br />NONE OF THE GUESSWORK.
            </h2>
            <p style={{ fontSize: '16px', color: '#555555', marginTop: '12px', lineHeight: 1.5 }}>
              From initial itinerary drafting to the final settlement UPI transfer, TripLedger covers the complete group expedition lifecycle with real-time financial tracking and mathematical accuracy.
            </p>
          </div>

          {/* Comprehensive 10-Feature Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '24px'
          }}>

            {/* Feature 1: Day-by-Day Itinerary */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--color-meadow)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--color-forest-ink)', color: 'var(--color-meadow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Compass size={22} />
                  </div>
                  <span className="badge badge-primary">ITINERARY BUILDER</span>
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Collaborative Day Timeline</h3>
                <p style={{ fontSize: '14px', color: '#555555', lineHeight: 1.5, marginBottom: '16px' }}>
                  Build day-by-day schedules partitioned into Morning, Afternoon, Evening, and Night time slots. Tag activities by Dining, Transport, Lodging, and Adventures.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-forest-ink)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-meadow)" /> Time slot & category organization
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-meadow)" /> 1-Click link expenses & bookings to blocks
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-meadow)" /> Auto-sync from reservation dates
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2: Multi-Model Split & Side Quests */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--color-river-blue)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--color-forest-ink)', color: 'var(--color-river-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Receipt size={22} />
                  </div>
                  <span className="badge badge-sidequest">SIDE QUEST ENGINE</span>
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Expenses & Side Quests</h3>
                <p style={{ fontSize: '14px', color: '#555555', lineHeight: 1.5, marginBottom: '16px' }}>
                  Split costs equally, by percentages, custom amounts, or role multipliers. Launch <em>Side Quests</em> for sub-group adventures so only participating members pay.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-forest-ink)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-river-blue)" /> 4 flexible split calculation modes
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-river-blue)" /> Side Quests isolate uninvolved members
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-river-blue)" /> Multi-payer funding supported
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3: Smart Receipt OCR */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--color-sun-yellow)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--color-forest-ink)', color: 'var(--color-sun-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={22} />
                  </div>
                  <span className="badge badge-warning">SMART OCR</span>
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Receipt OCR Bill Scanner</h3>
                <p style={{ fontSize: '14px', color: '#555555', lineHeight: 1.5, marginBottom: '16px' }}>
                  Snap or upload any paper restaurant bill or grocery invoice. The OCR automatically parses item lines, tax, and tips, letting you assign individual dishes to travelers.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-forest-ink)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-sun-yellow)" /> Instant itemized line-item extraction
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-sun-yellow)" /> Item-by-item participant assignment
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-sun-yellow)" /> Automatic tax & service fee allocation
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 4: Centralized Bookings */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #a78bfa' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--color-forest-ink)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CalendarCheck size={22} />
                  </div>
                  <span className="badge badge-primary">RESERVATIONS HUB</span>
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Centralized Bookings Hub</h3>
                <p style={{ fontSize: '14px', color: '#555555', lineHeight: 1.5, marginBottom: '16px' }}>
                  Store all flight tickets, hotel & Airbnb stays, rental car reservations, train passes, and event tickets with confirmation codes, times, and member allocations.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-forest-ink)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="#a78bfa" /> Flight, Stay, Car, Train, Activity types
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="#a78bfa" /> Confirmation numbers & voucher storage
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="#a78bfa" /> Real-time status (Confirmed/Pending)
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 5: Settlement & Debt Minimizer */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--color-meadow)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--color-forest-ink)', color: 'var(--color-meadow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scale size={22} />
                  </div>
                  <span className="badge badge-success">DEBT MINIMIZER</span>
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Settlement Matrix & Minimizer</h3>
                <p style={{ fontSize: '14px', color: '#555555', lineHeight: 1.5, marginBottom: '16px' }}>
                  Greedy graph reduction simplifies messy webs of mutual IOUs into the absolute minimum number of direct transactions. Includes direct "Mark as Paid" UPI tracking.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-forest-ink)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-meadow)" /> Collapses complex debts down to N-1
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-meadow)" /> Pairwise debt grid and personal view
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-meadow)" /> 1-Click Settle & UPI reference logs
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 6: Double-Entry Ledger */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--color-river-blue)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--color-forest-ink)', color: 'var(--color-river-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={22} />
                  </div>
                  <span className="badge badge-primary">AUDIT TRAIL</span>
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Double-Entry Ledger Audit</h3>
                <p style={{ fontSize: '14px', color: '#555555', lineHeight: 1.5, marginBottom: '16px' }}>
                  True accounting rigor. Every transaction generates debit and credit ledger rows. Full audit history with timestamps means every cent is verified and transparent.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-forest-ink)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-river-blue)" /> Debits equal Credits mathematical guarantee
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-river-blue)" /> Immutable timestamped audit trails
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-river-blue)" /> Filter by member, date, or category
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 7: Smart AI Recommendations */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--color-sun-yellow)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--color-forest-ink)', color: 'var(--color-sun-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={22} />
                  </div>
                  <span className="badge badge-warning">AI DISCOVERY</span>
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>AI Destination Insights</h3>
                <p style={{ fontSize: '14px', color: '#555555', lineHeight: 1.5, marginBottom: '16px' }}>
                  Get smart destination recommendations for top sights, hidden eateries, adventure spots, and nightlife. Add any suggestion directly to your itinerary with 1 click.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-forest-ink)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-sun-yellow)" /> Curated dining, activities & hidden gems
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-sun-yellow)" /> 1-Click "Add to Itinerary" integration
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-sun-yellow)" /> Multi-city destination switcher
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 8: People & Early Departure Proration */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #ec4899' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--color-forest-ink)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={22} />
                  </div>
                  <span className="badge badge-danger">PEOPLE & ROLES</span>
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Early Departures & Multipliers</h3>
                <p style={{ fontSize: '14px', color: '#555555', lineHeight: 1.5, marginBottom: '16px' }}>
                  Friend leaving 2 days early? TripLedger auto-freezes their allocation dates so they are only billed for the days they attended. Set Student (0.8x) and Sponsor (1.5x) tiers.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-forest-ink)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="#ec4899" /> Automated departure date proration
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="#ec4899" /> Tiered multipliers (Sponsor/Student/Custom)
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="#ec4899" /> Host vs Participant permissions
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 9: Financial Health & Live Budget */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--color-meadow)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--color-forest-ink)', color: 'var(--color-meadow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={22} />
                  </div>
                  <span className="badge badge-success">BUDGET TRACKER</span>
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Financial Health Dashboard</h3>
                <p style={{ fontSize: '14px', color: '#555555', lineHeight: 1.5, marginBottom: '16px' }}>
                  Live overview of total group spend vs budget targets. Real-time per-member metrics: "Total You Paid", "Your Share Owed", and active Side Quest tallies with over-budget alerts.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-forest-ink)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-meadow)" /> Real-time budget progress & warning banners
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-meadow)" /> Personal balance cards & net positions
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="var(--color-meadow)" /> Destination weather & time widget
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 10: Executive Reports & Exports */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #fb923c' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--color-forest-ink)', color: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={22} />
                  </div>
                  <span className="badge badge-warning">REPORTS & EXPORTS</span>
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Executive Trip Reports</h3>
                <p style={{ fontSize: '14px', color: '#555555', lineHeight: 1.5, marginBottom: '16px' }}>
                  Comprehensive end-of-trip debrief reports. Breakdown by expense categories (Food, Lodging, Transport, Activities), individual financial statements, and 1-click PDF/CSV export.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-forest-ink)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="#fb923c" /> Category spend breakdown & visual charts
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="#fb923c" /> Per-member itemized financial statement
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} color="#fb923c" /> Print-ready PDF & CSV ledger downloads
                  </li>
                </ul>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* 3. INTERACTIVE FEATURE EXPLORER & LIVE MOCKUP PREVIEW */}
      <section id="feature-explorer" style={{ padding: 'clamp(48px, 8vw, 96px) 0', backgroundColor: '#eae4d9', borderBottom: '1px solid var(--color-sage-border)' }}>
        <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)' }}>

          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto clamp(28px, 5vw, 48px) auto' }}>
            <span className="eyebrow-label">02 / INTERACTIVE PLATFORM EXPLORER</span>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 56px)', marginTop: '12px', color: 'var(--color-forest-ink)' }}>
              SEE HOW EACH MODULE WORKS
            </h2>
            <p style={{ fontSize: '15px', color: '#555555', marginTop: '10px' }}>
              Click through the modules below to preview how TripLedger streamlines every dimension of your group expedition.
            </p>
          </div>

          {/* Module Selector Pills */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
            marginBottom: '32px'
          }}>
            {featureModules.map(m => {
              const Icon = m.icon;
              const isActive = activeFeatureTab === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveFeatureTab(m.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: isActive ? '1px solid var(--color-forest-ink)' : '1px solid var(--color-sage-border)',
                    backgroundColor: isActive ? 'var(--color-forest-ink)' : 'var(--color-paper-cream)',
                    color: isActive ? 'var(--color-meadow)' : 'var(--color-forest-ink)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 12px rgba(18,35,21,0.2)' : 'none'
                  }}
                >
                  <Icon size={16} />
                  {m.title}
                </button>
              );
            })}
          </div>

          {/* Active Module Interactive Display Card */}
          <div className="card-cream" style={{
            backgroundColor: '#ffffff',
            border: '2px solid var(--color-sage-border)',
            padding: 'clamp(24px, 4vw, 40px)',
            boxShadow: '0 16px 48px rgba(18,35,21,0.1)'
          }}>
            <div className="responsive-grid-2" style={{ alignItems: 'center', gap: '36px' }}>
              
              {/* Left Column: Details */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span className="sticker-badge" style={{ transform: 'none' }}>
                    {currentFeature.badge}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--color-moss-gray)', fontWeight: 700 }}>
                    MODULE 0{featureModules.findIndex(m => m.id === currentFeature.id) + 1} OF 08
                  </span>
                </div>

                <h3 style={{ fontSize: 'clamp(24px, 4vw, 38px)', color: 'var(--color-forest-ink)', marginBottom: '8px' }}>
                  {currentFeature.title}
                </h3>
                <h4 style={{ fontSize: '16px', color: '#4b5563', fontWeight: 600, marginBottom: '18px', fontStyle: 'italic' }}>
                  "{currentFeature.tagline}"
                </h4>
                <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6, marginBottom: '24px' }}>
                  {currentFeature.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {currentFeature.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'var(--color-forest-ink)', fontWeight: 500 }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(85,221,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <Check size={13} color="var(--color-forest-ink)" />
                      </div>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link to="/register" className="btn-primary">
                    TRY {currentFeature.title.toUpperCase()} <ArrowRight size={16} />
                  </Link>
                  <Link to="/login" className="btn-secondary">
                    SIGN IN TO WORKSPACE
                  </Link>
                </div>
              </div>

              {/* Right Column: Live Mockup Card */}
              <div style={{
                backgroundColor: 'var(--color-forest-ink)',
                borderRadius: '16px',
                padding: '24px',
                color: 'var(--color-paper-cream)',
                border: '1px solid var(--color-sage-border)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
              }}>
                {/* Mockup Top Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '14px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <span style={{ fontSize: '12px', color: 'var(--color-moss-gray)', marginLeft: '8px', fontFamily: 'var(--font-mono)' }}>
                      trip://workspace/{currentFeature.id}
                    </span>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '10px' }}>LIVE PREVIEW</span>
                </div>

                {/* Tab Specific Live Previews */}
                {activeFeatureTab === 'itinerary' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-meadow)' }}>DAY 02 • SATURDAY, OCT 18</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-moss-gray)' }}>3 Planned Blocks • ₹3,800 Total</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Block 1 */}
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px', borderLeft: '3px solid #ea580c' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-moss-gray)', marginBottom: '4px' }}>
                          <span>🌅 MORNING (08:30 - 10:30)</span>
                          <span style={{ color: '#ea580c', fontWeight: 700 }}>🍽️ DINING</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#ffffff' }}>Artisan Bakery & Cafe Breakfast</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px', color: '#d1d5db' }}>
                          <span>📍 Old Town Square</span>
                          <span style={{ color: 'var(--color-meadow)', fontWeight: 700 }}>₹1,400 (Linked to Expense #12)</span>
                        </div>
                      </div>

                      {/* Block 2 */}
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px', borderLeft: '3px solid #16a34a' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-moss-gray)', marginBottom: '4px' }}>
                          <span>☀️ AFTERNOON (13:00 - 16:30)</span>
                          <span style={{ color: '#16a34a', fontWeight: 700 }}>🏄 ACTIVITY</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#ffffff' }}>River Rafting & Cliff Jump Expedition</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px', color: '#d1d5db' }}>
                          <span>📍 Rapids Sector 4</span>
                          <span style={{ color: '#a78bfa', fontWeight: 700 }}>🎫 Booking #BK-902 Attached</span>
                        </div>
                      </div>

                      {/* Block 3 */}
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px', borderLeft: '3px solid #7c3aed' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-moss-gray)', marginBottom: '4px' }}>
                          <span>🌇 EVENING (18:00 - 20:00)</span>
                          <span style={{ color: '#7c3aed', fontWeight: 700 }}>🚗 TRANSPORT</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#ffffff' }}>Sunset Mountain Shuttle to Villa</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px', color: '#d1d5db' }}>
                          <span>📍 Hilltop Lookouts</span>
                          <span style={{ color: 'var(--color-river-blue)', fontWeight: 700 }}>Shared among 5 members</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeFeatureTab === 'expenses' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-river-blue)' }}>ACTIVE GROUP EXPENSES</span>
                      <span className="badge badge-sidequest" style={{ fontSize: '10px' }}>1 SIDE QUEST ACTIVE</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Standard Shared */}
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>Villa Rental (3 Nights)</span>
                          <span style={{ color: 'var(--color-meadow)', fontWeight: 800, fontSize: '15px' }}>₹24,000</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-moss-gray)', marginTop: '4px' }}>
                          <span>Paid by Alex • Split: Equal (5 members)</span>
                          <span style={{ color: '#93c5fd' }}>₹4,800/person</span>
                        </div>
                      </div>

                      {/* Side Quest Item */}
                      <div style={{ backgroundColor: 'rgba(126,34,206,0.18)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(216,180,254,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="badge badge-sidequest" style={{ fontSize: '9px', padding: '2px 6px' }}>SIDE QUEST</span>
                            <span style={{ fontWeight: 700, fontSize: '14px' }}>Scuba Diving Gear & Boat</span>
                          </div>
                          <span style={{ color: '#d8b4fe', fontWeight: 800, fontSize: '15px' }}>₹6,000</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#e9d5ff', marginTop: '4px' }}>
                          <span>Only Alex, Maya & Carter (3/5 members)</span>
                          <span style={{ fontWeight: 700 }}>₹2,000/adventurer</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#c084fc', marginTop: '4px', fontStyle: 'italic' }}>
                          🔒 Uninvolved travelers excluded automatically
                        </div>
                      </div>

                      {/* Tiered Multiplier Split */}
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>Group Banquet Dinner</span>
                          <span style={{ color: 'var(--color-sun-yellow)', fontWeight: 800, fontSize: '15px' }}>₹7,500</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-moss-gray)', marginTop: '4px' }}>
                          <span>Tiered: Sponsor (1.5x), Student (0.8x)</span>
                          <span style={{ color: 'var(--color-paper-cream)' }}>₹1,132 to ₹2,122</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeFeatureTab === 'ocr' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-sun-yellow)' }}>OCR PARSED RECEIPT: CAFE NIRVANA</span>
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>✓ 100% CONFIDENCE</span>
                    </div>

                    <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px dashed rgba(255,255,255,0.15)', paddingBottom: '6px', marginBottom: '6px' }}>
                        <span>2x Wood-Fired Margherita Pizza</span>
                        <span style={{ fontWeight: 700 }}>₹900.00 → (Alex, Maya)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px dashed rgba(255,255,255,0.15)', paddingBottom: '6px', marginBottom: '6px' }}>
                        <span>1x Truffle Pasta & Garlic Bread</span>
                        <span style={{ fontWeight: 700 }}>₹650.00 → (Carter)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px dashed rgba(255,255,255,0.15)', paddingBottom: '6px', marginBottom: '6px' }}>
                        <span>4x Specialty Cold Brews</span>
                        <span style={{ fontWeight: 700 }}>₹800.00 → (All Members)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-moss-gray)' }}>
                        <span>Taxes & 10% Service Charge</span>
                        <span>₹235.00 → (Proportional)</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'rgba(85,221,74,0.15)', borderRadius: '8px', border: '1px solid rgba(85,221,74,0.3)' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-meadow)' }}>Total Bill: ₹2,585.00</span>
                      <span style={{ fontSize: '11px', color: '#ffffff' }}>✓ Injected to Ledger with Image Proof</span>
                    </div>
                  </div>
                )}

                {activeFeatureTab === 'bookings' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: '#a78bfa' }}>CENTRALIZED RESERVATIONS</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-moss-gray)' }}>4 Active Bookings</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Flight */}
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px' }}>✈️ Indigo Flight 6E-204 (DEL → KUU)</span>
                          <span className="badge badge-success" style={{ fontSize: '9px' }}>CONFIRMED</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-moss-gray)', marginTop: '4px' }}>
                          <span>PNR: <strong>6EQK92</strong> • Departs: 07:15 AM</span>
                          <span style={{ color: 'var(--color-paper-cream)' }}>₹18,200 (4 Pax)</span>
                        </div>
                      </div>

                      {/* Hotel */}
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px' }}>🏨 Cedar Ridge Alpine Chalet</span>
                          <span className="badge badge-success" style={{ fontSize: '9px' }}>CONFIRMED</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-moss-gray)', marginTop: '4px' }}>
                          <span>Conf: <strong>#CR-88910</strong> • Check-in: 02:00 PM</span>
                          <span style={{ color: 'var(--color-paper-cream)' }}>₹32,000 (3 Nights)</span>
                        </div>
                      </div>

                      {/* Car Rental */}
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px' }}>🚗 4x4 Mountain SUV Rental</span>
                          <span className="badge badge-primary" style={{ fontSize: '9px' }}>RESERVED</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-moss-gray)', marginTop: '4px' }}>
                          <span>Pickup: Airport Counter • Self Drive</span>
                          <span style={{ color: 'var(--color-paper-cream)' }}>₹8,400</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeFeatureTab === 'settlement' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-meadow)' }}>DEBT MINIMIZER: 10 DEBTS → 2 PAYMENTS</span>
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>OPTIMIZED</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ backgroundColor: 'rgba(85,221,74,0.12)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(85,221,74,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>Carter pays Alex</span>
                          <span style={{ color: 'var(--color-meadow)', fontWeight: 800, fontSize: '16px' }}>₹3,450</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#d1d5db', marginTop: '6px' }}>
                          <span>UPI: <code>alex@okhdfc</code></span>
                          <span style={{ color: '#86efac', fontWeight: 700 }}>✓ Settled & Marked Paid</span>
                        </div>
                      </div>

                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>Maya pays Alex</span>
                          <span style={{ color: 'var(--color-river-blue)', fontWeight: 800, fontSize: '16px' }}>₹1,820</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#d1d5db', marginTop: '6px' }}>
                          <span>UPI: <code>alex@okhdfc</code></span>
                          <span style={{ color: 'var(--color-sun-yellow)', fontWeight: 700 }}>⏳ Pending UPI Transfer</span>
                        </div>
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--color-moss-gray)', textAlign: 'center', paddingTop: '6px' }}>
                        ⚡ 8 intermediate circular debts removed automatically
                      </div>
                    </div>
                  </div>
                )}

                {activeFeatureTab === 'ledger' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-river-blue)' }}>DOUBLE-ENTRY AUDIT LOG</span>
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>Σ DEBITS = Σ CREDITS</span>
                    </div>

                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '10px', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--color-moss-gray)' }}>TX-89104 | 2026-10-18 14:22:01 | Villa Payment</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#86efac', marginTop: '4px' }}>
                          <span>CR: Asset/Cash (Alex)</span>
                          <span>₹24,000.00</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#93c5fd' }}>
                          <span>DR: Expense/Lodging (5 Members)</span>
                          <span>₹24,000.00</span>
                        </div>
                      </div>

                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '10px', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--color-moss-gray)' }}>TX-89105 | 2026-10-18 19:40:15 | Scuba Side Quest</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#86efac', marginTop: '4px' }}>
                          <span>CR: Asset/Cash (Maya)</span>
                          <span>₹6,000.00</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d8b4fe' }}>
                          <span>DR: SideQuest/Activity (3 Members)</span>
                          <span>₹6,000.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeFeatureTab === 'recommendations' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-sun-yellow)' }}>AI CURATED PLACES FOR MANALI</span>
                      <span className="badge badge-warning" style={{ fontSize: '10px' }}>AI RECOMMENDATIONS</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '13px' }}>🌲 Jogini Waterfall Sunrise Trek</span>
                            <div style={{ fontSize: '11px', color: 'var(--color-moss-gray)', marginTop: '2px' }}>Vashisht Village • 2.5 hrs • Moderate Trail</div>
                          </div>
                          <span className="badge badge-success" style={{ fontSize: '9px' }}>+ ADD TO ITINERARY</span>
                        </div>
                      </div>

                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '13px' }}>☕ Drifter's Cafe & Live Acoustic</span>
                            <div style={{ fontSize: '11px', color: 'var(--color-moss-gray)', marginTop: '2px' }}>Old Manali • Wood-fired Pizzas & Local Cider</div>
                          </div>
                          <span className="badge badge-success" style={{ fontSize: '9px' }}>+ ADD TO ITINERARY</span>
                        </div>
                      </div>

                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '13px' }}>🪂 Solang Valley Tandem Paragliding</span>
                            <div style={{ fontSize: '11px', color: 'var(--color-moss-gray)', marginTop: '2px' }}>Solang Valley • High altitude flights with GoPro</div>
                          </div>
                          <span className="badge badge-success" style={{ fontSize: '9px' }}>+ ADD TO ITINERARY</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeFeatureTab === 'reports' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: '#fb923c' }}>FINANCIAL DEBRIEF REPORT</span>
                      <span className="badge badge-warning" style={{ fontSize: '10px' }}>EXPORT READY</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '10px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--color-moss-gray)' }}>TOTAL SPEND</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-paper-cream)' }}>₹62,400</div>
                      </div>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '10px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--color-moss-gray)' }}>BUDGET UTILIZATION</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-meadow)' }}>89.1% (Safe)</div>
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Lodging (Villa & Hotels)</span>
                        <span style={{ fontWeight: 700 }}>₹32,000 (51.3%)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Food & Group Dinners</span>
                        <span style={{ fontWeight: 700 }}>₹14,200 (22.7%)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Transport & Car Rentals</span>
                        <span style={{ fontWeight: 700 }}>₹9,800 (15.7%)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Activities & Side Quests</span>
                        <span style={{ fontWeight: 700 }}>₹6,400 (10.3%)</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button className="btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '11px', justifyContent: 'center' }}>
                        📄 Download PDF
                      </button>
                      <button className="btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '11px', justifyContent: 'center' }}>
                        📊 Export CSV
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

        </div>
      </section>


      {/* 4. INTERACTIVE LIVE SPLIT & DEBT CALCULATOR */}
      <section id="calculator" style={{ padding: 'clamp(48px, 8vw, 96px) 0', borderBottom: '1px solid var(--color-sage-border)' }}>
        <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)' }}>

          <div className="responsive-grid-2" style={{ alignItems: 'center', gap: '40px' }}>
            <div>
              <span className="eyebrow-label">03 / REAL FINANCIAL MATHEMATICS</span>
              <h2 style={{ fontSize: 'clamp(30px, 5vw, 60px)', margin: '14px 0 20px 0', color: 'var(--color-forest-ink)' }}>
                THE POSTER LEDGER PRINCIPLE
              </h2>
              <p style={{ fontSize: '16px', lineHeight: 1.5, color: 'var(--color-charcoal)', marginBottom: '24px' }}>
                Standard expense apps use simple flat averages that fail when someone leaves early, when students get discount shares, or when sponsors cover extra. <strong>TripLedger</strong> uses a double-entry debit/credit ledger structure that guarantees every cent is accounted for.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ padding: '10px', backgroundColor: 'rgba(85,221,74,0.15)', borderRadius: '10px', color: 'var(--color-forest-ink)', flexShrink: 0 }}>
                    <Scale size={22} color="var(--color-forest-ink)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>Automated Settlement Minimization</h4>
                    <p style={{ fontSize: '13px', color: '#555555' }}>Reduces {rawPairwiseTransactions} complex group transactions down to just {minimizedTransactions} direct payments with zero circular debt.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ padding: '10px', backgroundColor: 'rgba(115,211,235,0.2)', borderRadius: '10px', flexShrink: 0 }}>
                    <Sparkles size={22} color="var(--color-forest-ink)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>Multi-Tier Multipliers</h4>
                    <p style={{ fontSize: '13px', color: '#555555' }}>Customize financial weights per person: Sponsor (1.5x), Standard (1.0x), and Student (0.8x).</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ padding: '10px', backgroundColor: 'rgba(255,237,82,0.2)', borderRadius: '10px', flexShrink: 0 }}>
                    <Camera size={22} color="var(--color-forest-ink)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>Camera & Receipt OCR Line Extraction</h4>
                    <p style={{ fontSize: '13px', color: '#555555' }}>Extract dishes, taxes, and service charges automatically from physical paper receipts.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Calculator Sandbox */}
            <div className="card-cream" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', right: '20px' }}>
                <span className="sticker-badge">INTERACTIVE CALCULATOR</span>
              </div>

              <h3 style={{ fontSize: '22px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calculator size={20} color="var(--color-meadow)" /> Live Cost Engine Preview
              </h3>

              {/* Slider 1: Expenses */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  <span>Total Group Expenses:</span>
                  <span style={{ color: 'var(--color-forest-ink)', fontWeight: 800 }}>₹{totalExpenses}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="500"
                  value={totalExpenses}
                  onChange={(e) => setTotalExpenses(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-meadow)', cursor: 'pointer' }}
                />
              </div>

              {/* Slider 2: Travelers */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  <span>Group Travelers:</span>
                  <span style={{ color: 'var(--color-forest-ink)', fontWeight: 800 }}>{numTravelers} People</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="1"
                  value={numTravelers}
                  onChange={(e) => setNumTravelers(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-meadow)', cursor: 'pointer' }}
                />
              </div>

              {/* Toggles: Student & Sponsor Tiers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e8e2d7', padding: '10px 14px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Apply Student Tier (0.8x Multiplier)</span>
                  <input
                    type="checkbox"
                    checked={studentDiscount}
                    onChange={(e) => setStudentDiscount(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-meadow)', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e8e2d7', padding: '10px 14px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Include Sponsor Tier (1.5x Multiplier)</span>
                  <input
                    type="checkbox"
                    checked={hasSponsor}
                    onChange={(e) => setHasSponsor(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-meadow)', cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* Output Display */}
              <div style={{ backgroundColor: 'var(--color-forest-ink)', color: 'var(--color-paper-cream)', padding: '18px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-sage-border)', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-moss-gray)' }}>Standard Traveler Share:</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-paper-cream)' }}>₹{calculatedStandardShare}</span>
                </div>
                {studentDiscount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-sage-border)', paddingBottom: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-meadow)' }}>Student Tier (20% Off):</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-meadow)' }}>₹{calculatedStudentShare}</span>
                  </div>
                )}
                {hasSponsor && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-sage-border)', paddingBottom: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-sun-yellow)' }}>Sponsor Share (1.5x):</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-sun-yellow)' }}>₹{calculatedSponsorShare}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-moss-gray)' }}>Optimized Settlement:</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-river-blue)' }}>
                    {minimizedTransactions} payments max (saved {rawPairwiseTransactions - minimizedTransactions} transfers)
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* 5. COMPARISON MATRIX (TRIPLEDGER VS OTHERS) */}
      <section style={{ padding: 'clamp(48px, 8vw, 96px) 0', backgroundColor: '#eae4d9', borderBottom: '1px solid var(--color-sage-border)' }}>
        <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto clamp(32px, 6vw, 56px) auto' }}>
            <span className="eyebrow-label">04 / WHY WE ARE DIFFERENT</span>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 56px)', marginTop: '12px', color: 'var(--color-forest-ink)' }}>
              BUILT FOR REAL EXPEDITIONS
            </h2>
            <p style={{ fontSize: '15px', color: '#555555', marginTop: '10px' }}>
              Traditional split apps only do basic division. TripLedger connects scheduling, bookings, sub-splits, and accounting rigor into one cohesive platform.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="table-responsive-wrapper" style={{ border: '2px solid var(--color-sage-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-forest-ink)', color: 'var(--color-paper-cream)' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>Platform Capability</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--color-meadow)', backgroundColor: 'rgba(85,221,74,0.12)' }}>TripLedger (Poster OS)</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600, color: '#d1d5db' }}>Generic Split Apps</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600, color: '#d1d5db' }}>Excel / Google Sheets</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-frost)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>Day-by-Day Time-Slotted Itinerary</td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--color-forest-ink)', backgroundColor: 'rgba(85,221,74,0.06)' }}>✓ Integrated with 1-click expenses</td>
                  <td style={{ padding: '14px 20px', color: '#9ca3af' }}>✗ No itinerary feature</td>
                  <td style={{ padding: '14px 20px', color: '#9ca3af' }}>Manual typing only</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-frost)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>Isolated Side Quest Sub-Splits</td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--color-forest-ink)', backgroundColor: 'rgba(85,221,74,0.06)' }}>✓ Sub-group isolation auto-calculated</td>
                  <td style={{ padding: '14px 20px', color: '#9ca3af' }}>Manual unchecking each time</td>
                  <td style={{ padding: '14px 20px', color: '#9ca3af' }}>Complex formulas break</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-frost)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>Smart Receipt OCR Bill Parsing</td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--color-forest-ink)', backgroundColor: 'rgba(85,221,74,0.06)' }}>✓ Itemized dish assignment & tax math</td>
                  <td style={{ padding: '14px 20px', color: '#9ca3af' }}>Paid paywall or basic total only</td>
                  <td style={{ padding: '14px 20px', color: '#9ca3af' }}>✗ None</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-frost)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>Centralized Bookings Hub (Flights/Stays)</td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--color-forest-ink)', backgroundColor: 'rgba(85,221,74,0.06)' }}>✓ Vouchers, PNRs, check-in times stored</td>
                  <td style={{ padding: '14px 20px', color: '#9ca3af' }}>✗ Not available</td>
                  <td style={{ padding: '14px 20px', color: '#9ca3af' }}>Messy links table</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-frost)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>Early Departure Date Proration</td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--color-forest-ink)', backgroundColor: 'rgba(85,221,74,0.06)' }}>✓ Auto-freezes expense allocation</td>
                  <td style={{ padding: '14px 20px', color: '#9ca3af' }}>✗ Impossible without manual math</td>
                  <td style={{ padding: '14px 20px', color: '#9ca3af' }}>Manual date logic</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-frost)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>Double-Entry Ledger Accounting</td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--color-forest-ink)', backgroundColor: 'rgba(85,221,74,0.06)' }}>✓ Strict balance sheet + immutable audit</td>
                  <td style={{ padding: '14px 20px', color: '#9ca3af' }}>Single-entry naive ledger</td>
                  <td style={{ padding: '14px 20px', color: '#9ca3af' }}>Requires CPA skills</td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>AI Destination Insights & 1-Click Add</td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--color-forest-ink)', backgroundColor: 'rgba(85,221,74,0.06)' }}>✓ Curated spots added directly to schedule</td>
                  <td style={{ padding: '14px 20px', color: '#9ca3af' }}>✗ None</td>
                  <td style={{ padding: '14px 20px', color: '#9ca3af' }}>✗ None</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>


      {/* 6. HOW IT WORKS: END-TO-END FLOW */}
      <section style={{ padding: 'clamp(48px, 8vw, 96px) 0', borderBottom: '1px solid var(--color-sage-border)' }}>
        <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto clamp(36px, 6vw, 64px) auto' }}>
            <span className="eyebrow-label">05 / SIMPLE 4-STEP LIFECYCLE</span>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 56px)', marginTop: '12px', color: 'var(--color-forest-ink)' }}>
              HOW TRIPLEDGER RUNS YOUR TRIP
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '20px' }}>
            
            {/* Step 1 */}
            <div className="card-cream" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '20px' }}>
                <span className="sticker-badge">STEP 01</span>
              </div>
              <div style={{ marginTop: '10px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Create & Invite</h3>
                <p style={{ fontSize: '14px', color: '#555555', lineHeight: 1.5 }}>
                  Set your trip name, dates, base currency (INR, USD, EUR), and group budget. Share the 6-character invite code so friends join in seconds.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card-cream" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '20px' }}>
                <span className="sticker-badge-navy">STEP 02</span>
              </div>
              <div style={{ marginTop: '10px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Plan & Book</h3>
                <p style={{ fontSize: '14px', color: '#555555', lineHeight: 1.5 }}>
                  Build your time-slotted itinerary, store flight/hotel booking confirmation codes, and browse AI suggestions for local dining and hidden gems.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card-cream" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '20px' }}>
                <span className="sticker-badge">STEP 03</span>
              </div>
              <div style={{ marginTop: '10px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Track & OCR Scan</h3>
                <p style={{ fontSize: '14px', color: '#555555', lineHeight: 1.5 }}>
                  Snap receipts on the go to auto-allocate dishes. Tag separate mini-adventures as Side Quests to keep uninvolved members completely unbilled.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="card-cream" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '20px' }}>
                <span className="sticker-badge-navy">STEP 04</span>
              </div>
              <div style={{ marginTop: '10px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Settle & Export</h3>
                <p style={{ fontSize: '14px', color: '#555555', lineHeight: 1.5 }}>
                  The debt minimizer reduces complex IOUs to minimum UPI transfers. Mark settlements as paid and download full PDF & CSV reports.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* 7. FIELD REPORT TESTIMONIAL */}
      <section style={{ padding: 'clamp(48px, 8vw, 96px) 0', backgroundColor: '#eae4d9', borderBottom: '1px solid var(--color-sage-border)' }}>
        <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)' }}>

          <div className="responsive-grid-2" style={{ alignItems: 'center', gap: 'clamp(28px, 5vw, 48px)' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                borderRadius: '20px',
                overflow: 'hidden',
                border: '2px solid var(--color-sage-border)',
                boxShadow: 'var(--shadow-preview)'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                  alt="Mountain Traveler Expedition"
                  style={{ width: '100%', height: 'clamp(240px, 45vw, 420px)', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div style={{ position: 'absolute', bottom: '-14px', left: 'clamp(12px, 3vw, 24px)' }}>
                <span className="sticker-badge">VERIFIED TRAIL TESTED</span>
              </div>
            </div>

            <div>
              <span className="eyebrow-label">06 / VERIFIED EXPEDITION LOG</span>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 52px)', margin: '12px 0 18px 0', color: 'var(--color-forest-ink)' }}>
                "WE SAVED 5 HOURS OF MATH AFTER OUR 10-DAY ROADTRIP."
              </h2>
              <blockquote style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--color-charcoal)', lineHeight: 1.5, marginBottom: '20px', fontStyle: 'italic' }}>
                "We had 8 people sharing Airbnb villas, car rentals, and mountain guide fees. Someone left on day 6, and 3 people did a separate paragliding side quest. TripLedger calculated every single prorated debt in seconds with receipt OCR. Nobody complained, and settlements were completed in 3 UPI transfers by midnight."
              </blockquote>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-forest-ink)',
                  color: 'var(--color-meadow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  CW
                </div>
                <div>
                  <div style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-forest-ink)', fontSize: '14px' }}>
                    CARTER & EXPEDITION CREW
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-moss-gray)' }}>Cascade Range Trail Trip • Summer 2026</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* 8. FINAL CALL TO ACTION BANNER */}
      <section style={{
        backgroundColor: 'var(--color-forest-ink)',
        color: 'var(--color-paper-cream)',
        padding: 'clamp(48px, 8vw, 96px) 0',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '840px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)' }}>
          <span className="eyebrow-label">READY FOR YOUR NEXT EXPEDITION</span>
          <h2 className="deacon-display" style={{ fontSize: 'clamp(36px, 7vw, 84px)', margin: '16px 0', color: 'var(--color-paper-cream)' }}>
            EXPERIENCE THE <span style={{ color: 'var(--color-meadow)' }}>ACCURATE</span> TRIP LEDGER
          </h2>
          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#c9d1c8', marginBottom: '32px' }}>
            Create your trip workspace in under 60 seconds. Invite your friends, track bookings, schedule daily timelines, scan receipts, and enjoy seamless settlements.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-meadow">
              CREATE YOUR TRIP NOW <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-ghost-dark">
              SIGN IN TO MY TRIPS
            </Link>
          </div>
        </div>
      </section>


      {/* FLOATING TRIP STATUS CHIP */}
      <div className="floating-chip">
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-meadow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-forest-ink)',
          fontSize: '14px'
        }}>
          ✓
        </div>
        <div>
          <span style={{ fontWeight: 700, display: 'block', fontSize: '12px' }}>TRIP OPERATING SYSTEM</span>
          <span style={{ fontSize: '11px', color: 'var(--color-moss-gray)' }}>10 Integrated Platform Modules</span>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
