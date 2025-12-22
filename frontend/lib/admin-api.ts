/**
 * Admin API client for NuuMee admin panel.
 * Uses X-Admin-Password header for authentication.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE}/api/v1`;

const ADMIN_PASSWORD_KEY = 'nuumee_admin_password';

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
  }
}

export function getStoredPassword(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_PASSWORD_KEY);
}

export function setStoredPassword(password: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_PASSWORD_KEY, password);
}

export function clearStoredPassword(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_PASSWORD_KEY);
}

interface AdminApiOptions extends RequestInit {
  password?: string;
}

async function adminRequest<T>(
  endpoint: string,
  options: AdminApiOptions = {}
): Promise<T> {
  const { password, headers: customHeaders, ...rest } = options;

  const adminPassword = password || getStoredPassword();

  if (!adminPassword) {
    throw new AdminApiError('Admin password required', 401);
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Admin-Password': adminPassword,
    ...customHeaders,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers,
    ...rest,
  });

  if (response.status === 401) {
    clearStoredPassword();
    throw new AdminApiError('Invalid admin password', 401);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    const errorMessage = typeof errorData.detail === 'string'
      ? errorData.detail
      : 'Request failed';
    throw new AdminApiError(errorMessage, response.status);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ==================== Types ====================

export interface DashboardStats {
  users: { total: number; new_today: number; new_this_week: number };
  jobs: { total: number; today: number; failed: number; processing: number };
  revenue: { this_month: number; mrr: number };
  promos: { active: number; total_redemptions: number };
}

export interface AdminUser {
  uid: string;
  email: string;
  display_name: string | null;
  tier: 'free' | 'pro' | 'business';
  credits: number;
  created_at: string;
  last_active: string | null;
  jobs_count: number;
}

export interface AdminUserDetail extends AdminUser {
  subscription: {
    id: string;
    status: string;
    plan: string;
    current_period_end: string;
  } | null;
  recent_jobs: AdminJob[];
  recent_transactions: CreditTransaction[];
  photo_url: string | null;
}

export interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
}

export interface AdminJob {
  id: string;
  user_id: string;
  user_email: string | null;
  type: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  credits_used: number;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
  wavespeed_request_id: string | null;
}

export interface AdminJobDetail extends AdminJob {
  input_path: string | null;
  output_path: string | null;
  error_details: string | null;
  metadata: Record<string, unknown> | null;
}

export interface PaymentStats {
  mrr: number;
  total_revenue: number;
  subscriber_count: number;
  credits_purchased_today: number;
  credits_purchased_this_month: number;
}

export interface PaymentTransaction {
  id: string;
  user_id: string | null;
  user_email: string | null;
  type: 'subscription' | 'credit_purchase' | 'refund';
  amount: number;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  created_at: string;
}

export interface PaymentsResponse {
  stats: PaymentStats;
  recent_transactions: PaymentTransaction[];
}

export interface PromoCode {
  id: string;
  code: string;
  credits: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}

// ==================== API Functions ====================

export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    await adminRequest('/admin/health', { password });
    setStoredPassword(password);
    return true;
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 401) {
      return false;
    }
    throw error;
  }
}

export async function getAdminHealth(): Promise<{ status: string; admin: boolean; timestamp: string }> {
  return adminRequest('/admin/health');
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return adminRequest('/admin/stats');
}

export async function getUsers(params?: {
  page?: number;
  per_page?: number;
  search?: string
}): Promise<PaginatedResponse<AdminUser>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.per_page) searchParams.set('per_page', String(params.per_page));
  if (params?.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  return adminRequest(`/admin/users${query ? `?${query}` : ''}`);
}

export async function getUser(uid: string): Promise<AdminUserDetail> {
  return adminRequest(`/admin/users/${uid}`);
}

export async function adjustCredits(
  uid: string,
  amount: number,
  reason?: string
): Promise<{ success: boolean; new_balance: number; transaction_id: string }> {
  return adminRequest(`/admin/users/${uid}/credits`, {
    method: 'POST',
    body: JSON.stringify({ amount, reason }),
  });
}

export async function getJobs(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  user_id?: string;
}): Promise<PaginatedResponse<AdminJob>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.per_page) searchParams.set('per_page', String(params.per_page));
  if (params?.status) searchParams.set('status', params.status);
  if (params?.user_id) searchParams.set('user_id', params.user_id);

  const query = searchParams.toString();
  return adminRequest(`/admin/jobs${query ? `?${query}` : ''}`);
}

export async function getJob(jobId: string): Promise<AdminJobDetail> {
  return adminRequest(`/admin/jobs/${jobId}`);
}

export async function retryJob(
  jobId: string,
  note?: string
): Promise<{ success: boolean; job_id: string; new_status: string }> {
  return adminRequest(`/admin/jobs/${jobId}/retry`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
}

export interface RecoverJobResponse {
  success: boolean;
  job_id: string;
  action: 'recovered' | 'failed' | 'already_complete' | 'still_processing';
  message: string;
}

export async function recoverJob(jobId: string): Promise<RecoverJobResponse> {
  return adminRequest(`/admin/jobs/${jobId}/replay-webhook`, {
    method: 'POST',
  });
}

export async function getPayments(limit?: number): Promise<PaymentsResponse> {
  const query = limit ? `?limit=${limit}` : '';
  return adminRequest(`/admin/payments${query}`);
}

export async function getPromos(): Promise<PromoCode[]> {
  return adminRequest('/admin/promos');
}

export async function createPromo(data: {
  code: string;
  credits: number;
  max_uses?: number | null;
  expires_at?: string | null;
}): Promise<PromoCode> {
  return adminRequest('/admin/promos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deletePromo(promoId: string): Promise<{ success: boolean; message: string }> {
  return adminRequest(`/admin/promos/${promoId}`, {
    method: 'DELETE',
  });
}
