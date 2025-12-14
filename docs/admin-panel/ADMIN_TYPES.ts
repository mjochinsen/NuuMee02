/**
 * Admin Panel TypeScript Types
 * Generated from ADMIN_API_SCHEMA.yaml
 *
 * Usage: Copy relevant types to frontend/types/admin.ts
 */

// ==================== Common ====================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}

export interface ErrorResponse {
  detail: string;
}

// ==================== User ====================

export type UserTier = 'free' | 'pro' | 'business';

export interface AdminUserSummary {
  uid: string;
  email: string;
  display_name: string | null;
  tier: UserTier;
  credits: number;
  created_at: string; // ISO date
  last_active: string | null; // ISO date
  jobs_count?: number;
}

export interface SubscriptionInfo {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  plan: string;
  current_period_end: string; // ISO date
}

export type CreditTransactionType =
  | 'purchase'
  | 'usage'
  | 'admin_adjustment'
  | 'promo'
  | 'referral'
  | 'subscription';

export interface CreditTransaction {
  id: string;
  type: CreditTransactionType;
  amount: number; // Positive for credit, negative for debit
  balance_after: number;
  description?: string;
  created_at: string; // ISO date
}

export interface AdminUserDetail extends AdminUserSummary {
  subscription: SubscriptionInfo | null;
  recent_jobs: AdminJobSummary[];
  recent_transactions: CreditTransaction[];
  photo_url: string | null;
}

export interface CreditAdjustmentRequest {
  amount: number; // -2000 to 2000
  reason?: string;
}

export interface CreditAdjustmentResponse {
  success: boolean;
  new_balance: number;
  transaction_id: string;
}

// ==================== Job ====================

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type JobType = 'video_generation' | 'subtitles' | 'watermark';

export interface AdminJobSummary {
  id: string;
  user_id: string;
  user_email?: string;
  type?: JobType;
  status: JobStatus;
  credits_used?: number;
  created_at: string; // ISO date
  completed_at: string | null; // ISO date
  error_message: string | null;
}

export interface AdminJobDetail extends AdminJobSummary {
  input_path: string | null;
  output_path: string | null;
  error_details: string | null; // Full error message
  metadata?: Record<string, unknown>;
}

export interface JobRetryRequest {
  note?: string;
}

export interface JobRetryResponse {
  success: boolean;
  job_id: string;
  new_status: string;
}

// ==================== Payments ====================

export interface PaymentStats {
  mrr: number;
  total_revenue: number;
  subscriber_count: number;
  credits_purchased_today?: number;
  credits_purchased_this_month?: number;
}

export type PaymentTransactionType = 'subscription' | 'credit_purchase' | 'refund';
export type PaymentStatus = 'succeeded' | 'pending' | 'failed' | 'refunded';

export interface PaymentTransaction {
  id: string;
  user_id?: string;
  user_email?: string;
  type: PaymentTransactionType;
  amount: number; // In dollars
  status: PaymentStatus;
  created_at: string; // ISO date
}

export interface PaymentsResponse {
  stats: PaymentStats;
  recent_transactions: PaymentTransaction[];
}

// ==================== Promo Codes ====================

export interface PromoCode {
  id: string;
  code: string;
  credits: number;
  max_uses: number | null; // null = unlimited
  current_uses: number;
  expires_at: string | null; // ISO date
  active: boolean;
  created_at: string; // ISO date
}

export interface CreatePromoRequest {
  code: string; // Will be uppercased
  credits: number; // 1-10000
  max_uses?: number | null;
  expires_at?: string | null; // ISO date
}

// ==================== Dashboard Stats ====================

export interface DashboardStats {
  users: {
    total: number;
    new_today: number;
    new_this_week?: number;
  };
  jobs: {
    total: number;
    today: number;
    failed: number;
    processing: number;
  };
  revenue: {
    this_month: number;
    mrr: number;
  };
  promos: {
    active: number;
    total_redemptions: number;
  };
}

// ==================== Health ====================

export interface HealthResponse {
  status: 'healthy';
  admin: boolean;
  timestamp: string; // ISO date
}

// ==================== API Client Types ====================

export interface AdminApiConfig {
  baseUrl: string;
  password: string;
}

export interface AdminApiError {
  status: number;
  message: string;
  detail?: string;
}

// Query params for list endpoints
export interface ListUsersParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface ListJobsParams {
  page?: number;
  per_page?: number;
  status?: JobStatus;
  user_id?: string;
}

// ==================== Component Props ====================

// These can be extended as needed during implementation

export interface UserRowProps {
  user: AdminUserSummary;
  onSelect: (uid: string) => void;
  onAdjustCredits: (uid: string) => void;
}

export interface JobRowProps {
  job: AdminJobSummary;
  onViewDetails: (jobId: string) => void;
  onRetry?: (jobId: string) => void;
}

export interface PromoRowProps {
  promo: PromoCode;
  onDelete: (promoId: string) => void;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  href?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
  }[];
  loading?: boolean;
  pagination?: {
    page: number;
    pages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
}

// ==================== Toast Types ====================

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  type: ToastType;
  title: string;
  description?: string;
}

// Common toast messages
export const TOAST_MESSAGES = {
  CREDIT_ADJUSTED: (amount: number, email: string): ToastMessage => ({
    type: amount > 0 ? 'success' : 'info',
    title: `Credits ${amount > 0 ? 'added' : 'deducted'}`,
    description: `${Math.abs(amount)} credits ${amount > 0 ? 'added to' : 'deducted from'} ${email}`,
  }),
  JOB_RETRIED: (jobId: string): ToastMessage => ({
    type: 'success',
    title: 'Job retry initiated',
    description: `Job ${jobId} has been queued for retry`,
  }),
  PROMO_CREATED: (code: string): ToastMessage => ({
    type: 'success',
    title: 'Promo code created',
    description: `Promo code ${code} is now active`,
  }),
  PROMO_DELETED: (code: string): ToastMessage => ({
    type: 'info',
    title: 'Promo code deactivated',
    description: `Promo code ${code} has been deactivated`,
  }),
  ERROR: (message: string): ToastMessage => ({
    type: 'error',
    title: 'Error',
    description: message,
  }),
} as const;
