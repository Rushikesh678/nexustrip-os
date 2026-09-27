import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ItineraryTab } from '../components/ItineraryTab';
import { DigitalTwinTab } from '../components/DigitalTwin/DigitalTwinTab';
import {
  LayoutDashboard, Receipt, CalendarCheck, Users, BookOpen, Scale, FileText, Settings,
  Plus, Upload, DollarSign, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownLeft,
  Sparkles, Download, Trash2, Edit, UserCheck, ShieldAlert, ArrowRight, RefreshCw, Layers,
  KeyRound, Copy, Check, Smartphone, CreditCard, Banknote, ShieldCheck, Compass, Info, MapPin, Cpu
} from 'lucide-react';

export const TripWorkspace = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [tripData, setTripData] = useState(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [registeredMembers, setRegisteredMembers] = useState([]);
  const [itineraryData, setItineraryData] = useState(null);

  // AI Savings Recommendations state
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsRefreshing, setRecommendationsRefreshing] = useState(false);
  const [activeRecommendationLocation, setActiveRecommendationLocation] = useState(null);

  // Modals state
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [addParticipantMode, setAddParticipantMode] = useState('registered'); // 'registered' | 'manual'
  const [showDepartModal, setShowDepartModal] = useState(false);
  const [selectedParticipantForDepart, setSelectedParticipantForDepart] = useState(null);

  // Edit Expense & Booking Modals State
  const [editingExpense, setEditingExpense] = useState(null);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showEditBookingModal, setShowEditBookingModal] = useState(false);
  const [showDeleteTripModal, setShowDeleteTripModal] = useState(false);
  const [isDeletingTrip, setIsDeletingTrip] = useState(false);

  // Receipt parser state
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptText, setReceiptText] = useState('');
  const [receiptMode, setReceiptMode] = useState('file'); // 'file' | 'text'
  const [parsingReceipt, setParsingReceipt] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  // Expense Wizard Form State
  const [wizardStep, setWizardStep] = useState(1);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    merchant: '',
    category: 'FOOD',
    amount: '',
    payerId: '',
    splitMethod: 'EQUAL',
    isSideQuest: false,
    sideQuestTitle: '',
    itineraryBlockId: '',
    subgroupTag: '',
    selectedParticipantIds: []
  });

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    description: '',
    location: '',
    type: 'accommodation',
    vendor_name: '',
    booking_reference: '',
    total_cost: '',
    start_date: '',
    end_date: '',
    allocation_model: 'equal',
    assigned_participant_ids: [],
    paid_by: '',
    itineraryBlockId: '',
    subgroupTag: ''
  });

  // Participant Form State
  const [participantForm, setParticipantForm] = useState({
    name: '',
    email: '',
    cost_tier: 'STANDARD',
    tier_multiplier: 1.0,
    user_id: ''
  });

  // Optimized AI Savings Recommendations loader: utilizes sessionStorage cache to prevent unnecessary API pings
  const loadRecommendations = async (locationOverride = null, isRefresh = false) => {
    const locKey = locationOverride || activeRecommendationLocation || 'primary';
    const cacheKey = `nexus_ai_rec_${tripId}_${locKey}`;

    if (!isRefresh) {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          setRecommendationsData(parsed);
          if (parsed.primaryLocation) {
            setActiveRecommendationLocation(parsed.primaryLocation);
          }
          return; // Avoid unnecessary API ping!
        }
      } catch (e) {
        // Ignore cache parse error
      }
    }

    if (isRefresh) {
      setRecommendationsRefreshing(true);
    } else {
      setRecommendationsLoading(true);
    }
    try {
      const res = isRefresh
        ? await api.refreshSavingsRecommendations(tripId, locationOverride)
        : await api.getSavingsRecommendations(tripId, locationOverride);
      if (res && res.success) {
        setRecommendationsData(res);
        if (res.primaryLocation) {
          setActiveRecommendationLocation(res.primaryLocation);
        }
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(res));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setRecommendationsLoading(false);
      setRecommendationsRefreshing(false);
    }
  };

  const loadTripData = async () => {
    try {
      const [res, membersRes, itineraryRes] = await Promise.all([
        api.getTripById(tripId),
        api.getMembers().catch(() => ({ success: false, members: [] })),
        api.getItinerary(tripId).catch(() => ({ success: false, itinerary: [] }))
      ]);

      if (membersRes && membersRes.success) {
        setRegisteredMembers(membersRes.members || []);
      }

      if (itineraryRes && itineraryRes.success) {
        setItineraryData(itineraryRes);
      }

      if (res.success) {
        setTripData(res);
        if (res.participants && res.participants.length > 0 && !expenseForm.payerId) {
          const myPart = res.myParticipant || res.participants[0];
          setExpenseForm(prev => ({
            ...prev,
            payerId: myPart._id,
            selectedParticipantIds: res.participants.map(p => p._id)
          }));
          setBookingForm(prev => ({
            ...prev,
            location: prev.location || res.trip.destination || '',
            start_date: res.trip.start_date.split('T')[0],
            end_date: res.trip.end_date.split('T')[0],
            assigned_participant_ids: res.participants.map(p => p._id)
          }));
        }
      }
    } catch (err) {
      console.error('Load trip error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripData();
  }, [tripId]);

  // Only load recommendations when user views the dashboard tab and it's not already in memory
  useEffect(() => {
    if (activeTab === 'dashboard' && !recommendationsData) {
      loadRecommendations();
    }
  }, [activeTab, tripId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--color-muted)' }}>Loading Trip Workspace...</div>;
  }

  if (!tripData || !tripData.trip) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Trip not found</h2>
        <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '16px' }}>Back to Trips</button>
      </div>
    );
  }

  const { trip, participants, expenses, bookings, myParticipant, stats } = tripData;
  const netBalance = myParticipant ? myParticipant.balance : 0; // positive = owed money, negative = owes money

  const hostId = trip.organizer_id?._id || trip.organizer_id;
  const currentUserId = user?._id || user?.id || user?.userId;
  const isHost = !!(hostId && currentUserId && (hostId.toString() === currentUserId.toString()));

  const isOverBudget = trip.budget > 0 && stats?.totalSpent > trip.budget;
  const overBudgetAmount = isOverBudget ? (stats.totalSpent - trip.budget) : 0;
  const budgetUsedPct = trip.budget > 0 ? ((stats.totalSpent / trip.budget) * 100).toFixed(1) : 0;

  // Handlers for Edit/Delete Expense
  const handleOpenEditExpense = (exp) => {
    setEditingExpense(exp);
    setShowEditExpenseModal(true);
  };

  const handleUpdateExpenseSubmit = async (data) => {
    if (!editingExpense) return;
    try {
      const res = await api.updateExpense(tripId, editingExpense._id, data);
      if (res.success) {
        setShowEditExpenseModal(false);
        setEditingExpense(null);
        loadTripData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update expense');
    }
  };

  const handleDeleteExpense = async (exp) => {
    const isSide = exp.isSideQuest;
    const confirmMsg = isSide
      ? `Are you sure you want to delete side quest "${exp.sideQuestTitle || exp.description}" (₹${Number(exp.amount).toFixed(2)})? Participating crew shares will be removed.`
      : `Are you sure you want to delete expense "${exp.description}" (₹${Number(exp.amount).toFixed(2)})? This will update all member balances.`;

    if (window.confirm(confirmMsg)) {
      try {
        const res = await api.deleteExpense(tripId, exp._id);
        if (res.success) {
          loadTripData();
        }
      } catch (err) {
        alert(err.message || 'Failed to delete expense');
      }
    }
  };

  // Handlers for Itinerary Block quick-actions
  const handleOpenAddExpenseWithBlock = (block) => {
    const mappedCategory = block.category === 'DINING' ? 'FOOD' : block.category === 'LODGING' ? 'ACCOMMODATION' : (['FOOD', 'ACCOMMODATION', 'TRANSPORT', 'ACTIVITY', 'OTHER'].includes(block.category) ? block.category : 'OTHER');
    setExpenseForm(prev => ({
      ...prev,
      description: block.title || '',
      category: mappedCategory,
      itineraryBlockId: block._id,
      subgroupTag: ''
    }));
    setWizardStep(2);
    setShowAddExpenseModal(true);
  };

  const handleOpenReceiptModalWithBlock = (block) => {
    const mappedCategory = block.category === 'DINING' ? 'FOOD' : block.category === 'LODGING' ? 'ACCOMMODATION' : (['FOOD', 'ACCOMMODATION', 'TRANSPORT', 'ACTIVITY', 'OTHER'].includes(block.category) ? block.category : 'OTHER');
    setExpenseForm(prev => ({
      ...prev,
      description: block.title || '',
      category: mappedCategory,
      itineraryBlockId: block._id,
      subgroupTag: ''
    }));
    setShowReceiptModal(true);
  };

  // Handlers for Edit/Delete Booking
  const handleOpenEditBooking = (booking) => {
    setEditingBooking(booking);
    setShowEditBookingModal(true);
  };

  const handleUpdateBookingSubmit = async (data) => {
    if (!editingBooking) return;
    try {
      const res = await api.updateBooking(tripId, editingBooking._id, data);
      if (res.success) {
        setShowEditBookingModal(false);
        setEditingBooking(null);
        loadTripData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update booking');
    }
  };

  const handleDeleteBooking = async (booking) => {
    if (window.confirm(`Are you sure you want to permanently delete booking "${booking.description}" (₹${Number(booking.total_cost).toFixed(2)})? This will remove the booking and recalculate all member shares.`)) {
      try {
        const res = await api.deleteBooking(tripId, booking._id);
        if (res.success) {
          loadTripData();
        }
      } catch (err) {
        alert(err.message || 'Failed to delete booking');
      }
    }
  };

  // Handlers for Trip Deletion
  const handleConfirmDeleteTrip = async () => {
    setIsDeletingTrip(true);
    try {
      const res = await api.deleteTrip(tripId);
      if (res.success) {
        setShowDeleteTripModal(false);
        navigate('/');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete trip');
    } finally {
      setIsDeletingTrip(false);
    }
  };

  // Handlers for Add Expense Wizard
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const numAmt = Number(expenseForm.amount);
      const participantObjs = expenseForm.selectedParticipantIds.map(id => ({ memberId: id }));

      const res = await api.createExpense(tripId, {
        description: expenseForm.description,
        merchant: expenseForm.merchant,
        category: expenseForm.category,
        amount: numAmt,
        payerId: expenseForm.payerId,
        splitMethod: expenseForm.splitMethod,
        participants: participantObjs,
        isSideQuest: !!expenseForm.isSideQuest,
        sideQuestTitle: expenseForm.sideQuestTitle || '',
        itineraryBlockId: expenseForm.itineraryBlockId || null,
        subgroupTag: expenseForm.subgroupTag || '',
        aiParsed: !!parsedData,
        aiConfidence: parsedData ? parsedData.confidence : 0
      });

      if (res.success) {
        setShowAddExpenseModal(false);
        setWizardStep(1);
        setParsedData(null);
        setExpenseForm(prev => ({
          ...prev,
          description: '',
          merchant: '',
          amount: '',
          isSideQuest: false,
          sideQuestTitle: '',
          itineraryBlockId: '',
          subgroupTag: ''
        }));
        loadTripData();
      }
    } catch (err) {
      alert(err.message || 'Error creating expense');
    }
  };

  // Handlers for AI Receipt Parse
  const handleReceiptParse = async (e, textOverride = null) => {
    if (e && e.preventDefault) e.preventDefault();

    const targetText = textOverride !== null ? textOverride : receiptText;
    const mode = textOverride !== null ? 'text' : receiptMode;

    if (mode === 'file' && !receiptFile) {
      alert('Please select a receipt image file or PDF to upload.');
      return;
    }
    if (mode === 'text' && !targetText.trim()) {
      alert('Please paste or type bill text before parsing.');
      return;
    }

    setParsingReceipt(true);
    try {
      const formData = new FormData();
      if (mode === 'file' && receiptFile) {
        formData.append('receipt', receiptFile);
      } else {
        formData.append('rawText', targetText.trim());
      }

      const res = await api.parseReceipt(formData);
      if (res.success && res.extractedData) {
        const ext = res.extractedData;
        setParsedData(ext);

        const defaultPayer = participants.find(p => p.email === user?.email)?._id || participants[0]?._id || '';
        const allParticipantIds = participants.map(p => p._id);

        setExpenseForm(prev => ({
          ...prev,
          description: `${ext.merchant}${ext.items?.[0]?.name ? ' (' + ext.items[0].name + ')' : ''}`,
          merchant: ext.merchant,
          category: ext.category || 'FOOD',
          amount: ext.total,
          payerId: prev.payerId || defaultPayer,
          selectedParticipantIds: prev.selectedParticipantIds.length > 0 ? prev.selectedParticipantIds : allParticipantIds
        }));
        setShowReceiptModal(false);
        setWizardStep(1); // Jump to AI Parsed review in wizard
        setShowAddExpenseModal(true);
      }
    } catch (err) {
      alert('Error parsing receipt with Groq AI: ' + (err.message || err));
    } finally {
      setParsingReceipt(false);
    }
  };

  // Handlers for Add Booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.location || !bookingForm.location.trim()) {
      alert('Location is compulsory for group bookings to calculate local savings advice.');
      return;
    }

    try {
      const bookedLocation = bookingForm.location.trim();
      const res = await api.createBooking(tripId, {
        description: bookingForm.description,
        location: bookedLocation,
        type: bookingForm.type,
        vendor_name: bookingForm.vendor_name,
        booking_reference: bookingForm.booking_reference,
        total_cost: Number(bookingForm.total_cost),
        start_date: bookingForm.start_date,
        end_date: bookingForm.end_date,
        allocation_model: bookingForm.allocation_model,
        assigned_participant_ids: bookingForm.assigned_participant_ids,
        paid_by: bookingForm.paid_by || null,
        itineraryBlockId: bookingForm.itineraryBlockId || null,
        subgroupTag: bookingForm.subgroupTag || ''
      });
      if (res.success) {
        setShowAddBookingModal(false);
        setBookingForm(prev => ({ ...prev, description: '', location: '', vendor_name: '', total_cost: '', itineraryBlockId: '', subgroupTag: '' }));
        loadTripData();
      }
    } catch (err) {
      alert(err.message || 'Error creating booking');
    }
  };

  // Handlers for Add Participant
  const handleAddParticipant = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addParticipant(tripId, participantForm);
      if (res.success) {
        setShowAddParticipantModal(false);
        setParticipantForm({ name: '', email: '', cost_tier: 'STANDARD', tier_multiplier: 1.0 });
        loadTripData();
      }
    } catch (err) {
      alert(err.message || 'Error adding participant');
    }
  };

  // Handlers for Early Departure Recalculation
  const handleDepartParticipant = async (e) => {
    e.preventDefault();
    if (!selectedParticipantForDepart) return;
    try {
      const res = await api.departParticipant(tripId, selectedParticipantForDepart._id, {
        departure_date: new Date().toISOString().split('T')[0],
        reason: 'Early departure mid-trip'
      });
      if (res.success) {
        setShowDepartModal(false);
        loadTripData();
        alert(res.message);
      }
    } catch (err) {
      alert(err.message || 'Error processing departure');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-paper-cream)', minHeight: 'calc(100vh - 68px)', padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 24px) 80px clamp(16px, 3vw, 24px)' }}>
      <div style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
      
      {/* Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="eyebrow-label">EXPEDITION WORKSPACE</span>
            <span className={trip.status === 'active' ? 'sticker-badge' : 'sticker-badge-navy'}>
              {trip.status.replace('_', ' ')}
            </span>
            <span className={trip.isOrganizer ? 'sticker-badge' : 'sticker-badge-navy'} style={{ fontSize: '10px', padding: '3px 8px' }}>
              {trip.isOrganizer ? '👑 TRIP HOST' : '🎒 MEMBER'}
            </span>
            {trip.inviteCode && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--color-sage-border)',
                padding: '3px 10px',
                borderRadius: '8px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                maxWidth: '100%',
                flexWrap: 'wrap'
              }}>
                <KeyRound size={13} color="var(--color-forest-ink)" />
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-moss-gray)', textTransform: 'uppercase' }}>INVITE:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '12px', letterSpacing: '0.1em', color: 'var(--color-forest-ink)' }}>{trip.inviteCode}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(trip.inviteCode);
                    setCopiedInvite(true);
                    setTimeout(() => setCopiedInvite(false), 2000);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: 'var(--color-forest-ink)' }}
                  title="Copy Trip Invite Code"
                >
                  {copiedInvite ? <Check size={13} color="#15803d" /> : <Copy size={13} />}
                </button>
                {copiedInvite && <span style={{ fontSize: '10px', color: '#15803d', fontWeight: 700 }}>Copied!</span>}
              </div>
            )}
          </div>
          <h1 className="deacon-display" style={{ fontSize: 'clamp(28px, 4.5vw, 56px)', color: 'var(--color-forest-ink)' }}>
            {trip.name}
          </h1>
          <p style={{ color: '#555555', fontSize: '14px', marginTop: '6px', fontWeight: 500, lineHeight: 1.4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span>📍 {trip.destination || 'Destination'} • 📅 {new Date(trip.start_date).toLocaleDateString()} to {new Date(trip.end_date).toLocaleDateString()} • 💱 {trip.currency || 'INR'} (₹{trip.budget?.toLocaleString() || '0'} Budget)</span>
            {isOverBudget && (
              <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1.5px solid #f87171', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={12} /> OVER BUDGET BY ₹{overBudgetAmount.toFixed(2)}
              </span>
            )}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: 'auto' }}>
          <button className="btn-ghost-cream" onClick={() => setShowReceiptModal(true)}>
            <Sparkles size={16} color="var(--color-forest-ink)" /> AI RECEIPT OCR
          </button>
          <button className="btn-meadow" onClick={() => { setWizardStep(1); setShowAddExpenseModal(true); }}>
            <Plus size={18} /> ADD EXPENSE
          </button>
        </div>
      </div>

      {/* Prominent Balance Banner */}
      <div style={{
        backgroundColor: netBalance > 0 ? '#eefbe9' : netBalance < 0 ? '#fee2e2' : '#f4ede2',
        border: `2px solid ${netBalance > 0 ? 'var(--color-meadow)' : netBalance < 0 ? '#fca5a5' : 'var(--color-sage-border)'}`,
        borderRadius: '20px',
        padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 32px)',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: 'var(--shadow-preview)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 'clamp(44px, 6vw, 54px)', height: 'clamp(44px, 6vw, 54px)', borderRadius: '14px',
            backgroundColor: netBalance > 0 ? 'var(--color-meadow)' : netBalance < 0 ? '#dc2626' : 'var(--color-forest-ink)',
            color: netBalance > 0 ? 'var(--color-forest-ink)' : '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            {netBalance > 0 ? <ArrowUpRight size={28} /> : netBalance < 0 ? <ArrowDownLeft size={28} /> : <CheckCircle2 size={28} />}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-forest-ink)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              YOUR NET POSITION
            </div>
            <div style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontFamily: 'var(--font-deacon)', fontWeight: 900, color: netBalance > 0 ? 'var(--color-forest-ink)' : netBalance < 0 ? '#b91c1c' : 'var(--color-forest-ink)' }}>
              {netBalance > 0 ? `YOU ARE OWED ₹${netBalance.toFixed(2)}` : netBalance < 0 ? `YOU OWE ₹${Math.abs(netBalance).toFixed(2)}` : 'YOU ARE EVEN (₹0.00)'}
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          width: '100%',
          maxWidth: '520px'
        }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <span style={{ color: 'var(--color-moss-gray)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Total You Paid</span>
            <strong style={{ fontSize: '18px', color: 'var(--color-forest-ink)', fontFamily: 'var(--font-deacon)' }}>₹{(myParticipant?.total_paid || 0).toFixed(2)}</strong>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <span style={{ color: 'var(--color-moss-gray)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Your Share Owed</span>
            <strong style={{ fontSize: '18px', color: 'var(--color-forest-ink)', fontFamily: 'var(--font-deacon)' }}>₹{(myParticipant?.total_owed || 0).toFixed(2)}</strong>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <span style={{ color: '#854d0e', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Side Quests</span>
            <strong style={{ fontSize: '18px', color: '#854d0e', fontFamily: 'var(--font-deacon)' }}>
              ₹{expenses.filter(e => e.isSideQuest && e.participants?.some(p => (p.memberId?._id || p.memberId) === myParticipant?._id)).reduce((sum, e) => {
                const sp = e.participants?.find(p => (p.memberId?._id || p.memberId) === myParticipant?._id);
                return sum + (sp?.share || 0);
              }, 0).toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="mobile-tabs-scroll">
        {[
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'digital-twin', label: 'Digital Twin', icon: Cpu, badge: 'AI' },
          { id: 'itinerary', label: `Itinerary (${itineraryData?.itinerary?.length || tripData?.itineraryBlocks?.length || 0})`, icon: Compass },
          { id: 'expenses', label: `Expenses (${expenses.length})`, icon: Receipt },
          { id: 'bookings', label: `Bookings (${bookings.length})`, icon: CalendarCheck },
          { id: 'people', label: `People (${participants.length})`, icon: Users },
          { id: 'ledger', label: 'Ledger Audit', icon: BookOpen },
          { id: 'settlement', label: 'Settlement Matrix', icon: Scale },
          { id: 'report', label: 'Trip Report', icon: FileText },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map(tab => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                border: 'none',
                background: isActive ? 'var(--color-forest-ink)' : 'transparent',
                color: isActive ? 'var(--color-meadow)' : 'var(--color-forest-ink)',
                borderRadius: '10px 10px 0 0',
                fontWeight: isActive ? 800 : 600,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
            >
              <IconComp size={15} />
              {tab.label}
              {tab.badge && (
                <span style={{
                  backgroundColor: isActive ? 'var(--color-meadow)' : 'var(--color-forest-ink)',
                  color: isActive ? 'var(--color-forest-ink)' : '#ffffff',
                  fontSize: '9px',
                  fontWeight: 900,
                  padding: '1px 5px',
                  borderRadius: '6px',
                  marginLeft: '2px'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>


      {/* Tab Content Views */}

      {/* 1. OVERVIEW DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <DashboardTab
          trip={trip}
          stats={stats}
          participants={participants}
          expenses={expenses}
          bookings={bookings}
          isOverBudget={isOverBudget}
          overBudgetAmount={overBudgetAmount}
          budgetUsedPct={budgetUsedPct}
          recommendationsData={recommendationsData}
          recommendationsLoading={recommendationsLoading}
          recommendationsRefreshing={recommendationsRefreshing}
          activeRecommendationLocation={activeRecommendationLocation}
          onRefreshRecommendations={loadRecommendations}
          onSelectLocation={(loc) => {
            setActiveRecommendationLocation(loc);
            loadRecommendations(loc);
          }}
          onAddExpense={() => { setWizardStep(1); setShowAddExpenseModal(true); }}
          onAddBooking={() => setShowAddBookingModal(true)}
          onOpenSettlement={() => setActiveTab('settlement')}
          onOpenExpenses={() => setActiveTab('expenses')}
          onOpenSettings={() => setActiveTab('settings')}
          onOpenItinerary={() => setActiveTab('itinerary')}
          itineraryData={itineraryData}
        />
      )}

      {/* 2. DIGITAL TWIN TAB */}
      {activeTab === 'digital-twin' && (
        <DigitalTwinTab
          trip={trip}
          bookings={bookings}
          participants={participants}
        />
      )}

      {/* 3. ITINERARY TAB */}
      {activeTab === 'itinerary' && (
        <ItineraryTab
          trip={trip}
          participants={participants}
          bookings={bookings}
          itineraryData={itineraryData}
          onRefresh={loadTripData}
          onOpenAddExpenseWithBlock={handleOpenAddExpenseWithBlock}
          onOpenReceiptModalWithBlock={handleOpenReceiptModalWithBlock}
          isHost={isHost}
        />
      )}

      {/* 2. EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <ExpensesTab
          expenses={expenses}
          participants={participants}
          trip={trip}
          myParticipant={myParticipant}
          isHost={isHost}
          isOverBudget={isOverBudget}
          overBudgetAmount={overBudgetAmount}
          onAddExpense={() => { setWizardStep(1); setShowAddExpenseModal(true); }}
          onOpenReceiptModal={() => setShowReceiptModal(true)}
          onEditExpense={handleOpenEditExpense}
          onDeleteExpense={handleDeleteExpense}
          onRefresh={loadTripData}
        />
      )}

      {/* 3. BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <BookingsTab
          bookings={bookings}
          participants={participants}
          isHost={isHost}
          onAddBooking={() => setShowAddBookingModal(true)}
          onEditBooking={handleOpenEditBooking}
          onDeleteBooking={handleDeleteBooking}
          onRefresh={loadTripData}
        />
      )}

      {/* 4. PEOPLE TAB */}
      {activeTab === 'people' && (
        <PeopleTab
          participants={participants}
          trip={trip}
          onAddParticipant={() => setShowAddParticipantModal(true)}
          onDepartParticipant={(p) => { setSelectedParticipantForDepart(p); setShowDepartModal(true); }}
          onRefresh={loadTripData}
        />
      )}

      {/* 5. LEDGER TAB */}
      {activeTab === 'ledger' && (
        <LedgerTab tripId={tripId} participants={participants} />
      )}

      {/* 6. SETTLEMENT TAB */}
      {activeTab === 'settlement' && (
        <SettlementTab tripId={tripId} trip={trip} participants={participants} onRefresh={loadTripData} />
      )}

      {/* 7. TRIP REPORT TAB */}
      {activeTab === 'report' && (
        <ReportTab tripId={tripId} trip={trip} />
      )}

      {/* 8. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <SettingsTab
          trip={trip}
          isHost={isHost}
          onDeleteTrip={() => setShowDeleteTripModal(true)}
          onRefresh={loadTripData}
        />
      )}

      {/* FLOATING CALCULATE FUNDING / LEDGER STATUS CHIP */}
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
          fontWeight: 800
        }}>
          👍
        </div>
        <div>
          <span style={{ fontWeight: 700, display: 'block', fontSize: '12px' }}>CALCULATE FUNDING</span>
          <span style={{ fontSize: '11px', color: 'var(--color-moss-gray)' }}>{participants.length} Active Travelers • Balanced Ledger</span>
        </div>
      </div>

      </div>

      {/* --- MODALS --- */}

      {/* Add Expense Wizard Modal */}
      {showAddExpenseModal && (
        <AddExpenseWizardModal
          step={wizardStep}
          setStep={setWizardStep}
          expenseForm={expenseForm}
          setExpenseForm={setExpenseForm}
          participants={participants}
          parsedData={parsedData}
          itineraryBlocks={itineraryData?.itinerary || tripData?.itineraryBlocks || []}
          onSubmit={handleExpenseSubmit}
          onClose={() => { setShowAddExpenseModal(false); setWizardStep(1); setParsedData(null); }}
        />
      )}

      {/* AI Receipt Parser Modal */}
      {showReceiptModal && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: 'var(--color-primary)' }} /> Groq AI Bill & Receipt Parser
              </h3>
              <button onClick={() => setShowReceiptModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
              Upload a receipt photo/PDF or paste bill text. Groq AI extracts merchant, line items, date, tax, tip, and totals with 98%+ accuracy.
            </p>

            {/* Input Mode Selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setReceiptMode('file')}
                style={{
                  flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                  backgroundColor: receiptMode === 'file' ? '#ffffff' : 'transparent',
                  boxShadow: receiptMode === 'file' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  color: receiptMode === 'file' ? 'var(--color-primary)' : 'var(--color-muted)'
                }}
              >
                📁 Upload File / Photo
              </button>
              <button
                type="button"
                onClick={() => setReceiptMode('text')}
                style={{
                  flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                  backgroundColor: receiptMode === 'text' ? '#ffffff' : 'transparent',
                  boxShadow: receiptMode === 'text' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  color: receiptMode === 'text' ? 'var(--color-primary)' : 'var(--color-muted)'
                }}
              >
                📝 Paste Bill Text
              </button>
            </div>

            {/* Parsing Spinner Indicator */}
            {parsingReceipt && (
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '12px', padding: '16px', textAlign: 'center', marginBottom: '16px' }}>
                <RefreshCw size={24} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>Analyzing Receipt with Tesseract OCR & Groq AI...</div>
                <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '4px' }}>Parsing merchant, items, dates, and calculated balances</div>
              </div>
            )}

            <form onSubmit={handleReceiptParse}>
              {receiptMode === 'file' ? (
                <div style={{ border: '2px dashed var(--color-border)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '16px', backgroundColor: '#f8fafc' }}>
                  <Upload size={32} style={{ color: 'var(--color-primary)', marginBottom: '8px' }} />
                  <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>Choose Receipt Image or PDF</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '12px' }}>Supports JPG, PNG, WEBP, or PDF</p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setReceiptFile(e.target.files[0])}
                    style={{ display: 'block', margin: '0 auto', fontSize: '13px' }}
                  />
                  {receiptFile && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} /> Selected: {receiptFile.name} ({(receiptFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Paste Receipt Text or Invoice Summary</label>
                  <textarea
                    rows={5}
                    placeholder="e.g. Punjabi Dhaba: 2 Paneer Butter Masala Rs 480, 4 Naan Rs 240, Total Rs 720"
                    value={receiptText}
                    onChange={(e) => setReceiptText(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px', fontFamily: 'inherit' }}
                  />

                  {/* Sample Presets */}
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>💡 Or Try 1-Click Demo Presets:</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const demo = "Punjabi Dhaba & Bar\n2 Paneer Butter Masala Rs 480\n4 Butter Naan Rs 240\n1 Jeera Rice Rs 180\nGST 5% Rs 45\nTotal Rs 945";
                          setReceiptText(demo);
                          setReceiptMode('text');
                          handleReceiptParse(null, demo);
                        }}
                        style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
                      >
                        🍽️ Restaurant Bill
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const demo = "Grand Alpine Resort & Spa\n2 Nights Deluxe Suite $360\nResort Experience Fee $40\nTaxes & Fees $30\nTotal Amount $430";
                          setReceiptText(demo);
                          setReceiptMode('text');
                          handleReceiptParse(null, demo);
                        }}
                        style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
                      >
                        🏨 Hotel Invoice
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const demo = "Highland Taxi Express\nDistance: 35 km\nBase Fare Rs 450\nToll Tax Rs 90\nDriver Tip Rs 60\nTotal Fare Rs 600";
                          setReceiptText(demo);
                          setReceiptMode('text');
                          handleReceiptParse(null, demo);
                        }}
                        style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
                      >
                        🚕 Taxi Fare
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowReceiptModal(false)}>Cancel</button>
                <button type="submit" disabled={parsingReceipt} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} />
                  {parsingReceipt ? 'Groq AI Analyzing...' : 'Parse Bill with Groq AI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddBookingModal && (
        <div className="modal-overlay" onClick={() => setShowAddBookingModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Create Locked Group Booking</h3>
              <button onClick={() => setShowAddBookingModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Booking Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand Beach Resort (4 Nights)"
                  value={bookingForm.description}
                  onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                  Booking Location * <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>(Compulsory for AI Savings Advice)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Candolim Beach, Goa or Phuket, Thailand"
                    value={bookingForm.location}
                    onChange={(e) => setBookingForm({ ...bookingForm, location: e.target.value })}
                    style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1.5px solid var(--color-border)', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div className="responsive-grid-form" style={{ gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Type</label>
                  <select
                    value={bookingForm.type}
                    onChange={(e) => setBookingForm({ ...bookingForm, type: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                  >
                    <option value="accommodation">Accommodation</option>
                    <option value="transportation">Transportation</option>
                    <option value="activity">Activity</option>
                    <option value="meal">Meal</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Vendor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Marriott / Airbnb"
                    value={bookingForm.vendor_name}
                    onChange={(e) => setBookingForm({ ...bookingForm, vendor_name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div className="responsive-grid-form" style={{ gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Total Vendor Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="1200"
                    value={bookingForm.total_cost}
                    onChange={(e) => setBookingForm({ ...bookingForm, total_cost: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Paid Upfront By</label>
                  <select
                    value={bookingForm.paid_by}
                    onChange={(e) => setBookingForm({ ...bookingForm, paid_by: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                  >
                    <option value="">Vendor Not Yet Paid</option>
                    {participants.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="responsive-grid-form" style={{ gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.start_date}
                    onChange={(e) => setBookingForm({ ...bookingForm, start_date: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>End Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.end_date}
                    onChange={(e) => setBookingForm({ ...bookingForm, end_date: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* Itinerary Block Selector for Booking */}
              {itineraryData?.itinerary && itineraryData.itinerary.length > 0 && (
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                    🗓️ Link to Itinerary Time Block (Optional)
                  </label>
                  <select
                    value={bookingForm.itineraryBlockId || ''}
                    onChange={(e) => setBookingForm({ ...bookingForm, itineraryBlockId: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '13px', backgroundColor: '#ffffff' }}
                  >
                    <option value="">-- No Itinerary Block --</option>
                    {itineraryData.itinerary.map(b => (
                      <option key={b._id} value={b._id}>
                        Day {b.day_number}: {b.title} ({b.start_time || b.time_slot})
                      </option>
                    ))}
                  </select>

                  {bookingForm.itineraryBlockId && (
                    <div style={{ marginTop: '8px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        Room / Unit Tag (e.g. Room 101, Villa A)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Room 101, Room 102"
                        value={bookingForm.subgroupTag || ''}
                        onChange={(e) => setBookingForm({ ...bookingForm, subgroupTag: e.target.value })}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '13px', backgroundColor: '#ffffff' }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Cost Allocation Model</label>
                <select
                  value={bookingForm.allocation_model}
                  onChange={(e) => setBookingForm({ ...bookingForm, allocation_model: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                >
                  <option value="equal">Equal Split</option>
                  <option value="weighted_nights">Weighted by Nights Stayed</option>
                  <option value="tiered">Tiered Cost Sharing (Student/Sponsor Multiplier)</option>
                  <option value="occupancy_based">Occupancy Based (Room Split)</option>
                  <option value="consumption_only">Consumption / Attendance Only</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddBookingModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Participant Modal */}
      {showAddParticipantModal && (
        <div className="modal-overlay" onClick={() => setShowAddParticipantModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-forest-ink)' }}>Add Trip Participant</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-moss-gray)', marginTop: '2px' }}>Add members to track shared & side-quest spends</p>
              </div>
              <button onClick={() => setShowAddParticipantModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--color-muted)' }}>×</button>
            </div>

            {/* Mode Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
              <button
                type="button"
                onClick={() => setAddParticipantMode('registered')}
                style={{
                  flex: 1, padding: '8px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '12px',
                  backgroundColor: addParticipantMode === 'registered' ? '#ffffff' : 'transparent',
                  boxShadow: addParticipantMode === 'registered' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  color: addParticipantMode === 'registered' ? 'var(--color-forest-ink)' : 'var(--color-muted)'
                }}
              >
                🎒 Pick Member Account ({registeredMembers.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddParticipantMode('manual');
                  setParticipantForm(prev => ({ ...prev, user_id: '' }));
                }}
                style={{
                  flex: 1, padding: '8px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '12px',
                  backgroundColor: addParticipantMode === 'manual' ? '#ffffff' : 'transparent',
                  boxShadow: addParticipantMode === 'manual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  color: addParticipantMode === 'manual' ? 'var(--color-forest-ink)' : 'var(--color-muted)'
                }}
              >
                ✉️ New Guest / Email
              </button>
            </div>

            <form onSubmit={handleAddParticipant} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {addParticipantMode === 'registered' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-forest-ink)' }}>Select Registered Member Account *</label>
                  <select
                    required
                    value={participantForm.user_id || ''}
                    onChange={(e) => {
                      const selId = e.target.value;
                      const found = registeredMembers.find(m => m._id === selId);
                      if (found) {
                        setParticipantForm(prev => ({
                          ...prev,
                          user_id: found._id,
                          name: found.name,
                          email: found.email
                        }));
                      } else {
                        setParticipantForm(prev => ({ ...prev, user_id: '', name: '', email: '' }));
                      }
                    }}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', backgroundColor: '#ffffff' }}
                  >
                    <option value="">-- Choose Registered Traveler --</option>
                    {registeredMembers.map(m => {
                      const isAlready = participants.some(p => (p.user_id && p.user_id === m._id) || p.email.toLowerCase() === m.email.toLowerCase());
                      return (
                        <option key={m._id} value={m._id} disabled={isAlready}>
                          {m.name} ({m.email}) {m.role === 'member' ? '• 🎒 Member' : '• 👑 Host'} {isAlready ? '[Already in Trip]' : ''}
                        </option>
                      );
                    })}
                  </select>

                  {participantForm.user_id && (
                    <div style={{ marginTop: '10px', padding: '10px 12px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#15803d" />
                      <span>Ready to link: <strong>{participantForm.name}</strong> ({participantForm.email})</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-forest-ink)' }}>Participant Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Connor"
                      value={participantForm.name}
                      onChange={(e) => setParticipantForm({ ...participantForm, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', backgroundColor: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-forest-ink)' }}>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="sarah@example.com"
                      value={participantForm.email}
                      onChange={(e) => setParticipantForm({ ...participantForm, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', backgroundColor: '#ffffff' }}
                    />
                  </div>
                </>
              )}

              <div className="responsive-grid-form" style={{ gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-forest-ink)' }}>Cost Tier</label>
                  <select
                    value={participantForm.cost_tier}
                    onChange={(e) => {
                      const tier = e.target.value;
                      const mult = tier === 'STUDENT' ? 0.75 : tier === 'SPONSOR' ? 1.25 : 1.0;
                      setParticipantForm({ ...participantForm, cost_tier: tier, tier_multiplier: mult });
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', backgroundColor: '#ffffff' }}
                  >
                    <option value="STANDARD">Standard (1.0x)</option>
                    <option value="STUDENT">Student / Discount (0.75x)</option>
                    <option value="SPONSOR">Sponsor / Premium (1.25x)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-forest-ink)' }}>Multiplier</label>
                  <input
                    type="number"
                    step="0.05"
                    value={participantForm.tier_multiplier}
                    onChange={(e) => setParticipantForm({ ...participantForm, tier_multiplier: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', backgroundColor: '#ffffff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddParticipantModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Member to Trip</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Early Departure Recalculation Modal */}
      {showDepartModal && selectedParticipantForDepart && (
        <div className="modal-overlay" onClick={() => setShowDepartModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', color: 'var(--color-forest-ink)' }}>Process Early Departure</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '16px', lineHeight: 1.5 }}>
              Mark <strong>{selectedParticipantForDepart.name}</strong> as departing today. The system will automatically recalculate future bookings and adjust group cost allocations.
            </p>

            <form onSubmit={handleDepartParticipant}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowDepartModal(false)}>Cancel</button>
                <button type="submit" className="btn-danger">Confirm Early Departure</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditExpenseModal && editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          participants={participants}
          itineraryBlocks={itineraryData?.itinerary || tripData?.itineraryBlocks || []}
          onSubmit={handleUpdateExpenseSubmit}
          onClose={() => { setShowEditExpenseModal(false); setEditingExpense(null); }}
        />
      )}

      {/* Edit Booking Modal */}
      {showEditBookingModal && editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          participants={participants}
          itineraryBlocks={itineraryData?.itinerary || tripData?.itineraryBlocks || []}
          onSubmit={handleUpdateBookingSubmit}
          onClose={() => { setShowEditBookingModal(false); setEditingBooking(null); }}
        />
      )}

      {/* Delete Entire Trip Confirmation Modal */}
      {showDeleteTripModal && (
        <DeleteTripConfirmationModal
          trip={trip}
          onConfirm={handleConfirmDeleteTrip}
          onClose={() => setShowDeleteTripModal(false)}
          isDeleting={isDeletingTrip}
        />
      )}

    </div>
  );
};

/* --- TAB COMPONENTS --- */

/* 1. OVERVIEW DASHBOARD TAB */
const DashboardTab = ({
  trip,
  stats,
  participants,
  expenses,
  bookings,
  isOverBudget,
  overBudgetAmount,
  budgetUsedPct,
  recommendationsData,
  recommendationsLoading,
  recommendationsRefreshing,
  activeRecommendationLocation,
  onRefreshRecommendations,
  onSelectLocation,
  onAddExpense,
  onAddBooking,
  onOpenSettlement,
  onOpenExpenses,
  onOpenSettings,
  onOpenItinerary,
  itineraryData
}) => {
  const sideQuestExpenses = expenses.filter(e => e.isSideQuest);
  const totalSideQuestSpend = sideQuestExpenses.reduce((sum, e) => sum + e.amount, 0);

  const targetLocation = activeRecommendationLocation || recommendationsData?.primaryLocation || trip.destination;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Prominent Budget Warning Banner if Budget is Crossed */}
      {isOverBudget && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '2px solid #ef4444',
          borderRadius: '16px',
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 6px 20px rgba(239, 68, 68, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#fee2e2',
              border: '1.5px solid #fca5a5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
              flexShrink: 0
            }}>
              <AlertTriangle size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#991b1b', letterSpacing: '0.02em' }}>
                  ⚠️ TRIP BUDGET EXCEEDED WARNING!
                </h4>
                <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#dc2626', color: '#ffffff', padding: '2px 8px', borderRadius: '12px' }}>
                  {budgetUsedPct}% OF BUDGET
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#b91c1c', lineHeight: 1.4 }}>
                Total expenditure of <strong>₹{stats.totalSpent.toFixed(2)}</strong> has exceeded the set budget of <strong>₹{(trip.budget || 0).toFixed(2)}</strong> by <strong style={{ textDecoration: 'underline' }}>₹{overBudgetAmount.toFixed(2)}</strong>.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onOpenExpenses}
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #f87171',
                color: '#b91c1c',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Review Expenses →
            </button>
            <button
              onClick={onOpenSettings}
              style={{
                backgroundColor: '#dc2626',
                border: 'none',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Adjust Budget
            </button>
          </div>
        </div>
      )}

      {/* Top Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '12px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Total Spent So Far</span>
          <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: 'var(--color-ink)', marginTop: '4px' }}>
            ₹{stats.totalSpent.toFixed(2)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px', display: 'block' }}>
            ₹{stats.totalExpenses.toFixed(2)} exp + ₹{stats.totalBookings.toFixed(2)} book
          </span>
        </div>

        <div className="card" style={{
          padding: '16px',
          border: isOverBudget ? '2px solid #ef4444' : '1px solid var(--color-border)',
          backgroundColor: isOverBudget ? '#fef2f2' : '#ffffff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: isOverBudget ? '#b91c1c' : 'var(--color-text-secondary)', fontWeight: 600 }}>Trip Budget</span>
            {isOverBudget && (
              <span style={{ fontSize: '9px', fontWeight: 800, backgroundColor: '#dc2626', color: '#fff', padding: '2px 5px', borderRadius: '4px' }}>
                OVER BUDGET
              </span>
            )}
          </div>
          <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: isOverBudget ? '#b91c1c' : 'var(--color-ink)', marginTop: '4px' }}>
            ₹{(stats.budget || 0).toFixed(2)}
          </div>
          {/* Progress bar */}
          <div style={{ width: '100%', height: '6px', backgroundColor: isOverBudget ? '#fecaca' : '#e2e8f0', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(stats.budgetUsedPercentage, 100)}%`,
              height: '100%',
              backgroundColor: isOverBudget ? '#dc2626' : stats.budgetUsedPercentage > 90 ? 'var(--color-danger)' : 'var(--color-primary)'
            }} />
          </div>
          <span style={{ fontSize: '11px', color: isOverBudget ? '#dc2626' : 'var(--color-text-secondary)', marginTop: '4px', display: 'block', fontWeight: isOverBudget ? 700 : 500 }}>
            {isOverBudget ? `⚠️ Over by ₹${overBudgetAmount.toFixed(2)} (${stats.budgetUsedPercentage}%)` : `${stats.budgetUsedPercentage}% utilized`}
          </span>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Active Members</span>
          <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: 'var(--color-ink)', marginTop: '4px' }}>
            {stats.participantCount} People
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-success)', marginTop: '4px', display: 'block' }}>
            All confirmed & active
          </span>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #eab308' }}>
          <span style={{ fontSize: '12px', color: '#854d0e', fontWeight: 700 }}>Side Quest Spends</span>
          <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: 'var(--color-ink)', marginTop: '4px' }}>
            ₹{totalSideQuestSpend.toFixed(2)}
          </div>
          <span style={{ fontSize: '11px', color: '#a16207', marginTop: '4px', display: 'block', fontWeight: 600 }}>
            🎮 {sideQuestExpenses.length} Sub-Group Adventures
          </span>
        </div>

        <div className="card" style={{ padding: '16px', backgroundColor: 'var(--color-primary-muted)', borderColor: 'var(--color-focus-ring)' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>Settlement Status</span>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)', marginTop: '4px' }}>
            {trip.status.replace('_', ' ').toUpperCase()}
          </div>
          <button className="btn-primary" onClick={onOpenSettlement} style={{ marginTop: '8px', fontSize: '11px', padding: '6px 12px' }}>
            View Settlement →
          </button>
        </div>
      </div>

      {/* Itinerary Schedule Mini-Widget */}
      <div className="card" style={{ padding: '20px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={20} color="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--color-forest-ink)' }}>
              Trip Schedule & Time Blocks
            </h3>
            {itineraryData?.summary?.totalBlocks > 0 && (
              <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: 'var(--color-primary-muted)', color: 'var(--color-forest-ink)', padding: '2px 8px', borderRadius: '12px' }}>
                {itineraryData.summary.totalBlocks} Planned
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onOpenItinerary}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Open Full Itinerary →
          </button>
        </div>

        {(!itineraryData?.itinerary || itineraryData.itinerary.length === 0) ? (
          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '13px' }}>
            No activities scheduled yet.
            <button type="button" onClick={onOpenItinerary} style={{ marginLeft: '8px', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
              Plan Time Blocks & Assign Rooms/Tables
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {itineraryData.itinerary.slice(0, 3).map(b => (
              <div key={b._id} style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid var(--color-frost)',
                backgroundColor: '#fafaf9',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '6px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--color-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    <span>Day {b.day_number} • {b.start_time || b.time_slot}</span>
                    <span style={{ color: b.actual_cost > 0 ? '#15803d' : '#854d0e' }}>
                      {b.actual_cost > 0 ? `₹${b.actual_cost.toFixed(2)}` : 'Pending Receipts'}
                    </span>
                  </div>
                  <strong style={{ fontSize: '14px', color: 'var(--color-forest-ink)', display: 'block', marginTop: '2px' }}>
                    {b.title}
                  </strong>
                  {b.location && (
                    <span style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={11} /> {b.location}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', borderTop: '1px dashed #e2e8f0', paddingTop: '6px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Est: ₹{(b.estimated_cost || 0).toFixed(2)}</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {(b.linked_expenses?.length || 0) + (b.linked_bookings?.length || 0)} Linked Items
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Group Savings Recommendations Banner / Card */}
      <div className="card" style={{ borderLeft: '4px solid var(--color-primary)', background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)', boxShadow: '0 4px 16px rgba(37, 99, 235, 0.07)' }}>
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.12)', color: 'var(--color-primary)' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--color-ink)' }}>AI Group Savings Recommendations</h4>
                {recommendationsData?.recommendations?.model && (
                  <span className="badge" style={{ fontSize: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '1px 7px' }}>
                    {recommendationsData.recommendations.source === 'openrouter' ? 'OpenRouter AI' : 'AI Advice'} • {recommendationsData.recommendations.model.split('/').pop()}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '2px' }}>
                Real-time cost optimization analyzed for your group's booking locations
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {targetLocation && (
              <button
                onClick={() => onRefreshRecommendations(targetLocation, true)}
                disabled={recommendationsRefreshing || recommendationsLoading}
                className="btn-secondary"
                title="Re-run AI model for latest savings tips"
                style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}
              >
                <RefreshCw size={13} className={recommendationsRefreshing ? 'spin' : ''} />
                {recommendationsRefreshing ? 'Analyzing...' : 'Refresh Advice'}
              </button>
            )}
          </div>
        </div>

        {/* Location Selector Tabs if bookings have locations */}
        {recommendationsData?.bookingLocations && recommendationsData.bookingLocations.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} style={{ color: 'var(--color-primary)' }} /> Booking Locations:
            </span>
            {recommendationsData.bookingLocations.map((loc) => {
              const isSelected = (activeRecommendationLocation || recommendationsData.primaryLocation) === loc;
              return (
                <button
                  key={loc}
                  onClick={() => onSelectLocation(loc)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: isSelected ? 800 : 600,
                    backgroundColor: isSelected ? 'var(--color-forest-ink)' : '#ffffff',
                    color: isSelected ? 'var(--color-meadow)' : 'var(--color-forest-ink)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--color-forest-ink)' : 'var(--color-border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  📍 {loc}
                </button>
              );
            })}
          </div>
        )}

        {/* Card Body */}
        {recommendationsLoading && !recommendationsData ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '13px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <RefreshCw size={22} className="spin" style={{ margin: '0 auto 8px', color: 'var(--color-primary)', display: 'block' }} />
            Parsing location data into OpenRouter AI model for group savings...
          </div>
        ) : !recommendationsData?.hasLocation ? (
          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px dashed var(--color-border)', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
              💡 <strong>No Booking Location Yet:</strong> Add a group booking (accommodation, transportation, or activity) with a compulsory location to unlock AI-powered local savings recommendations!
            </p>
            <button className="btn-primary" onClick={onAddBooking} style={{ fontSize: '12px', padding: '7px 16px' }}>
              + Add Booking with Location
            </button>
          </div>
        ) : (
          <div>
            {/* Headline and Savings Highlight Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px' }}>🎯</span>
                <strong style={{ fontSize: '14px', color: 'var(--color-ink)' }}>
                  {recommendationsData.recommendations?.headline || `Savings Guide for ${recommendationsData.primaryLocation}`}
                </strong>
              </div>
              {recommendationsData.recommendations?.estimatedTotalSavings && (
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#15803d', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                  💰 Est. Total Savings: {recommendationsData.recommendations.estimatedTotalSavings}
                </span>
              )}
            </div>

            {/* Recommendations Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '12px' }}>
              {recommendationsData.recommendations?.tips?.map((tip, idx) => {
                const getCategoryStyle = (cat) => {
                  const c = (cat || '').toLowerCase();
                  if (c.includes('transport')) return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
                  if (c.includes('accommodat')) return { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' };
                  if (c.includes('food') || c.includes('dining')) return { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' };
                  if (c.includes('activit')) return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
                  return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
                };
                const catStyle = getCategoryStyle(tip.category);

                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', padding: '2px 7px', borderRadius: '4px', backgroundColor: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}` }}>
                          {tip.category}
                        </span>
                        {tip.savingEstimate && (
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a' }}>
                            {tip.savingEstimate}
                          </span>
                        )}
                      </div>
                      <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)', margin: '4px 0 4px', lineHeight: 1.35 }}>
                        {tip.title}
                      </h5>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.45, margin: 0 }}>
                        {tip.advice}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Middle Grid: Action Items */}
      <div className="card">
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Action Items</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
            <CheckCircle2 size={15} /> All {participants.length} participants confirmed attendance
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
            <CheckCircle2 size={15} /> {bookings.length} Group bookings locked with vendors
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)' }}>
            <AlertTriangle size={15} /> {expenses.length} Expenses logged ({sideQuestExpenses.length} side quests)
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Recent Expenses</h3>
          <button className="btn-secondary" onClick={onAddExpense} style={{ fontSize: '12px', padding: '6px 12px' }}>
            + Log Expense
          </button>
        </div>

        {expenses.length === 0 ? (
          <p style={{ color: 'var(--color-muted)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
            No expenses logged yet. Click "+ Log Expense" or use the AI Receipt Parser.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {expenses.slice(0, 5).map(exp => (
              <div key={exp._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#ffffff', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--color-ink)' }}>{exp.description}</strong>
                    {exp.isSideQuest && (
                      <span className="badge badge-warning" style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: '10px' }}>
                        🎮 SIDE QUEST
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Paid by {exp.payerId?.name || 'User'} • {new Date(exp.date).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)' }}>₹{exp.amount.toFixed(2)}</span>
                  <span className="badge badge-primary" style={{ display: 'block', marginTop: '2px', fontSize: '10px' }}>{exp.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

/* 2. EXPENSES TAB */
const ExpensesTab = ({
  expenses,
  participants,
  trip,
  myParticipant,
  isHost,
  isOverBudget,
  overBudgetAmount,
  onAddExpense,
  onOpenReceiptModal,
  onEditExpense,
  onDeleteExpense,
  onRefresh
}) => {
  const [filterCategory, setFilterCategory] = useState('ALL');

  const filteredExpenses = filterCategory === 'ALL'
    ? expenses
    : filterCategory === 'SIDE_QUESTS'
      ? expenses.filter(e => e.isSideQuest)
      : expenses.filter(e => e.category === filterCategory && !e.isSideQuest);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Budget Overrun Warning Banner */}
      {isOverBudget && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1.5px solid #fca5a5',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#991b1b',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(239,68,68,0.08)'
        }}>
          <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
          <span>Trip Budget Warning: Total spending has crossed your set budget of ₹{(trip?.budget || 0).toLocaleString()} by <strong>₹{overBudgetAmount.toFixed(2)}</strong>!</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'SIDE_QUESTS', 'FOOD', 'ACCOMMODATION', 'TRANSPORT', 'ACTIVITY', 'OTHER'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={filterCategory === cat ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              {cat === 'SIDE_QUESTS' ? '🎮 Side Quests' : cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={onOpenReceiptModal} style={{ fontSize: '12px' }}>
            <Sparkles size={15} /> Scan Receipt AI
          </button>
          <button className="btn-primary" onClick={onAddExpense} style={{ fontSize: '12px' }}>
            <Plus size={15} /> Log Expense
          </button>
        </div>
      </div>

      <div className="table-responsive-wrapper">
        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Description / Merchant</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Payer</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Amount</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-muted)' }}>
                  No expenses match your criteria.
                </td>
              </tr>
            ) : (
              filteredExpenses.map(exp => {
                const isPayer = (exp.payerId?._id || exp.payerId)?.toString() === myParticipant?._id?.toString();
                const isCrew = exp.participants?.some(p => (p.memberId?._id || p.memberId)?.toString() === myParticipant?._id?.toString());
                const canEditDelete = isHost || (exp.isSideQuest && (isPayer || isCrew || myParticipant));

                return (
                  <tr key={exp._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <strong style={{ color: 'var(--color-ink)' }}>{exp.description}</strong>
                        {exp.isSideQuest && (
                          <span className="badge badge-warning" style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: '10px', padding: '2px 6px' }}>
                            🎮 SIDE QUEST: {exp.sideQuestTitle || 'Sub-Group'}
                          </span>
                        )}
                      </div>
                      {exp.merchant && <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{exp.merchant}</div>}
                      {exp.isSideQuest && (
                        <div style={{ fontSize: '11px', color: '#854d0e', marginTop: '4px', fontWeight: 600 }}>
                          Split among {exp.participants?.length || 0} crew members ({exp.participants?.map(p => p.memberId?.name || 'Member').join(', ')})
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-primary">{exp.category}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{exp.payerId?.name || 'User'}</td>
                    <td style={{ padding: '12px 16px' }}>{new Date(exp.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>₹{exp.amount.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
                        {canEditDelete ? (
                          <>
                            <button
                              onClick={() => onEditExpense(exp)}
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                color: 'var(--color-forest-ink)',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: 700
                              }}
                              title={exp.isSideQuest ? 'Edit Side Quest' : 'Edit Expense'}
                            >
                              <Edit size={13} /> Edit
                            </button>
                            <button
                              onClick={() => onDeleteExpense(exp)}
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: 700
                              }}
                              title={exp.isSideQuest ? 'Delete Side Quest' : 'Delete Expense'}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontStyle: 'italic' }}>
                            Host Managed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* 3. BOOKINGS TAB */
const BookingsTab = ({
  bookings,
  participants,
  isHost,
  onAddBooking,
  onEditBooking,
  onDeleteBooking,
  onRefresh
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Group Bookings & Vendor Commitments</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            Locked accommodations, flights, and activities with custom cost sharing models.
          </p>
        </div>
        {isHost && (
          <button className="btn-primary" onClick={onAddBooking} style={{ fontSize: '12px' }}>
            <Plus size={15} /> Create Booking
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
        {bookings.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
            No locked bookings created yet.
          </div>
        ) : (
          bookings.map(b => (
            <div key={b._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="badge badge-info">{b.type.toUpperCase()}</span>
                  <span className="badge badge-success">{b.status.toUpperCase()}</span>
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>{b.description}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '6px' }}>
                  <MapPin size={13} />
                  <span>{b.location || 'Location Not Specified'}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                  Vendor: <strong>{b.vendor_name || 'Direct'}</strong>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Total Cost:</span>
                    <strong style={{ fontSize: '15px', color: 'var(--color-ink)' }}>₹{b.total_cost.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Model:</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{b.allocation_model.replace('_', ' ')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Vendor Paid By:</span>
                    <span>{b.paid_by?.name || 'Not Paid'}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  Assigned: {b.assigned_participants?.length || 0} People
                </span>

                {isHost ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => onEditBooking(b)}
                      style={{
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--color-forest-ink)'
                      }}
                      title="Edit Booking"
                    >
                      <Edit size={13} /> Edit
                    </button>
                    <button
                      onClick={() => onDeleteBooking(b)}
                      style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#dc2626'
                      }}
                      title="Delete Booking"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontStyle: 'italic' }}>
                    👑 Host Locked
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* 4. PEOPLE TAB */
const PeopleTab = ({ participants, trip, onAddParticipant, onDepartParticipant, onRefresh }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Trip Participants ({participants.length})</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            Manage attendance, cost multipliers (students/sponsors), and early departures.
          </p>
        </div>
        <button className="btn-primary" onClick={onAddParticipant} style={{ fontSize: '12px' }}>
          <Plus size={15} /> Add Member
        </button>
      </div>

      <div className="table-responsive-wrapper">
        <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name / Email</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Cost Tier</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Total Paid</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Total Owed</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Net Position</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {participants.map(p => {
              const balance = (p.total_paid || 0) - (p.total_owed || 0);
              return (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ color: 'var(--color-ink)' }}>{p.name}</strong>
                      {p.user_id && (
                        <span style={{ fontSize: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          🎒 MEMBER
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{p.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${p.status === 'active' || p.status === 'confirmed' ? 'badge-success' : p.status === 'departed' ? 'badge-warning' : 'badge-danger'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: 600, fontSize: '12px' }}>{p.cost_tier} ({p.tier_multiplier}x)</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>₹{(p.total_paid || 0).toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>₹{(p.total_owed || 0).toFixed(2)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {balance > 0.005 ? (
                      <span className="badge badge-success" style={{ fontSize: '12px', fontWeight: 700 }}>
                        + ₹{balance.toFixed(2)} (Owed)
                      </span>
                    ) : balance < -0.005 ? (
                      <span className="badge badge-danger" style={{ fontSize: '12px', fontWeight: 700 }}>
                        - ₹{Math.abs(balance).toFixed(2)} (Owes)
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                        Settled (₹0.00)
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {p.status !== 'departed' && (
                      <button className="btn-secondary" onClick={() => onDepartParticipant(p)} style={{ fontSize: '11px', padding: '4px 8px' }}>
                        Depart Early
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* 5. LEDGER TAB */
const LedgerTab = ({ tripId, participants }) => {
  const [ledgerData, setLedgerData] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [subTab, setSubTab] = useState('ledger');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getLedger(tripId),
      api.getAuditLogs(tripId)
    ]).then(([lRes, aRes]) => {
      if (lRes.success) setLedgerData(lRes.ledger);
      if (aRes.success) setAuditLogs(aRes.logs);
    }).finally(() => setLoading(false));
  }, [tripId]);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading Financial Ledger...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button className={subTab === 'ledger' ? 'btn-primary' : 'btn-secondary'} onClick={() => setSubTab('ledger')} style={{ fontSize: '12px' }}>
          Double-Entry Ledger Statement
        </button>
        <button className={subTab === 'audit' ? 'btn-primary' : 'btn-secondary'} onClick={() => setSubTab('audit')} style={{ fontSize: '12px' }}>
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {subTab === 'ledger' ? (
        <div className="table-responsive-wrapper">
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px' }}>Entry Type</th>
                <th style={{ padding: '12px 16px' }}>Description</th>
                <th style={{ padding: '12px 16px' }}>Payer / Creditor</th>
                <th style={{ padding: '12px 16px' }}>Participant / Debtor</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount / Share</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>No ledger entries.</td></tr>
              ) : (
                ledgerData.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px' }}>{new Date(item.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}><span className="badge badge-primary">{item.type}</span></td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{item.description}</td>
                    <td style={{ padding: '12px 16px' }}>{item.payer}</td>
                    <td style={{ padding: '12px 16px' }}>{item.participant}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>₹{item.participantShare.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-responsive-wrapper">
          <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px' }}>Timestamp</th>
                <th style={{ padding: '12px 16px' }}>Action</th>
                <th style={{ padding: '12px 16px' }}>Actor</th>
                <th style={{ padding: '12px 16px' }}>Details / Reason</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}><span className="badge badge-info">{log.action}</span></td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{log.actorName}</td>
                  <td style={{ padding: '12px 16px' }}>{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* 6. SETTLEMENT TAB */
const SettlementTab = ({ tripId, trip, participants, onRefresh }) => {
  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settleModalTx, setSettleModalTx] = useState(null);
  const [settleMethod, setSettleMethod] = useState('upi'); // 'upi' | 'cash' | 'bank'
  const [copiedUpi, setCopiedUpi] = useState(false);

  const fetchSettlement = async () => {
    try {
      const res = await api.getSettlement(tripId);
      if (res.success) setSettlement(res.settlement);
    } catch (err) {
      console.error('Fetch settlement error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlement();
  }, [tripId]);

  const handleFinalize = async () => {
    try {
      const res = await api.finalizeSettlement(tripId);
      if (res.success) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        fetchSettlement();
        onRefresh();
        alert('Settlement finalized! Required payout transactions calculated.');
      }
    } catch (err) {
      alert(err.message || 'Error finalizing settlement');
    }
  };

  const handleRecordPayment = async (tx, method = 'upi') => {
    try {
      const fromId = tx.from_participant?._id || tx.from_participant;
      const toId = tx.to_participant?._id || tx.to_participant;

      const res = await api.recordSettlementPayment(tripId, {
        transaction_id: tx._id,
        from_participant: fromId,
        to_participant: toId,
        amount: tx.amount,
        payment_method: method
      });
      if (res.success) {
        confetti({ particleCount: 75, spread: 60 });
        fetchSettlement();
        onRefresh();
      }
    } catch (err) {
      alert(err.message || 'Error marking payment');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>Calculating Greedy Settlement Matrix...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Settlement Summary Card */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-forest-ink)' }}>Automated Settlement Engine</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Greedy bipartite algorithm resolves all debts in the absolute minimum number of peer transactions.
          </p>
        </div>

        <button className="btn-primary" onClick={handleFinalize} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 800 }}>
          Recalculate & Finalize Settlements
        </button>
      </div>

      {/* Net Balances Table */}
      <div className="card">
        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-forest-ink)' }}>Participant Net Position Summary</h4>
        <div className="table-responsive-wrapper">
          <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px' }}>Participant</th>
                <th style={{ padding: '12px 16px' }}>Total Out of Pocket Paid</th>
                <th style={{ padding: '12px 16px' }}>Total Consumption Share</th>
                <th style={{ padding: '12px 16px' }}>Net Position (Credit / Debt)</th>
              </tr>
            </thead>
            <tbody>
              {settlement?.balances?.map((b, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{b.name}</td>
                  <td style={{ padding: '12px 16px' }}>₹{(b.total_paid || 0).toFixed(2)}</td>
                  <td style={{ padding: '12px 16px' }}>₹{(b.total_owed || 0).toFixed(2)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {b.net_balance > 0.005 ? (
                      <span className="badge badge-success" style={{ fontSize: '12px', fontWeight: 700 }}>
                        + ₹{b.net_balance.toFixed(2)} (Owed / Creditor)
                      </span>
                    ) : b.net_balance < -0.005 ? (
                      <span className="badge badge-danger" style={{ fontSize: '12px', fontWeight: 700 }}>
                        - ₹{Math.abs(b.net_balance).toFixed(2)} (Owes / Debtor)
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                        Even (₹0.00 Settled)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Required Payout Transactions */}
      <div className="card">
        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-forest-ink)' }}>
          Required Peer Payout Transactions ({settlement?.transactions_required?.length || 0})
        </h4>

        {settlement?.transactions_required?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: '#15803d', fontWeight: 700, backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #86efac' }}>
            🎉 All accounts are perfectly balanced! No peer payments required.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {settlement?.transactions_required?.map((tx) => (
              <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: tx.status === 'COMPLETED' ? '#f0fdf4' : '#ffffff', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-forest-ink)' }}>{tx.from_participant?.name || 'Member'}</div>
                  <ArrowRight size={16} style={{ color: 'var(--color-primary)' }} />
                  <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-forest-ink)' }}>{tx.to_participant?.name || 'Member'}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-deacon)', color: 'var(--color-forest-ink)' }}>₹{tx.amount.toFixed(2)}</span>
                  {tx.status === 'COMPLETED' ? (
                    <span className="badge badge-success" style={{ padding: '6px 10px', fontSize: '11px' }}>✓ SETTLED</span>
                  ) : (
                    <button
                      className="btn-meadow"
                      onClick={() => {
                        setSettleModalTx(tx);
                        setSettleMethod('upi');
                      }}
                      style={{ fontSize: '11px', padding: '6px 14px', fontWeight: 800 }}
                    >
                      Settle Up →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settle Up Interactive Modal */}
      {settleModalTx && (
        <div className="modal-overlay" onClick={() => setSettleModalTx(null)}>
          <div className="modal-dialog" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-forest-ink)' }}>Settle Up Debt</h3>
              <button onClick={() => setSettleModalTx(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--color-muted)' }}>×</button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '18px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-moss-gray)', textTransform: 'uppercase', fontWeight: 700 }}>Peer Settlement</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '8px 0', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '15px', color: 'var(--color-forest-ink)' }}>{settleModalTx.from_participant?.name || 'Debtor'}</strong>
                <ArrowRight size={16} color="var(--color-forest-ink)" />
                <strong style={{ fontSize: '15px', color: 'var(--color-forest-ink)' }}>{settleModalTx.to_participant?.name || 'Creditor'}</strong>
              </div>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-deacon)', fontWeight: 900, color: 'var(--color-forest-ink)' }}>
                ₹{settleModalTx.amount.toFixed(2)}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {[
                { id: 'upi', label: '📱 UPI Direct' },
                { id: 'cash', label: '💵 Cash Handover' },
                { id: 'bank', label: '🏦 Bank IMPS' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSettleMethod(m.id)}
                  style={{
                    flex: '1 1 100px', padding: '10px 8px', borderRadius: '8px', border: settleMethod === m.id ? '2px solid var(--color-forest-ink)' : '1px solid #cbd5e1',
                    backgroundColor: settleMethod === m.id ? 'rgba(85, 221, 74, 0.15)' : '#ffffff',
                    fontWeight: 700, fontSize: '12px', cursor: 'pointer', color: 'var(--color-forest-ink)'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {settleMethod === 'upi' && (
              <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '10px', border: '1px solid #86efac', marginBottom: '18px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#166534' }}>Recipient UPI VPA:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const upiId = `${(settleModalTx.to_participant?.name || 'payee').toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`;
                      navigator.clipboard.writeText(upiId);
                      setCopiedUpi(true);
                      setTimeout(() => setCopiedUpi(false), 2000);
                    }}
                    style={{ fontSize: '11px', background: '#ffffff', border: '1px solid #86efac', borderRadius: '6px', padding: '2px 8px', cursor: 'pointer', fontWeight: 700, color: '#15803d' }}
                  >
                    {copiedUpi ? '✓ Copied' : 'Copy UPI'}
                  </button>
                </div>
                <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '14px', color: '#14532d', wordBreak: 'break-all' }}>
                  {`${(settleModalTx.to_participant?.name || 'payee').toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`}
                </div>
                <p style={{ fontSize: '11px', color: '#15803d', marginTop: '6px', lineHeight: 1.4 }}>
                  Open Google Pay, PhonePe, or Paytm and send ₹{settleModalTx.amount.toFixed(2)}. Once transferred, click confirm below.
                </p>
              </div>
            )}

            {settleMethod === 'cash' && (
              <div style={{ backgroundColor: '#fefce8', padding: '14px', borderRadius: '10px', border: '1px solid #fef08a', marginBottom: '18px', fontSize: '13px', color: '#854d0e', lineHeight: 1.4 }}>
                💵 <strong>Handover in Cash:</strong> You are recording an in-person cash handover of ₹{settleModalTx.amount.toFixed(2)} directly to {settleModalTx.to_participant?.name}.
              </div>
            )}

            {settleMethod === 'bank' && (
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '18px', fontSize: '13px', color: '#334155', lineHeight: 1.4 }}>
                🏦 <strong>Direct Bank Transfer:</strong> Transfer ₹{settleModalTx.amount.toFixed(2)} via IMPS / NEFT directly to {settleModalTx.to_participant?.name}'s account.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={() => setSettleModalTx(null)}>Cancel</button>
              <button
                type="button"
                className="btn-meadow"
                onClick={async () => {
                  await handleRecordPayment(settleModalTx, settleMethod);
                  setSettleModalTx(null);
                }}
                style={{ fontWeight: 800 }}
              >
                Confirm Payment & Settle ✓
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

/* 7. REPORT TAB */
const ReportTab = ({ tripId, trip }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportFeedback, setExportFeedback] = useState(null);

  const fetchReport = () => {
    setLoading(true);
    api.getReport(tripId)
      .then(res => {
        if (res.success) setReportData(res.report);
      })
      .catch(err => {
        console.error('Error fetching report:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, [tripId]);

  const handleExportPDF = async () => {
    setExportingPdf(true);
    setExportFeedback(null);
    try {
      await api.downloadReportPDF(tripId, trip?.name || reportData?.tripName || 'Trip');
      setExportFeedback({ type: 'success', message: 'PDF report generated and downloaded successfully!' });
      setTimeout(() => setExportFeedback(null), 5000);
    } catch (err) {
      console.warn('Direct Blob download failed, attempting window popup fallback...', err);
      try {
        const url = api.downloadReportPDFUrl(tripId);
        window.open(url, '_blank');
        setExportFeedback({ type: 'info', message: 'PDF opened in a new tab.' });
        setTimeout(() => setExportFeedback(null), 5000);
      } catch (fallbackErr) {
        setExportFeedback({ type: 'error', message: err.message || 'Failed to generate PDF report.' });
        setTimeout(() => setExportFeedback(null), 6000);
      }
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--color-primary)' }} />
        <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-forest-ink)' }}>Compiling Financial Report...</h4>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Auditing all bookings, shared expenses, and member balance splits.
        </p>
      </div>
    );
  }

  const currency = (!trip?.currency || trip.currency === 'USD') ? 'INR' : trip.currency;
  const currSym = (currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Report Header Card */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <FileText size={20} color="var(--color-forest-ink)" />
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-forest-ink)', margin: 0 }}>
              Trip Financial Report & Audit
            </h3>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', margin: 0 }}>
            Full spending breakdown, per-person balances, and certified PDF export.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchReport}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh Report Data"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={exportingPdf}
            className="btn-primary"
            style={{
              fontSize: '13px',
              padding: '10px 18px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: exportingPdf ? 0.7 : 1,
              cursor: exportingPdf ? 'not-allowed' : 'pointer'
            }}
          >
            {exportingPdf ? (
              <>
                <RefreshCw size={15} className="animate-spin" /> Generating PDF...
              </>
            ) : (
              <>
                <Download size={15} /> Export PDF Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export Status Notification */}
      {exportFeedback && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: 600,
          backgroundColor: exportFeedback.type === 'success' ? '#f0fdf4' : exportFeedback.type === 'error' ? '#fef2f2' : '#eff6ff',
          color: exportFeedback.type === 'success' ? '#166534' : exportFeedback.type === 'error' ? '#991b1b' : '#1e40af',
          border: `1px solid ${exportFeedback.type === 'success' ? '#bbf7d0' : exportFeedback.type === 'error' ? '#fecaca' : '#bfdbfe'}`
        }}>
          {exportFeedback.type === 'success' && <CheckCircle2 size={16} />}
          {exportFeedback.type === 'error' && <AlertTriangle size={16} />}
          {exportFeedback.type === 'info' && <Info size={16} />}
          <span>{exportFeedback.message}</span>
        </div>
      )}

      {/* 4 Metric Summary Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-moss-gray)', textTransform: 'uppercase' }}>Consolidated Total</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-forest-ink)', marginTop: '4px' }}>
            {currSym}{(reportData?.totalCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {reportData?.durationDays ? `${reportData.durationDays} days duration` : 'Total expenses & bookings'}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-moss-gray)', textTransform: 'uppercase' }}>Per-Person Share</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-forest-ink)', marginTop: '4px' }}>
            {currSym}{(reportData?.perPersonAverage || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Equal split among {reportData?.participants?.length || 0} members
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-moss-gray)', textTransform: 'uppercase' }}>Budget Utilization</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: (reportData?.budgetUsedPercent || 0) > 100 ? '#dc2626' : 'var(--color-forest-ink)', marginTop: '4px' }}>
            {reportData?.budget > 0 ? `${reportData.budgetUsedPercent}%` : 'N/A'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {reportData?.budget > 0 ? `${currSym}${reportData.budget.toLocaleString('en-IN')} allocated` : 'No budget set'}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-moss-gray)', textTransform: 'uppercase' }}>Settlement Status</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: (reportData?.settlementTransactions?.length || 0) === 0 ? '#16a34a' : '#d97706', marginTop: '4px' }}>
            {(reportData?.settlementTransactions?.length || 0) === 0 ? 'Balanced ✓' : `${reportData.settlementTransactions.length} Pending`}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {(reportData?.settlementTransactions?.length || 0) === 0 ? 'All debts cleared' : 'Transfers required'}
          </div>
        </div>
      </div>

      {/* Spending by Category */}
      <div className="card">
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--color-forest-ink)' }}>Spending by Category</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '12px' }}>
          {Object.entries(reportData?.byCategory || {}).map(([cat, amt]) => {
            const pct = (reportData?.totalCost || 0) > 0 ? Math.round((amt / reportData.totalCost) * 100) : 0;
            return (
              <div key={cat} style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>{cat}</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)', marginTop: '4px' }}>
                  {currSym}{amt.toFixed(2)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-moss-gray)', marginTop: '4px' }}>
                  {pct}% of total
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Member Financial Ledger */}
      <div className="card">
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--color-forest-ink)' }}>Member Balances</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: '10px 8px' }}>Member</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Total Paid</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Total Owed</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Net Balance</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.participants?.map((p) => {
                const net = p.netBalance || ((p.totalPaid || 0) - (p.totalOwed || 0));
                const isCreditor = net > 0.01;
                const isDebtor = net < -0.01;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <strong style={{ color: 'var(--color-forest-ink)' }}>{p.name}</strong>
                      {p.email && <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{p.email}</div>}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>
                      {currSym}{(p.totalPaid || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>
                      {currSym}{(p.totalOwed || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '12px',
                        backgroundColor: isCreditor ? '#f0fdf4' : isDebtor ? '#fef2f2' : '#f8fafc',
                        color: isCreditor ? '#166534' : isDebtor ? '#991b1b' : '#475569',
                        border: `1px solid ${isCreditor ? '#86efac' : isDebtor ? '#fca5a5' : '#cbd5e1'}`
                      }}>
                        {isCreditor ? `Gets ${currSym}${net.toFixed(2)}` : isDebtor ? `Owes ${currSym}${Math.abs(net).toFixed(2)}` : 'Settled (₹0.00)'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Recommendations */}
      {reportData?.recommendations && reportData.recommendations.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sparkles size={18} color="#2563eb" />
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-forest-ink)', margin: 0 }}>
              AI Financial Insights & Recommendations
            </h4>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '12px' }}>
            {reportData.recommendations.map((rec, idx) => (
              <div key={idx} style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '13px', color: '#0369a1' }}>{rec.title}</strong>
                  {rec.savingsAmount > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>
                      Save ~{currSym}{rec.savingsAmount}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#334155', margin: 0, lineHeight: 1.4 }}>
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


/* 8. SETTINGS TAB */
const SettingsTab = ({ trip, isHost, onDeleteTrip, onRefresh }) => {
  const [form, setForm] = useState({
    name: trip.name,
    destination: trip.destination || '',
    budget: trip.budget,
    currency: trip.currency,
    cost_sharing_model: trip.cost_sharing_model,
    refund_policy: trip.refund_policy,
    rounding_method: trip.rounding_method
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateTrip(trip._id, form);
      onRefresh();
      alert('Trip settings saved!');
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
      <div className="card">
        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>Trip Rules & Settings</h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Trip Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Destination</label>
            <input
              type="text"
              value={form.destination}
              onChange={e => setForm({ ...form, destination: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Budget (₹)</label>
            <input
              type="number"
              value={form.budget}
              onChange={e => setForm({ ...form, budget: Number(e.target.value) })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Rounding Method</label>
            <select
              value={form.rounding_method}
              onChange={e => setForm({ ...form, rounding_method: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
            >
              <option value="last_person">Last Person Absorbs Rounding Diff</option>
              <option value="banker">Banker's Rounding (Nearest Cent)</option>
              <option value="equal">Equal Distribution</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '12px' }}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Danger Zone: Host Delete Entire Trip */}
      {isHost && (
        <div style={{
          padding: '22px',
          border: '2px solid #ef4444',
          borderRadius: '16px',
          backgroundColor: '#fef2f2',
          boxShadow: '0 4px 16px rgba(239, 68, 68, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#991b1b', marginBottom: '8px' }}>
            <AlertTriangle size={22} color="#dc2626" />
            <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 900 }}>DANGER ZONE: DELETE EXPEDITION</h4>
          </div>
          <p style={{ fontSize: '13px', color: '#7f1d1d', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            Permanently delete this entire group trip. All expenses, locked group bookings, member side quests, ledger entries, and settlements will be permanently erased. This cannot be undone.
          </p>
          <button
            type="button"
            onClick={onDeleteTrip}
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.15s ease'
            }}
          >
            <Trash2 size={16} /> Delete Entire Trip Permanently
          </button>
        </div>
      )}
    </div>
  );
};

/* ADD EXPENSE WIZARD MODAL COMPONENT (7 Steps as per design specs) */
const AddExpenseWizardModal = ({ step, setStep, expenseForm, setExpenseForm, participants, parsedData, itineraryBlocks = [], onSubmit, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
        
        {/* Wizard Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-forest-ink)' }}>Log Group Expense</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step {step} of 7</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--color-muted)', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={onSubmit}>
          {/* STEP 1: Entry Method */}
          {step === 1 && (
            <div>
              {parsedData ? (
                <div style={{ backgroundColor: '#f0fdf4', padding: '18px', borderRadius: '14px', border: '1.5px solid #86efac', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={18} /> {parsedData.source?.includes('vision') ? 'OpenRouter Vision AI Parsed Receipt' : 'AI Parsed Receipt Summary'}
                    </span>
                    <span style={{ fontSize: '12px', backgroundColor: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '12px', fontWeight: 700, border: '1px solid #86efac' }}>
                      ✨ {parsedData.confidence}% Confidence
                    </span>
                  </div>

                  <div className="responsive-grid-form" style={{ gap: '8px', fontSize: '13px', marginBottom: '8px' }}>
                    <div><strong>Merchant:</strong> {parsedData.merchant}</div>
                    <div><strong>Category:</strong> <span className="badge badge-primary">{parsedData.category}</span></div>
                    <div><strong>Date:</strong> {parsedData.date}</div>
                    <div><strong>Currency:</strong> {parsedData.currency}</div>
                  </div>

                  {/* Financial Breakdown: Subtotal, Tax, Other, Final Total */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px', color: '#0369a1', backgroundColor: '#f0f9ff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bae6fd', margin: '8px 0' }}>
                    <span><strong>Subtotal:</strong> {parsedData.currency === 'USD' ? '$' : parsedData.currency === 'EUR' ? '€' : parsedData.currency === 'GBP' ? '£' : '₹'}{Number(parsedData.subtotal || 0).toFixed(2)}</span>
                    {Number(parsedData.tax || 0) > 0 && (
                      <span>• <strong>Tax:</strong> {parsedData.currency === 'USD' ? '$' : parsedData.currency === 'EUR' ? '€' : parsedData.currency === 'GBP' ? '£' : '₹'}{Number(parsedData.tax).toFixed(2)}</span>
                    )}
                    {Number(parsedData.tip || 0) > 0 && (
                      <span>• <strong>Other/Fees:</strong> {parsedData.currency === 'USD' ? '$' : parsedData.currency === 'EUR' ? '€' : parsedData.currency === 'GBP' ? '£' : '₹'}{Number(parsedData.tip).toFixed(2)}</span>
                    )}
                    <span style={{ marginLeft: 'auto', fontWeight: 800, color: '#15803d' }}>
                      <strong>Total:</strong> {parsedData.currency === 'USD' ? '$' : parsedData.currency === 'EUR' ? '€' : parsedData.currency === 'GBP' ? '£' : '₹'}{Number(parsedData.total || 0).toFixed(2)}
                    </span>
                  </div>

                  <div style={{ fontSize: '14px', margin: '10px 0', padding: '10px 12px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>
                      Final Post-Tax Amount ({parsedData.currency === 'USD' ? '$' : parsedData.currency === 'EUR' ? '€' : parsedData.currency === 'GBP' ? '£' : '₹'}):
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#15803d' }}>
                        {parsedData.currency === 'USD' ? '$' : parsedData.currency === 'EUR' ? '€' : parsedData.currency === 'GBP' ? '£' : '₹'}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={expenseForm.amount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExpenseForm(prev => ({ ...prev, amount: val }));
                          setParsedData(prev => prev ? ({ ...prev, total: parseFloat(val) || 0 }) : null);
                        }}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1.5px solid #86efac', fontWeight: 800, fontSize: '16px', color: '#15803d', width: '120px' }}
                      />
                    </div>
                  </div>

                  {parsedData.items && parsedData.items.length > 0 && (
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #bbf7d0' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '6px' }}>Line Items Breakdown ({parsedData.items.length}):</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#1f2937', backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', maxHeight: '140px', overflowY: 'auto' }}>
                        {parsedData.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: idx < parsedData.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                            <span>• {item.name} <strong style={{ color: '#64748b' }}>(x{item.quantity})</strong></span>
                            <span style={{ fontWeight: 600 }}>{parsedData.currency === 'USD' ? '$' : parsedData.currency === 'EUR' ? '€' : parsedData.currency === 'GBP' ? '£' : '₹'}{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* OCR Itinerary Block Matching / Selector */}
                  {itineraryBlocks && itineraryBlocks.length > 0 && (
                    <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #86efac' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '6px' }}>
                        🗓️ Attach Bill to Itinerary Time Block (Optional):
                      </label>
                      <select
                        value={expenseForm.itineraryBlockId || ''}
                        onChange={e => {
                          const bId = e.target.value;
                          const b = itineraryBlocks.find(item => item._id === bId);
                          setExpenseForm(prev => ({
                            ...prev,
                            itineraryBlockId: bId,
                            category: b ? (['FOOD','ACCOMMODATION','TRANSPORT','ACTIVITY','OTHER'].includes(b.category) ? b.category : 'OTHER') : prev.category
                          }));
                        }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '13px', backgroundColor: '#ffffff' }}
                      >
                        <option value="">-- No Itinerary Block (General Bill) --</option>
                        {itineraryBlocks.map(b => (
                          <option key={b._id} value={b._id}>
                            Day {b.day_number}: {b.title} ({b.start_time || b.time_slot})
                          </option>
                        ))}
                      </select>
                      {expenseForm.itineraryBlockId && (
                        <input
                          type="text"
                          placeholder="Sub-unit label (e.g. Table 1, Table 2, Room 302)"
                          value={expenseForm.subgroupTag || ''}
                          onChange={e => setExpenseForm({ ...expenseForm, subgroupTag: e.target.value })}
                          style={{ width: '100%', marginTop: '6px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '12px', backgroundColor: '#ffffff' }}
                        />
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: 700, justifyContent: 'center' }}
                      onClick={() => setStep(2)}
                    >
                      ⚡ Apply AI Data & Customize Split →
                    </button>
                  </div>
                </div>
              ) : null}

              {!parsedData && (
                <div>
                  <p style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--color-charcoal)' }}>How would you like to record this expense?</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button type="button" className="btn-secondary" style={{ justifyContent: 'flex-start', padding: '16px', fontSize: '14px', fontWeight: 600 }} onClick={() => setStep(2)}>
                      📝 Manual Entry (Description, Category & Split)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Description, Merchant & Side Quest Toggle */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-forest-ink)' }}>Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Group Seafood Dinner"
                  value={expenseForm.description}
                  onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', backgroundColor: '#ffffff' }}
                />
              </div>

              <div className="responsive-grid-form" style={{ gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-forest-ink)' }}>Merchant / Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Fisherman's Wharf"
                    value={expenseForm.merchant}
                    onChange={e => setExpenseForm({ ...expenseForm, merchant: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', backgroundColor: '#ffffff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-forest-ink)' }}>Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', backgroundColor: '#ffffff' }}
                  >
                    <option value="FOOD">Food & Dining</option>
                    <option value="ACCOMMODATION">Accommodation</option>
                    <option value="TRANSPORT">Transport & Taxis</option>
                    <option value="ACTIVITY">Activities & Excursions</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Link to Itinerary Block Selector */}
              {itineraryBlocks && itineraryBlocks.length > 0 && (
                <div style={{ backgroundColor: '#f8fafc', border: '1.5px solid var(--color-border)', borderRadius: '10px', padding: '12px 14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-forest-ink)' }}>
                    🗓️ Link to Itinerary Time Block (Optional)
                  </label>
                  <select
                    value={expenseForm.itineraryBlockId || ''}
                    onChange={e => {
                      const bId = e.target.value;
                      const b = itineraryBlocks.find(item => item._id === bId);
                      setExpenseForm(prev => ({
                        ...prev,
                        itineraryBlockId: bId,
                        category: b ? (['FOOD','ACCOMMODATION','TRANSPORT','ACTIVITY','OTHER'].includes(b.category) ? b.category : 'OTHER') : prev.category
                      }));
                    }}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px', backgroundColor: '#ffffff' }}
                  >
                    <option value="">-- No Itinerary Block (General Spend) --</option>
                    {itineraryBlocks.map(b => (
                      <option key={b._id} value={b._id}>
                        Day {b.day_number}: {b.title} ({b.start_time || b.time_slot})
                      </option>
                    ))}
                  </select>

                  {expenseForm.itineraryBlockId && (
                    <div style={{ marginTop: '10px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-forest-ink)', marginBottom: '4px' }}>
                        Sub-unit / Table / Room Label (for multiple tables or rooms)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Table 1 (Veg/Drinks), Table 2, Room 302"
                        value={expenseForm.subgroupTag || ''}
                        onChange={e => setExpenseForm({ ...expenseForm, subgroupTag: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px', backgroundColor: '#ffffff' }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Side Quest / Sub-crew Spend Toggle */}
              <div style={{
                backgroundColor: expenseForm.isSideQuest ? '#f0fdf4' : '#f8fafc',
                border: `1.5px solid ${expenseForm.isSideQuest ? '#86efac' : 'var(--color-sage-border)'}`,
                borderRadius: '12px',
                padding: '14px',
                marginTop: '4px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: expenseForm.isSideQuest ? '#166534' : 'var(--color-forest-ink)' }}>
                  <input
                    type="checkbox"
                    checked={expenseForm.isSideQuest}
                    onChange={(e) => setExpenseForm({ ...expenseForm, isSideQuest: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#16a34a' }}
                  />
                  <span>🎮 Is this a Side Quest / Sub-Crew Spend?</span>
                </label>
                <p style={{ fontSize: '12px', color: expenseForm.isSideQuest ? '#15803d' : 'var(--color-moss-gray)', marginTop: '6px', marginLeft: '28px', lineHeight: 1.4 }}>
                  Enable this if only a subset of travelers joined this excursion (e.g. scuba diving, late-night cafe, taxi ride). Only members selected in Step 5 will share this cost; other group members owe ₹0.00!
                </p>
                {expenseForm.isSideQuest && (
                  <div style={{ marginTop: '10px', marginLeft: '28px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>Side Quest Name / Activity Title *</label>
                    <input
                      type="text"
                      required={expenseForm.isSideQuest}
                      placeholder="e.g. Scuba Diving at Grand Island"
                      value={expenseForm.sideQuestTitle}
                      onChange={(e) => setExpenseForm({ ...expenseForm, sideQuestTitle: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #86efac', fontSize: '13px', backgroundColor: '#ffffff' }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Payer Selection */}
          {step === 3 && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-forest-ink)' }}>Who Paid for this Expense? *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {participants.map(p => (
                  <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: expenseForm.payerId === p._id ? '2px solid var(--color-forest-ink)' : '1px solid var(--color-border)', cursor: 'pointer', backgroundColor: expenseForm.payerId === p._id ? 'rgba(85, 221, 74, 0.12)' : '#ffffff' }}>
                    <input
                      type="radio"
                      name="payer"
                      value={p._id}
                      checked={expenseForm.payerId === p._id}
                      onChange={() => setExpenseForm({ ...expenseForm, payerId: p._id })}
                    />
                    <div>
                      <strong style={{ fontSize: '14px', color: 'var(--color-forest-ink)' }}>{p.name}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--color-moss-gray)', marginLeft: '8px' }}>({p.email})</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Amount Input */}
          {step === 4 && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-forest-ink)' }}>Total Expense Amount (₹) *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '22px', fontWeight: 900, color: 'var(--color-forest-ink)' }}>₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '10px', border: '2px solid var(--color-forest-ink)', fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-deacon)', color: 'var(--color-forest-ink)', backgroundColor: '#ffffff' }}
                />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-moss-gray)', marginTop: '8px' }}>
                Enter the exact total amount in INR. Any fractional pennies will be resolved via the trip's rounding policy.
              </p>
            </div>
          )}

          {/* STEP 5: Participant Selection */}
          {step === 5 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-forest-ink)' }}>
                  {expenseForm.isSideQuest ? '🎮 Select Side Quest Crew' : 'Who Participated in this Expense?'}
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={() => setExpenseForm({ ...expenseForm, selectedParticipantIds: participants.map(p => p._id) })} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>Select All</button>
                  <button type="button" onClick={() => setExpenseForm({ ...expenseForm, selectedParticipantIds: [] })} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>Clear All</button>
                </div>
              </div>

              {expenseForm.isSideQuest && (
                <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '12px', color: '#854d0e', fontWeight: 600 }}>
                  🎮 Side Quest Mode: Only the selected travelers will share this ₹{Number(expenseForm.amount || 0).toFixed(2)} cost. Non-selected members will not be billed!
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                {participants.map(p => {
                  const isChecked = expenseForm.selectedParticipantIds.includes(p._id);
                  return (
                    <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', border: isChecked ? '1.5px solid var(--color-meadow-border)' : '1px solid var(--color-border)', cursor: 'pointer', backgroundColor: isChecked ? 'rgba(85, 221, 74, 0.08)' : '#ffffff' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExpenseForm({ ...expenseForm, selectedParticipantIds: [...expenseForm.selectedParticipantIds, p._id] });
                          } else {
                            setExpenseForm({ ...expenseForm, selectedParticipantIds: expenseForm.selectedParticipantIds.filter(id => id !== p._id) });
                          }
                        }}
                      />
                      <span style={{ fontWeight: 600, color: 'var(--color-forest-ink)' }}>{p.name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--color-moss-gray)', marginLeft: 'auto' }}>
                        {isChecked && expenseForm.amount && expenseForm.selectedParticipantIds.length > 0
                          ? `₹${(Number(expenseForm.amount) / expenseForm.selectedParticipantIds.length).toFixed(2)} share`
                          : 'Not participating'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Split Model Selection */}
          {step === 6 && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-forest-ink)' }}>Select Split Model</label>
              <select
                value={expenseForm.splitMethod}
                onChange={e => setExpenseForm({ ...expenseForm, splitMethod: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', backgroundColor: '#ffffff' }}
              >
                <option value="EQUAL">Equally Among Selected Participants</option>
                <option value="PERCENTAGE">By Percentage</option>
                <option value="CUSTOM">Custom Rupee Amounts</option>
              </select>

              <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', fontSize: '13px', color: 'var(--color-charcoal)' }}>
                {expenseForm.splitMethod === 'EQUAL' && (
                  <div>
                    <strong>Equal Split:</strong> ₹{Number(expenseForm.amount || 0).toFixed(2)} split across {expenseForm.selectedParticipantIds.length} members = <strong>₹{expenseForm.selectedParticipantIds.length > 0 ? (Number(expenseForm.amount || 0) / expenseForm.selectedParticipantIds.length).toFixed(2) : 0}</strong> each.
                  </div>
                )}
                {expenseForm.splitMethod !== 'EQUAL' && (
                  <div>
                    Custom shares will be calculated automatically according to group settings.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 7: Review & Confirm */}
          {step === 7 && (
            <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '14px', fontSize: '14px', border: '1px solid var(--color-sage-border)' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px', color: 'var(--color-forest-ink)' }}>Review & Confirm Expense</h4>
              
              {expenseForm.isSideQuest && (
                <div style={{ marginBottom: '12px' }}>
                  <span className="badge badge-warning" style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: '12px', padding: '4px 10px' }}>
                    🎮 SIDE QUEST: {expenseForm.sideQuestTitle || 'Sub-Group Spend'}
                  </span>
                </div>
              )}

              {expenseForm.itineraryBlockId && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', fontSize: '12px', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    🗓️ TIME BLOCK: {itineraryBlocks.find(b => b._id === expenseForm.itineraryBlockId)?.title || 'Linked Itinerary Block'}
                    {expenseForm.subgroupTag ? ` • Tag: ${expenseForm.subgroupTag}` : ''}
                  </span>
                </div>
              )}

              <div className="responsive-grid-form" style={{ gap: '10px', fontSize: '13px', marginBottom: '12px' }}>
                <div><strong>Description:</strong> {expenseForm.description}</div>
                <div><strong>Total Amount:</strong> <span style={{ color: 'var(--color-forest-ink)', fontWeight: 800 }}>₹{Number(expenseForm.amount).toFixed(2)}</span></div>
                <div><strong>Category:</strong> {expenseForm.category}</div>
                <div><strong>Paid By:</strong> {participants.find(p => p._id === expenseForm.payerId)?.name || 'Payer'}</div>
                <div><strong>Split Model:</strong> {expenseForm.splitMethod}</div>
                <div><strong>Participants:</strong> {expenseForm.selectedParticipantIds.length} members</div>
              </div>

              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-moss-gray)' }}>Selected Members:</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {expenseForm.selectedParticipantIds.map(id => {
                    const p = participants.find(part => part._id === id);
                    return (
                      <span key={id} style={{ fontSize: '11px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        {p?.name || 'Member'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Wizard Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
            {step > 1 ? (
              <button type="button" className="btn-secondary" onClick={() => setStep(step - 1)}>Back</button>
            ) : (
              <span />
            )}

            {step < 7 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (step === 2 && !expenseForm.description.trim()) {
                    alert('Please enter a description');
                    return;
                  }
                  if (step === 3 && !expenseForm.payerId) {
                    alert('Please select who paid');
                    return;
                  }
                  if (step === 4 && (!expenseForm.amount || Number(expenseForm.amount) <= 0)) {
                    alert('Please enter a valid amount');
                    return;
                  }
                  if (step === 5 && expenseForm.selectedParticipantIds.length === 0) {
                    alert('Please select at least one participant');
                    return;
                  }
                  setStep(step + 1);
                }}
              >
                Next Step →
              </button>
            ) : (
              <button type="submit" className="btn-meadow" style={{ fontWeight: 800 }}>
                Confirm & Log Expense ✓
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

/* EDIT EXPENSE MODAL COMPONENT (Supports Host Expenses & Member Side Quests) */
const EditExpenseModal = ({ expense, participants, itineraryBlocks = [], onSubmit, onClose }) => {
  const [form, setForm] = useState({
    description: expense.description || '',
    merchant: expense.merchant || '',
    category: expense.category || 'FOOD',
    amount: expense.amount !== undefined ? expense.amount : '',
    payerId: (expense.payerId?._id || expense.payerId) || (participants[0]?._id || ''),
    splitMethod: expense.splitMethod || 'EQUAL',
    isSideQuest: !!expense.isSideQuest,
    sideQuestTitle: expense.sideQuestTitle || '',
    itineraryBlockId: expense.itineraryBlockId?._id || expense.itineraryBlockId || '',
    subgroupTag: expense.subgroupTag || '',
    selectedParticipantIds: expense.participants?.map(p => p.memberId?._id || p.memberId) || participants.map(p => p._id)
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) {
      alert('Description is required');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (form.selectedParticipantIds.length === 0) {
      alert('Please select at least one participant');
      return;
    }
    if (form.isSideQuest && !form.sideQuestTitle.trim()) {
      alert('Side Quest activity title is required');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        description: form.description.trim(),
        merchant: form.merchant.trim(),
        category: form.category,
        amount: Number(form.amount),
        payerId: form.payerId,
        splitMethod: form.splitMethod,
        isSideQuest: form.isSideQuest,
        sideQuestTitle: form.sideQuestTitle.trim(),
        itineraryBlockId: form.itineraryBlockId || null,
        subgroupTag: form.subgroupTag || '',
        participants: form.selectedParticipantIds.map(id => ({ memberId: id }))
      });
    } catch (err) {
      alert(err.message || 'Error updating expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-forest-ink)' }}>
              {form.isSideQuest ? '🎮 Edit Side Quest' : 'Edit Trip Expense'}
            </h3>
            <span style={{ fontSize: '12px', color: form.isSideQuest ? '#15803d' : 'var(--color-moss-gray)', fontWeight: 600 }}>
              {form.isSideQuest ? 'Sub-Group Adventure Spend' : 'Shared Group Expense'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--color-muted)' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Description *</label>
            <input
              type="text"
              required
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
            />
          </div>

          <div className="responsive-grid-form" style={{ gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Merchant / Venue</label>
              <input
                type="text"
                value={form.merchant}
                onChange={e => setForm({ ...form, merchant: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              >
                <option value="FOOD">Food & Dining</option>
                <option value="ACCOMMODATION">Accommodation</option>
                <option value="TRANSPORT">Transport & Taxis</option>
                <option value="ACTIVITY">Activities & Excursions</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Link to Itinerary Block */}
          {itineraryBlocks && itineraryBlocks.length > 0 && (
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                🗓️ Link to Itinerary Time Block (Optional)
              </label>
              <select
                value={form.itineraryBlockId}
                onChange={e => setForm({ ...form, itineraryBlockId: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '13px' }}
              >
                <option value="">-- No Itinerary Block --</option>
                {itineraryBlocks.map(b => (
                  <option key={b._id} value={b._id}>
                    Day {b.day_number}: {b.title} ({b.start_time || b.time_slot})
                  </option>
                ))}
              </select>

              {form.itineraryBlockId && (
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Sub-unit / Table / Room Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Table 1, Table 2, Room 302"
                    value={form.subgroupTag}
                    onChange={e => setForm({ ...form, subgroupTag: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '13px' }}
                  />
                </div>
              )}
            </div>
          )}

          {form.isSideQuest && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', padding: '12px 14px', borderRadius: '10px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
                🎮 Side Quest Activity Name *
              </label>
              <input
                type="text"
                required
                value={form.sideQuestTitle}
                onChange={e => setForm({ ...form, sideQuestTitle: e.target.value })}
                placeholder="e.g. Scuba Diving Adventure"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #86efac', fontSize: '13px', backgroundColor: '#ffffff' }}
              />
            </div>
          )}

          <div className="responsive-grid-form" style={{ gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Total Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', fontWeight: 700 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Paid By *</label>
              <select
                value={form.payerId}
                onChange={e => setForm({ ...form, payerId: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              >
                {participants.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>
                {form.isSideQuest ? '🎮 Participating Side Quest Crew' : 'Split Participants'}
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" onClick={() => setForm({ ...form, selectedParticipantIds: participants.map(p => p._id) })} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>Select All</button>
                <button type="button" onClick={() => setForm({ ...form, selectedParticipantIds: [] })} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>Clear</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px' }}>
              {participants.map(p => {
                const isChecked = form.selectedParticipantIds.includes(p._id);
                return (
                  <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', backgroundColor: isChecked ? 'rgba(85, 221, 74, 0.08)' : 'transparent' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({ ...form, selectedParticipantIds: [...form.selectedParticipantIds, p._id] });
                        } else {
                          setForm({ ...form, selectedParticipantIds: form.selectedParticipantIds.filter(id => id !== p._id) });
                        }
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{p.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* EDIT BOOKING MODAL COMPONENT (Host Only) */
const EditBookingModal = ({ booking, participants, itineraryBlocks = [], onSubmit, onClose }) => {
  const [form, setForm] = useState({
    description: booking.description || '',
    location: booking.location || '',
    type: booking.type || 'accommodation',
    vendor_name: booking.vendor_name || '',
    booking_reference: booking.booking_reference || '',
    total_cost: booking.total_cost !== undefined ? booking.total_cost : '',
    paid_by: (booking.paid_by?._id || booking.paid_by) || '',
    start_date: booking.start_date ? booking.start_date.split('T')[0] : '',
    end_date: booking.end_date ? booking.end_date.split('T')[0] : '',
    allocation_model: booking.allocation_model || 'equal',
    itineraryBlockId: booking.itineraryBlockId?._id || booking.itineraryBlockId || '',
    subgroupTag: booking.subgroupTag || '',
    assigned_participant_ids: booking.assigned_participants?.map(ap => ap.participant_id?._id || ap.participant_id) || participants.map(p => p._id)
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) {
      alert('Description is required');
      return;
    }
    if (!form.location || !form.location.trim()) {
      alert('Compulsory location is required for booking');
      return;
    }
    if (!form.total_cost || Number(form.total_cost) <= 0) {
      alert('Please enter a valid total cost');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        description: form.description.trim(),
        location: form.location.trim(),
        type: form.type,
        vendor_name: form.vendor_name.trim(),
        booking_reference: form.booking_reference.trim(),
        total_cost: Number(form.total_cost),
        paid_by: form.paid_by || null,
        start_date: form.start_date,
        end_date: form.end_date,
        allocation_model: form.allocation_model,
        assigned_participant_ids: form.assigned_participant_ids,
        itineraryBlockId: form.itineraryBlockId || null,
        subgroupTag: form.subgroupTag || ''
      });
    } catch (err) {
      alert(err.message || 'Error updating booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Edit Group Booking</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-moss-gray)' }}>Update locked vendor commitments</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Description *</label>
            <input
              type="text"
              required
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
              Booking Location * <span style={{ fontSize: '11px', color: 'var(--color-primary)' }}>(Compulsory)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)' }} />
              <input
                type="text"
                required
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              />
            </div>
          </div>

          <div className="responsive-grid-form" style={{ gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Type</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              >
                <option value="accommodation">Accommodation</option>
                <option value="transportation">Transportation</option>
                <option value="activity">Activity</option>
                <option value="meal">Meal</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Vendor Name</label>
              <input
                type="text"
                value={form.vendor_name}
                onChange={e => setForm({ ...form, vendor_name: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              />
            </div>
          </div>

          <div className="responsive-grid-form" style={{ gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Total Cost (₹) *</label>
              <input
                type="number"
                required
                value={form.total_cost}
                onChange={e => setForm({ ...form, total_cost: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', fontWeight: 700 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Paid By</label>
              <select
                value={form.paid_by}
                onChange={e => setForm({ ...form, paid_by: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              >
                <option value="">Vendor Not Yet Paid</option>
                {participants.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="responsive-grid-form" style={{ gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Start Date *</label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>End Date *</label>
              <input
                type="date"
                required
                value={form.end_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Itinerary Block Selector for Booking */}
          {itineraryBlocks && itineraryBlocks.length > 0 && (
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                🗓️ Link to Itinerary Time Block (Optional)
              </label>
              <select
                value={form.itineraryBlockId}
                onChange={e => setForm({ ...form, itineraryBlockId: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '13px' }}
              >
                <option value="">-- No Itinerary Block --</option>
                {itineraryBlocks.map(b => (
                  <option key={b._id} value={b._id}>
                    Day {b.day_number}: {b.title} ({b.start_time || b.time_slot})
                  </option>
                ))}
              </select>

              {form.itineraryBlockId && (
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Room / Unit Tag (e.g. Room 101, Villa A)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 101, Room 102"
                    value={form.subgroupTag}
                    onChange={e => setForm({ ...form, subgroupTag: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '13px' }}
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Cost Allocation Model</label>
            <select
              value={form.allocation_model}
              onChange={e => setForm({ ...form, allocation_model: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
            >
              <option value="equal">Equal Split</option>
              <option value="weighted_nights">Weighted by Nights Stayed</option>
              <option value="tiered">Tiered Cost Sharing</option>
              <option value="occupancy_based">Occupancy Based</option>
              <option value="consumption_only">Consumption / Attendance Only</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* DELETE TRIP CONFIRMATION MODAL (Strict Name Confirmation Requirement) */
const DeleteTripConfirmationModal = ({ trip, onConfirm, onClose, isDeleting }) => {
  const [confirmInput, setConfirmInput] = useState('');
  const isMatch = confirmInput.trim() === trip.name.trim();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
            <AlertTriangle size={24} />
            <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>Delete Entire Trip</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--color-muted)' }}>×</button>
        </div>

        <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fca5a5', padding: '14px', borderRadius: '10px', marginBottom: '18px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#991b1b', lineHeight: 1.5 }}>
            <strong>CRITICAL WARNING:</strong> You are about to permanently delete <strong>"{trip.name}"</strong>.
            This action cannot be undone. All recorded expenses, group bookings, side quests, audit records, ledger entries, and final settlements will be permanently erased.
          </p>
        </div>

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
              border: `2px solid ${isMatch ? '#dc2626' : 'var(--color-border)'}`,
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: '#ffffff'
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
            onClick={onClose}
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
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: isMatch && !isDeleting ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isMatch ? '0 2px 8px rgba(220, 38, 38, 0.25)' : 'none'
            }}
          >
            <Trash2 size={16} />
            {isDeleting ? 'Deleting Trip...' : 'I Understand, Delete This Trip'}
          </button>
        </div>
      </div>
    </div>
  );
};
