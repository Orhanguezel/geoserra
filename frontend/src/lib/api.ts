import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8095/api';

export const api = axios.create({
  baseURL: `${API_BASE}/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

// Server-side fetch (SSR/RSC)
export async function serverFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/v1${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

// ─── Analiz ────────────────────────────────────────────────────────────────

export interface FreeAnalysisResponse {
  analysis_id: string;
  status: string;
  message: string;
}

export interface AnalysisStatus {
  id: string;
  status: 'free' | 'pending' | 'processing' | 'completed' | 'failed';
  domain: string;
  package_slug: string;
  free_data?: {
    geo_score?: number;
    performance_score?: number | null;
    seo_score?: number | null;
    top_issues?: string[];
    [key: string]: unknown;
  };
  full_data?: {
    geo_score?: number;
    performance?: {
      score?: number;
      [key: string]: unknown;
    };
    lighthouse?: {
      categories?: {
        performance?: { score?: number };
        seo?: { score?: number };
      };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  pdf_ready?: boolean;
  pdf_sent_at?: string;
  completed_at?: string;
  created_at?: string;
}

export interface PaidAnalysisResponse {
  analysis_id: string;
  client_secret?: string;     // Stripe
  paypal_order_id?: string;   // PayPal
  payment_provider: 'stripe' | 'paypal';
  amount: number;
  currency: string;
  package: any;
}

export async function startFreeAnalysis(url: string, email: string): Promise<FreeAnalysisResponse> {
  const res = await api.post('/analyze/free', { url, email });
  return res.data;
}

export async function startPaidAnalysis(data: {
  url: string;
  email: string;
  package: 'starter' | 'pro' | 'expert' | 'monitor' | 'growth' | 'agency';
  payment_provider: 'stripe' | 'paypal';
  locale?: string;
}): Promise<PaidAnalysisResponse> {
  const res = await api.post('/analyze/paid', data);
  return res.data;
}

export async function getAnalysisStatus(id: string): Promise<AnalysisStatus> {
  const res = await api.get(`/analyze/${id}/status`);
  return res.data;
}

export async function getCurrencyRates(): Promise<{ USD: 1; TRY: number; EUR: number }> {
  const res = await api.get('/currency/rates');
  return res.data;
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  email_verified: number;
  is_active: number;
  role: string;
  avatar_url?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export async function authGoogleLogin(id_token: string): Promise<AuthResponse> {
  const res = await api.post('/auth/google', { id_token }, { withCredentials: true });
  return res.data;
}

export async function authLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post('/auth/login', { email, password }, { withCredentials: true });
  return res.data;
}

export async function authSignup(data: {
  email: string;
  password: string;
  full_name?: string;
  rules_accepted: true;
}): Promise<AuthResponse> {
  const res = await api.post('/auth/signup', data, { withCredentials: true });
  return res.data;
}

export async function authMe(): Promise<{ user: AuthUser }> {
  const res = await api.get('/auth/user', { withCredentials: true });
  return res.data;
}

export async function authLogout(): Promise<void> {
  await api.post('/auth/logout', {}, { withCredentials: true });
}

export async function submitImplementationRequest(data: {
  email: string;
  domain: string;
  package_slug?: string;
  notes?: string;
  analysis_id?: string;
  cpanel_host?: string;
  cpanel_user?: string;
  cpanel_pass?: string;
}): Promise<{ ok: boolean; id: string }> {
  const res = await api.post('/implementation/request', data);
  return res.data;
}

// ─── Kullanıcı Analizleri ────────────────────────────────────────────────────
export interface MyAnalysis {
  id: string;
  url: string;
  domain: string;
  status: 'free' | 'pending' | 'processing' | 'completed' | 'failed';
  package_slug: 'free' | 'starter' | 'pro' | 'expert';
  geo_score: number | null;
  performance_score: number | null;
  pdf_ready: boolean;
  created_at: string;
  completed_at: string | null;
}

export async function getMyAnalyses(page = 1): Promise<{
  items: MyAnalysis[];
  total: number;
  page: number;
  pages: number;
}> {
  const res = await api.get(`/analyses/mine?page=${page}`, { withCredentials: true });
  return res.data;
}

// ─── Şifre Sıfırlama ─────────────────────────────────────────────────────────
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  const res = await api.post('/auth/reset-password', { token, password });
  return res.data;
}
