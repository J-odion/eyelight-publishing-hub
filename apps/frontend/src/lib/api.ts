import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ────────────────────────────────────────────────────
export const AuthApi = {
  login: (data: { email: string; passwordPlain: string }) =>
    api.post('/auth/login', data),
};

// ─── Author Onboarding ───────────────────────────────────────
export const AuthorApi = {
  submitManuscriptData: (data: any) =>
    api.post('/users/submit-manuscript', data),
  finalizeAccount: (data: { email: string; passwordPlain: string }) =>
    api.post('/users/finalize-account', data),
  getPortal: () => api.get('/users/portal'),
};

// ─── Leads ───────────────────────────────────────────────────
export const LeadsApi = {
  submitNewsletter: (data: { name: string; email: string }) =>
    api.post('/leads', { ...data, type: 'Newsletter' }),
  bookConsultation: (data: any) =>
    api.post('/leads', { ...data, type: 'Consultation' }),
  submitInquiry: (data: any) =>
    api.post('/leads', { ...data, type: 'LeadMagnet' }),
  getAllLeads: () => api.get('/leads'),
};

// ─── Payments ────────────────────────────────────────────────
export const PaymentsApi = {
  initialize: (data: { amount: number; purpose: string; projectId?: string; userId: string; email: string }) =>
    api.post('/payments/initialize', data),
  verify: (reference: string) =>
    api.get(`/payments/verify/${reference}`),
};

// ─── Admin: Email Campaigns ──────────────────────────────────
export const CrmApi = {
  getCampaigns: () => api.get('/email'),
  createCampaign: (data: any) => api.post('/email', data),
};

// ─── Admin: Production Board ─────────────────────────────────
export const ProjectsApi = {
  getAll: () => api.get('/users/projects'),
  updateStatus: (id: string, status: string) =>
    api.patch(`/users/projects/${id}/status`, { status }),
};

// ─── Admin: Author Directory & Profiles ──────────────────────
export const AuthorsApi = {
  getAll: () => api.get('/users/authors'),
  getProfile: (id: string) => api.get(`/users/authors/${id}`),
};

// ─── Books Catalogue ─────────────────────────────────────────
export const BooksApi = {
  getAll: () => api.get('/books'),
  getOne: (id: string) => api.get(`/books/${id}`),
  create: (data: any) => api.post('/books', data),
  update: (id: string, data: any) => api.patch(`/books/${id}`, data),
  remove: (id: string) => api.delete(`/books/${id}`),
};

// ─── Events ──────────────────────────────────────────────────
export const EventsApi = {
  getAll: () => api.get('/events'),
  getOne: (id: string) => api.get(`/events/${id}`),
  register: (id: string, data: { name: string; email: string; phone: string }) =>
    api.post(`/events/${id}/register`, data),
  create: (data: any) => api.post('/events', data),
};

// ─── Referrals ───────────────────────────────────────────────
export const ReferralsApi = {
  getMyInfo: () => api.get('/referrals/mine'),
  track: (data: { referralCode: string; referredEmail: string; referredUserId: string }) =>
    api.post('/referrals/track', data),
  getAll: () => api.get('/referrals'),
};

// ─── Press / Media Room ──────────────────────────────────────
export const PressApi = {
  getAll: (type?: string) => api.get('/press', { params: type ? { type } : {} }),
  create: (data: any) => api.post('/press', data),
  update: (id: string, data: any) => api.patch(`/press/${id}`, data),
  remove: (id: string) => api.delete(`/press/${id}`),
};
