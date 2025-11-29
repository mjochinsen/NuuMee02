/**
 * API client for NuuMee backend.
 * Automatically attaches Firebase ID token to requests.
 */
import { getIdToken } from './firebase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE}/api/v1`;

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...rest } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Attach auth token if available and not skipped
  if (!skipAuth) {
    const token = await getIdToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers,
    ...rest,
  });

  // Handle 401 - token invalid/expired (NOT 403 - see LESSONS_LEARNED.md)
  if (response.status === 401) {
    // Token invalid or expired - let AuthProvider handle re-auth
    throw new ApiError('Unauthorized', 401);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    // Handle FastAPI validation errors which return detail as array of objects
    let errorMessage = 'Request failed';
    if (typeof errorData.detail === 'string') {
      errorMessage = errorData.detail;
    } else if (Array.isArray(errorData.detail)) {
      // FastAPI validation error format: [{ loc: [...], msg: "...", type: "..." }]
      errorMessage = errorData.detail.map((e: { msg?: string }) => e.msg || 'Validation error').join(', ');
    } else if (errorData.detail && typeof errorData.detail === 'object') {
      errorMessage = JSON.stringify(errorData.detail);
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json();
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Auth endpoints
export interface UserProfile {
  uid: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  credits_balance: number;
  subscription_tier: string;
  referral_code: string;
  created_at: string;
  last_login_at: string;
}

export interface RegisterResponse {
  uid: string;
  email: string;
  credits_balance: number;
  referral_code: string;
  message: string;
}

export async function registerUser(idToken: string): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
    skipAuth: true, // We're passing token in body
  });
}

export async function loginUser(idToken: string): Promise<UserProfile> {
  return apiRequest<UserProfile>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
    skipAuth: true, // We're passing token in body
  });
}

export async function getMe(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/auth/me');
}

export async function checkHealth(): Promise<{ status: string; service: string }> {
  // Health endpoint is at root level, not under /api/v1
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}

// Credits endpoints
export interface CreditPackage {
  id: string;
  name: string;
  price_cents: number;
  credits: number;
  stripe_price_id: string;
  bonus_percent: number;
}

export interface CreditBalance {
  balance: number;
  last_updated: string | null;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export async function getCreditPackages(): Promise<CreditPackage[]> {
  return apiRequest<CreditPackage[]>('/credits/packages', { skipAuth: true });
}

export async function getCreditBalance(): Promise<CreditBalance> {
  return apiRequest<CreditBalance>('/credits/balance');
}

export async function createCheckoutSession(packageId: string): Promise<CheckoutResponse> {
  return apiRequest<CheckoutResponse>('/credits/checkout', {
    method: 'POST',
    body: JSON.stringify({ package_id: packageId }),
  });
}
