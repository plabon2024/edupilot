'use client';

import axiosInstance from '@/lib/axiosInstance';

// ── Types ─────────────────────────────────────────────────────

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  type: 'SUBSCRIPTION' | 'ONE_TIME' | 'CREDIT';
  months?: number;
  description?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  subscriptionEndsAt: string | null;
  monthlyPrice: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ── Payment API ───────────────────────────────────────────────

/**
 * POST /api/v1/payments/checkout
 * Creates a Stripe Checkout session and returns the redirect URL.
 */
export async function createCheckoutSession(months: number): Promise<{ url: string }> {
  const response = await axiosInstance.post<ApiResponse<{ url: string }>>(
    '/payments/checkout',
    { months }
  );
  return response.data.data;
}

/**
 * POST /api/v1/payments/verify
 * Verifies a Stripe Checkout session and syncs its state in db seamlessly.
 */
export async function verifyPaymentSession(sessionId: string): Promise<void> {
  await axiosInstance.post('/payments/verify', { sessionId });
}

/**
 * GET /api/v1/payments/status
 * Returns the current subscription status for the logged-in user.
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const response = await axiosInstance.get<ApiResponse<SubscriptionStatus>>('/payments/status');
  return response.data.data;
}

/**
 * GET /api/v1/payments/history
 * Returns all past payments for the logged-in user.
 */
export async function getPaymentHistory(): Promise<Payment[]> {
  const response = await axiosInstance.get<ApiResponse<Payment[]>>('/payments/history');
  return response.data.data || [];
}

/**
 * GET /api/v1/payments/:id
 * Returns a single payment by ID.
 */
export async function getPaymentById(paymentId: string): Promise<Payment> {
  const response = await axiosInstance.get<ApiResponse<Payment>>(`/payments/${paymentId}`);
  return response.data.data;
}

/**
 * DELETE /api/v1/payments/:id
 * Cancels a PENDING payment.
 */
export async function cancelPayment(paymentId: string): Promise<Payment> {
  const response = await axiosInstance.delete<ApiResponse<Payment>>(`/payments/${paymentId}`);
  return response.data.data;
}
