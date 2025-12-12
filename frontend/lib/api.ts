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
    } else {
      console.warn(`[API] No auth token available for ${endpoint} - user may not be logged in`);
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
  user_id: string;
  email: string;
  email_verified: boolean;
  display_name: string | null;
  avatar_url: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  credits_balance: number;
  subscription_tier: string;
  billing_period: string | null;  // "month" or "year", null for free tier
  referral_code: string;
  referred_by: string | null;
  is_affiliate: boolean;
  affiliate_status: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterResponse {
  message: string;
  user: UserProfile;
}

export interface LoginResponse {
  message: string;
  user: UserProfile;
}

export async function registerUser(idToken: string): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
    skipAuth: true, // We're passing token in body
  });
}

export async function loginUser(idToken: string): Promise<UserProfile> {
  const response = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
    skipAuth: true, // We're passing token in body
  });
  return response.user;
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
  // ANIMATE job fields
  reference_image_path?: string;
  motion_video_path?: string;
  // EXTEND/UPSCALE job fields
  source_job_id?: string;
  input_video_path?: string;
  extension_prompt?: string;
  // Common fields
  resolution?: Resolution;
  seed?: number | null;
}

export interface JobResponse {
  id: string;
  short_id: string | null;
  share_url: string | null;
  user_id: string;
  job_type: JobType;
  status: JobStatus;
  // ANIMATE fields
  reference_image_path: string | null;
  motion_video_path: string | null;
  // EXTEND/UPSCALE fields
  source_job_id: string | null;
  input_video_path: string | null;
  extension_prompt: string | null;
  // Common fields
  resolution: Resolution;
  seed: number | null;
  credits_charged: number;
  wavespeed_request_id: string | null;
  output_video_path: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  view_count: number;
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

// Job thumbnails (signed URLs for input and output files)
export interface JobThumbnailsResponse {
  job_id: string;
  reference_image_url: string | null;
  motion_video_url: string | null;
  input_video_url: string | null;  // For EXTEND/UPSCALE jobs
  output_video_url: string | null;
}

export async function getJobThumbnails(jobId: string): Promise<JobThumbnailsResponse> {
  return apiRequest<JobThumbnailsResponse>(`/jobs/${jobId}/thumbnails`);
}

// Delete job
export interface DeleteJobResponse {
  message: string;
  job_id: string;
}

export async function deleteJob(jobId: string): Promise<DeleteJobResponse> {
  return apiRequest<DeleteJobResponse>(`/jobs/${jobId}`, {
    method: 'DELETE',
  });
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

export async function createSubscription(tier: SubscriptionTier, annual: boolean = false, founding: boolean = false): Promise<CreateSubscriptionResponse> {
  return apiRequest<CreateSubscriptionResponse>('/subscriptions/create', {
    method: 'POST',
    body: JSON.stringify({ tier, annual, founding }),
  });
}

export async function cancelSubscription(): Promise<CancelSubscriptionResponse> {
  return apiRequest<CancelSubscriptionResponse>('/subscriptions/cancel', {
    method: 'POST',
  });
}

export interface UpgradeSubscriptionResponse {
  subscription_id: string;
  old_tier: SubscriptionTier;
  new_tier: SubscriptionTier;
  message: string;
  credits_added: number;
}

export async function upgradeSubscription(newTier: SubscriptionTier, annual: boolean = false): Promise<UpgradeSubscriptionResponse> {
  return apiRequest<UpgradeSubscriptionResponse>('/subscriptions/upgrade', {
    method: 'POST',
    body: JSON.stringify({ new_tier: newTier, annual }),
  });
}

// Referral endpoints
export interface ReferralStats {
  total_referrals: number;
  converted_referrals: number;
  total_credits_earned: number;
}

export interface ReferralCodeResponse {
  referral_code: string;
  share_url: string;
  stats: ReferralStats;
}

export interface ReferralApplyResponse {
  credits_granted: number;
  message: string;
  referral_code: string;
}

export async function getReferralCode(): Promise<ReferralCodeResponse> {
  return apiRequest<ReferralCodeResponse>('/referral/code');
}

export async function applyReferralCode(code: string): Promise<ReferralApplyResponse> {
  return apiRequest<ReferralApplyResponse>('/referral/apply', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

/**
 * Apply referral code in the background with keepalive.
 * IMPORTANT: Pass the token directly - the fetch must start immediately (synchronously).
 * The keepalive option ensures the request completes even if the page navigates away.
 */
export function applyReferralCodeWithToken(code: string, token: string): void {
  if (!token) {
    console.warn('[Referral] No auth token provided for background referral apply');
    return;
  }

  console.log('[Referral] Sending background request with keepalive...');

  // Start fetch immediately (synchronous) - keepalive ensures it completes during navigation
  fetch(`${API_URL}/referral/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
    keepalive: true,
  }).then(response => {
    if (response.ok) {
      console.log('[Referral] Background referral code applied successfully');
    } else {
      console.warn('[Referral] Background referral apply failed:', response.status);
    }
  }).catch(err => {
    console.warn('[Referral] Background referral apply error:', err);
  });
}

// Affiliate endpoints
export type AffiliatePlatformType = 'youtube' | 'instagram' | 'tiktok' | 'blog' | 'twitter' | 'other';
export type AffiliateStatusType = 'pending' | 'approved' | 'rejected' | 'suspended';
export type PayoutStatusType = 'pending' | 'processing' | 'completed' | 'failed';

export interface AffiliateApplyRequest {
  name: string;
  email: string;
  platform_url: string;
  platform_type: AffiliatePlatformType;
  promotion_plan: string;
  paypal_email: string;
  audience_size: number;
}

export interface AffiliateApplyResponse {
  affiliate_id: string;
  status: AffiliateStatusType;
  message: string;
}

export interface AffiliateStats {
  total_clicks: number;
  total_signups: number;
  total_conversions: number;
  commission_earned: number;
  commission_pending: number;
  commission_paid: number;
}

export interface AffiliateResponse {
  affiliate_id: string;
  user_id: string;
  status: AffiliateStatusType;
  affiliate_code: string | null;
  stats: AffiliateStats;
  applied_at: string;
  approved_at: string | null;
}

export interface PayoutResponse {
  payout_id: string;
  amount: number;
  status: PayoutStatusType;
  message: string;
}

export async function applyForAffiliate(request: AffiliateApplyRequest): Promise<AffiliateApplyResponse> {
  return apiRequest<AffiliateApplyResponse>('/affiliate/apply', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getAffiliateStats(): Promise<AffiliateResponse> {
  return apiRequest<AffiliateResponse>('/affiliate/stats');
}

export async function requestAffiliatePayout(amount: number): Promise<PayoutResponse> {
  return apiRequest<PayoutResponse>('/affiliate/payout', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

// Status/Health endpoints
export type ServiceStatusType = 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance';
export type SystemStatusType = 'operational' | 'partial_outage' | 'major_outage' | 'maintenance';

export interface ServiceHealth {
  name: string;
  status: ServiceStatusType;
  latency_ms: number | null;
  message: string | null;
  last_checked: string;
}

export interface SystemHealthResponse {
  status: SystemStatusType;
  services: ServiceHealth[];
  uptime_percentage: number;
  last_incident: string | null;
  last_incident_date: string | null;
  checked_at: string;
}

export async function getSystemStatus(): Promise<SystemHealthResponse> {
  return apiRequest<SystemHealthResponse>('/status', { skipAuth: true });
}

// Transaction endpoints
export type TransactionType = 'purchase' | 'subscription' | 'subscription_renewal' | 'subscription_upgrade' | 'subscription_downgrade' | 'subscription_cancel' | 'billing_switch_annual' | 'billing_switch_monthly' | 'referral' | 'job_usage' | 'refund' | 'bonus';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export interface CreditTransaction {
  transaction_id: string;
  type: TransactionType;
  amount: number;
  amount_cents: number | null;  // Dollar amount in cents (for purchases/subscriptions)
  status: TransactionStatus;
  balance_before: number | null;
  balance_after: number | null;
  description: string | null;
  related_stripe_payment_id: string | null;
  related_referral_code: string | null;
  related_job_id: string | null;
  receipt_url: string | null;  // Stripe receipt URL for purchases
  created_at: string;
}

export interface TransactionListResponse {
  transactions: CreditTransaction[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export async function getTransactions(
  page: number = 1,
  pageSize: number = 20,
  type?: TransactionType
): Promise<TransactionListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  if (type) {
    params.append('transaction_type', type);
  }
  return apiRequest<TransactionListResponse>(`/transactions?${params.toString()}`);
}

// Profile update
export interface UpdateProfileRequest {
  display_name?: string;
  company?: string;
  location?: string;
  bio?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: UserProfile;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  return apiRequest<UpdateProfileResponse>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Auto-refill settings
export interface AutoRefillSettings {
  enabled: boolean;
  threshold: number;
  package_id: string;
}

export interface AutoRefillResponse {
  message: string;
  settings: AutoRefillSettings;
}

export async function getAutoRefillSettings(): Promise<AutoRefillSettings> {
  return apiRequest<AutoRefillSettings>('/credits/auto-refill');
}

export async function updateAutoRefillSettings(settings: AutoRefillSettings): Promise<AutoRefillResponse> {
  return apiRequest<AutoRefillResponse>('/credits/auto-refill', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

// Receipt endpoint
export interface ReceiptResponse {
  session_id: string;
  transaction_id: string;
  package_name: string;
  credits: number;
  amount_cents: number;
  currency: string;
  payment_method_last4: string | null;
  payment_method_brand: string | null;
  customer_email: string;
  created_at: string;
  receipt_url: string | null;
}

export async function getReceipt(sessionId: string): Promise<ReceiptResponse> {
  return apiRequest<ReceiptResponse>(`/credits/receipt/${sessionId}`);
}

// Payment methods
export interface PaymentMethodCard {
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card: PaymentMethodCard | null;
  is_default: boolean;
  created_at: string;
}

export interface PaymentMethodsResponse {
  payment_methods: PaymentMethod[];
  default_payment_method_id: string | null;
}

export async function getPaymentMethods(): Promise<PaymentMethodsResponse> {
  return apiRequest<PaymentMethodsResponse>('/credits/payment-methods');
}

// Switch billing period (monthly <-> annual)
export interface SwitchBillingPeriodResponse {
  subscription_id: string;
  billing_period: string;
  message: string;
}

export async function switchBillingPeriod(annual: boolean): Promise<SwitchBillingPeriodResponse> {
  return apiRequest<SwitchBillingPeriodResponse>('/subscriptions/switch-billing-period', {
    method: 'POST',
    body: JSON.stringify({ annual }),
  });
}

// Customer Portal Response
export interface CustomerPortalResponse {
  url: string;
}

// Create Stripe Customer Portal session
export async function createCustomerPortalSession(): Promise<CustomerPortalResponse> {
  return apiRequest<CustomerPortalResponse>('/billing/portal-session', {
    method: 'POST',
  });
}

// Sync billing period from Stripe
export interface SyncBillingPeriodResponse {
  billing_period: string | null;
  message: string;
}

export async function syncBillingPeriod(): Promise<SyncBillingPeriodResponse> {
  return apiRequest<SyncBillingPeriodResponse>('/subscriptions/sync-billing-period', {
    method: 'POST',
  });
}

// Data Export
export interface DataExportData {
  profile: Record<string, unknown>;
  subscriptions: Record<string, unknown>[];
  transactions: Record<string, unknown>[];
  jobs: Record<string, unknown>[];
  exported_at: string;
}

export interface DataExportResponse {
  message: string;
  data: DataExportData;
}

export async function exportUserData(): Promise<DataExportResponse> {
  return apiRequest<DataExportResponse>('/auth/export');
}

// Delete Account
export interface DeleteAccountRequest {
  reason?: string;
  feedback?: string;
}

export interface DeleteAccountResponse {
  message: string;
  deleted_data: {
    user_profile: number;
    subscriptions: number;
    transactions: number;
    jobs: number;
    stripe_subscription_canceled: boolean;
    firebase_auth_deleted: boolean;
  };
}

export async function deleteAccount(request: DeleteAccountRequest = {}): Promise<DeleteAccountResponse> {
  return apiRequest<DeleteAccountResponse>('/auth/account', {
    method: 'DELETE',
    body: JSON.stringify(request),
  });
}

// Support Tickets
export interface SubmitTicketRequest {
  email: string;
  subject: string;
  category: string;
  job_id?: string;
  message: string;
}

export interface SubmitTicketResponse {
  success: boolean;
  message: string;
  ticket_id: string;
}

export async function submitSupportTicket(request: SubmitTicketRequest): Promise<SubmitTicketResponse> {
  return apiRequest<SubmitTicketResponse>('/support/ticket', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
