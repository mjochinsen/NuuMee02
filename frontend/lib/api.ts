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

// Upload endpoints
export interface SignedUrlRequest {
  file_type: 'image' | 'video';
  file_name: string;
  content_type: string;
}

export interface SignedUrlResponse {
  upload_url: string;
  file_path: string;
  bucket_name: string;
  expires_at: string;
}

export async function getSignedUrl(request: SignedUrlRequest): Promise<SignedUrlResponse> {
  return apiRequest<SignedUrlResponse>('/upload/signed-url', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Upload a file to GCS using a signed URL with progress tracking
 */
export async function uploadToGCS(
  file: File,
  signedUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    xhr.open('PUT', signedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

// Jobs endpoints
export type JobStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
export type JobType = 'animate' | 'extend' | 'upscale' | 'foley';
export type Resolution = '480p' | '720p';

export interface CreateJobRequest {
  job_type?: JobType;
  reference_image_path: string;
  motion_video_path: string;
  resolution?: Resolution;
  seed?: number | null;
}

export interface JobResponse {
  id: string;
  user_id: string;
  job_type: JobType;
  status: JobStatus;
  reference_image_path: string;
  motion_video_path: string;
  resolution: Resolution;
  seed: number | null;
  credits_charged: number;
  wavespeed_request_id: string | null;
  output_video_path: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface JobListResponse {
  jobs: JobResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreditCostResponse {
  job_type: JobType;
  resolution: Resolution;
  estimated_credits: number;
  estimated_duration_seconds: number | null;
}

export async function createJob(request: CreateJobRequest): Promise<JobResponse> {
  return apiRequest<JobResponse>('/jobs', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getJobs(
  page: number = 1,
  pageSize: number = 20,
  status?: JobStatus
): Promise<JobListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  if (status) {
    params.append('status', status);
  }
  return apiRequest<JobListResponse>(`/jobs?${params.toString()}`);
}

export async function getJob(jobId: string): Promise<JobResponse> {
  return apiRequest<JobResponse>(`/jobs/${jobId}`);
}

export async function estimateCost(
  jobType: JobType = 'animate',
  resolution: Resolution = '480p',
  durationSeconds: number = 10
): Promise<CreditCostResponse> {
  const params = new URLSearchParams({
    job_type: jobType,
    resolution: resolution,
    duration_seconds: durationSeconds.toString(),
  });
  return apiRequest<CreditCostResponse>(`/jobs/cost?${params.toString()}`, { skipAuth: true });
}

// Job output download
export interface JobOutputResponse {
  job_id: string;
  download_url: string;
  expires_in_seconds: number;
  filename: string;
}

export async function getJobOutput(jobId: string): Promise<JobOutputResponse> {
  return apiRequest<JobOutputResponse>(`/jobs/${jobId}/output`);
}

// Subscription endpoints
export type SubscriptionTier = 'creator' | 'studio';
export type SubscriptionStatusType = 'active' | 'canceled' | 'past_due' | 'unpaid';

export interface SubscriptionTierInfo {
  tier: SubscriptionTier;
  name: string;
  price_cents: number;
  monthly_credits: number;
  credits_rollover_cap: number;
}

export interface SubscriptionResponse {
  subscription_id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatusType;
  stripe_subscription_id: string;
  monthly_credits: number;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

export interface CreateSubscriptionResponse {
  checkout_url: string;
  session_id: string;
}

export interface CancelSubscriptionResponse {
  subscription_id: string;
  status: SubscriptionStatusType;
  cancel_at_period_end: boolean;
  current_period_end: string;
  message: string;
}

export async function getSubscriptionTiers(): Promise<SubscriptionTierInfo[]> {
  return apiRequest<SubscriptionTierInfo[]>('/subscriptions/tiers', { skipAuth: true });
}

export async function getCurrentSubscription(): Promise<SubscriptionResponse | null> {
  return apiRequest<SubscriptionResponse | null>('/subscriptions/current');
}

export async function createSubscription(tier: SubscriptionTier): Promise<CreateSubscriptionResponse> {
  return apiRequest<CreateSubscriptionResponse>('/subscriptions/create', {
    method: 'POST',
    body: JSON.stringify({ tier }),
  });
}

export async function cancelSubscription(): Promise<CancelSubscriptionResponse> {
  return apiRequest<CancelSubscriptionResponse>('/subscriptions/cancel', {
    method: 'POST',
  });
}
