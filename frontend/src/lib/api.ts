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
  free_data?: any;
  pdf_ready?: boolean;
  pdf_sent_at?: string;
  completed_at?: string;
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
  package: 'starter' | 'pro' | 'expert';
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
