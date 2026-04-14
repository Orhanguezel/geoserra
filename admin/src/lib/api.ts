import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8095';

export const api = axios.create({
  baseURL: `${BASE}/api/v1`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ── Analyses ──────────────────────────────────────────────────────────────────
export type AnalysisStatus = 'free' | 'pending' | 'processing' | 'completed' | 'failed';
export type PackageSlug = 'free' | 'starter' | 'pro' | 'expert';

export interface Analysis {
  id: string;
  url: string;
  email: string;
  status: AnalysisStatus;
  package_slug: PackageSlug;
  payment_provider: string | null;
  payment_id: string | null;
  pdf_path: string | null;
  pdf_sent_at: string | null;
  free_data: Record<string, unknown> | null;
  full_data: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface AnalysisListParams {
  search?: string;
  status?: AnalysisStatus;
  package_slug?: PackageSlug;
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
}

export const analysesApi = {
  list: (params?: AnalysisListParams) =>
    api.get<Analysis[]>('/admin/analyses', { params }),
  get: (id: string) => api.get<Analysis>(`/admin/analyses/${id}`),
  update: (id: string, data: { admin_notes?: string }) =>
    api.patch(`/admin/analyses/${id}`, data),
  resendPdf: (id: string) =>
    api.post(`/admin/analyses/${id}/resend-pdf`),
  rerun: (id: string) =>
    api.post(`/admin/analyses/${id}/rerun`),
};

// ── Implementation Requests ───────────────────────────────────────────────────
export type ImplStatus = 'pending' | 'in_progress' | 'done';

export interface ImplRequest {
  id: string;
  email: string;
  domain: string;
  package_slug: string;
  notes: string | null;
  status: ImplStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImplListParams {
  status?: ImplStatus;
  limit?: number;
  offset?: number;
}

export const implApi = {
  list: (params?: ImplListParams) =>
    api.get<ImplRequest[]>('/admin/implementation', { params }),
  get: (id: string) => api.get<ImplRequest>(`/admin/implementation/${id}`),
  update: (id: string, data: { status?: ImplStatus; admin_notes?: string }) =>
    api.patch(`/admin/implementation/${id}`, data),
};

// ── Stats ─────────────────────────────────────────────────────────────────────
export interface AdminStats {
  total_analyses: number;
  completed_analyses: number;
  failed_analyses: number;
  pending_analyses: number;
  paid_analyses: number;
  pending_implementations: number;
  total_implementations: number;
}

export const statsApi = {
  get: () => api.get<AdminStats>('/admin/stats'),
};

// ── Settings ────────────────────────────────────────────────────────────────
export interface SiteSettingsPayload {
  starter_price?: string;
  pro_price?: string;
  expert_price?: string;
  site_name?: string;
  contact_email?: string;
}

// ── Assets ────────────────────────────────────────────────────────────────────
export interface AssetItem {
  name: string;
  url: string;
  exists: boolean;
  size: number;
  updated_at: string | null;
}

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8095';

export const assetsAdminApi = {
  list: () => api.get<AssetItem[]>('/admin/assets'),
  upload: (name: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/admin/assets/upload?name=${encodeURIComponent(name)}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  /** Backend base URL for direct asset preview (bypasses Next.js proxy) */
  previewUrl: (path: string) => `${BACKEND_BASE}${path}`,
};

export const settingsApi = {
  get: () => api.get<Record<string, unknown>>('/admin/site-settings'),
  updateSiteSettings: (data: SiteSettingsPayload) =>
    api.put('/admin/site-settings', data),
  bulkUpsert: (items: { key: string; value: unknown }[]) =>
    api.post('/admin/site-settings/bulk-upsert', { items }),
  sendSmtpTest: (email: string) =>
    api.post('/admin/site-settings/test-email', { email }),
  changePassword: (current_password: string, new_password: string) =>
    api.put('/auth/change-password', { current_password, new_password }),
};
