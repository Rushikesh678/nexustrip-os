const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('tripledger_token');
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `HTTP error! Status: ${res.status}`);
  }
  return data;
};

export const api = {
  // Auth
  register: (userData) => fetch(`${API_BASE_URL}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(userData) }).then(handleResponse),
  login: (credentials) => fetch(`${API_BASE_URL}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(credentials) }).then(handleResponse),
  googleLogin: (credential) => fetch(`${API_BASE_URL}/auth/google`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ credential }) }).then(handleResponse),
  getMe: () => fetch(`${API_BASE_URL}/auth/me`, { headers: getHeaders() }).then(handleResponse),
  getMembers: () => fetch(`${API_BASE_URL}/auth/members`, { headers: getHeaders() }).then(handleResponse),

  // Trips
  getTrips: () => fetch(`${API_BASE_URL}/trips`, { headers: getHeaders() }).then(handleResponse),
  getTripById: (tripId) => fetch(`${API_BASE_URL}/trips/${tripId}`, { headers: getHeaders() }).then(handleResponse),
  createTrip: (tripData) => fetch(`${API_BASE_URL}/trips`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(tripData) }).then(handleResponse),
  joinTripByCode: (inviteCode) => fetch(`${API_BASE_URL}/trips/join`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ inviteCode }) }).then(handleResponse),
  updateTrip: (tripId, data) => fetch(`${API_BASE_URL}/trips/${tripId}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  deleteTrip: (tripId) => fetch(`${API_BASE_URL}/trips/${tripId}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Participants
  getParticipants: (tripId) => fetch(`${API_BASE_URL}/trips/${tripId}/participants`, { headers: getHeaders() }).then(handleResponse),
  addParticipant: (tripId, data) => fetch(`${API_BASE_URL}/trips/${tripId}/participants`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  updateParticipant: (tripId, pid, data) => fetch(`${API_BASE_URL}/trips/${tripId}/participants/${pid}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  departParticipant: (tripId, pid, data) => fetch(`${API_BASE_URL}/trips/${tripId}/participants/${pid}/depart`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  removeParticipant: (tripId, pid) => fetch(`${API_BASE_URL}/trips/${tripId}/participants/${pid}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Bookings
  getBookings: (tripId) => fetch(`${API_BASE_URL}/trips/${tripId}/bookings`, { headers: getHeaders() }).then(handleResponse),
  createBooking: (tripId, data) => fetch(`${API_BASE_URL}/trips/${tripId}/bookings`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  updateBooking: (tripId, bid, data) => fetch(`${API_BASE_URL}/trips/${tripId}/bookings/${bid}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  cancelBooking: (tripId, bid, data) => fetch(`${API_BASE_URL}/trips/${tripId}/bookings/${bid}`, { method: 'DELETE', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  deleteBooking: (tripId, bid) => fetch(`${API_BASE_URL}/trips/${tripId}/bookings/${bid}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Itinerary
  getItinerary: (tripId) => fetch(`${API_BASE_URL}/trips/${tripId}/itinerary`, { headers: getHeaders() }).then(handleResponse),
  createItineraryBlock: (tripId, data) => fetch(`${API_BASE_URL}/trips/${tripId}/itinerary`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  updateItineraryBlock: (tripId, blockId, data) => fetch(`${API_BASE_URL}/trips/${tripId}/itinerary/${blockId}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  deleteItineraryBlock: (tripId, blockId) => fetch(`${API_BASE_URL}/trips/${tripId}/itinerary/${blockId}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  autoGenerateItinerary: (tripId) => fetch(`${API_BASE_URL}/trips/${tripId}/itinerary/auto-generate`, { method: 'POST', headers: getHeaders() }).then(handleResponse),

  // Expenses
  getExpenses: (tripId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE_URL}/trips/${tripId}/expenses?${query}`, { headers: getHeaders() }).then(handleResponse);
  },
  createExpense: (tripId, data) => fetch(`${API_BASE_URL}/trips/${tripId}/expenses`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  updateExpense: (tripId, eid, data) => fetch(`${API_BASE_URL}/trips/${tripId}/expenses/${eid}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  deleteExpense: (tripId, eid) => fetch(`${API_BASE_URL}/trips/${tripId}/expenses/${eid}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  parseReceipt: (formData) => fetch(`${API_BASE_URL}/receipts/parse-receipt`, { method: 'POST', headers: getHeaders(true), body: formData }).then(handleResponse),

  // Payments & Refunds
  getPayments: (tripId) => fetch(`${API_BASE_URL}/trips/${tripId}/payments`, { headers: getHeaders() }).then(handleResponse),
  recordPayment: (tripId, data) => fetch(`${API_BASE_URL}/trips/${tripId}/payments`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  disputePayment: (tripId, pid, data) => fetch(`${API_BASE_URL}/trips/${tripId}/payments/${pid}/dispute`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  getRefunds: (tripId) => fetch(`${API_BASE_URL}/trips/${tripId}/refunds`, { headers: getHeaders() }).then(handleResponse),
  issueRefund: (tripId, data) => fetch(`${API_BASE_URL}/trips/${tripId}/refunds`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),

  // Settlement
  getSettlement: (tripId) => fetch(`${API_BASE_URL}/trips/${tripId}/settlement`, { headers: getHeaders() }).then(handleResponse),
  finalizeSettlement: (tripId) => fetch(`${API_BASE_URL}/trips/${tripId}/settlement/finalize`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  recordSettlementPayment: (tripId, data) => fetch(`${API_BASE_URL}/trips/${tripId}/settlement/record-payment`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),

  // Ledger & Audit & Reports
  getLedger: (tripId) => fetch(`${API_BASE_URL}/trips/${tripId}/ledger`, { headers: getHeaders() }).then(handleResponse),
  getAuditLogs: (tripId) => fetch(`${API_BASE_URL}/trips/${tripId}/audit`, { headers: getHeaders() }).then(handleResponse),
  getReport: (tripId) => fetch(`${API_BASE_URL}/trips/${tripId}/report`, { headers: getHeaders() }).then(handleResponse),
  downloadReportPDF: async (tripId, tripName = 'Trip') => {
    const res = await fetch(`${API_BASE_URL}/trips/${tripId}/report/pdf`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      let errMsg = `Failed to download PDF report (${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson.message) errMsg = errJson.message;
      } catch (e) {
        try {
          const errText = await res.text();
          if (errText) errMsg = errText;
        } catch (e2) {}
      }
      throw new Error(errMsg);
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = (tripName || 'Trip').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `TripLedger_${safeName}_Statement.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 1500);
    return true;
  },
  downloadReportPDFUrl: (tripId) => {
    const token = localStorage.getItem('tripledger_token');
    return `${API_BASE_URL}/trips/${tripId}/report/pdf${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  // AI Savings Recommendations
  getSavingsRecommendations: (tripId, location = null) => {
    const query = location ? `?location=${encodeURIComponent(location)}` : '';
    return fetch(`${API_BASE_URL}/trips/${tripId}/recommendations${query}`, { headers: getHeaders() }).then(handleResponse);
  },
  refreshSavingsRecommendations: (tripId, location = null) => {
    return fetch(`${API_BASE_URL}/trips/${tripId}/recommendations/refresh`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ location })
    }).then(handleResponse);
  },

  // AI Weather Digital Twin
  getDigitalTwinWeather: (tripId, location = null, refresh = false) => {
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (refresh) params.append('refresh', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetch(`${API_BASE_URL}/trips/${tripId}/digital-twin/weather${query}`, { headers: getHeaders() }).then(handleResponse);
  },
  getDigitalTwinSocial: (tripId, location = null) => {
    const query = location ? `?location=${encodeURIComponent(location)}` : '';
    return fetch(`${API_BASE_URL}/trips/${tripId}/digital-twin/social${query}`, { headers: getHeaders() }).then(handleResponse);
  },
  getDigitalTwinImpact: (tripId) => {
    return fetch(`${API_BASE_URL}/trips/${tripId}/digital-twin/impact`, { headers: getHeaders() }).then(handleResponse);
  },
  simulateDigitalTwin: (tripId, scenario) => {
    return fetch(`${API_BASE_URL}/trips/${tripId}/digital-twin/simulate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ scenario })
    }).then(handleResponse);
  }
};
