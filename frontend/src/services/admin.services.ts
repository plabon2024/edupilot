import axiosInstance from '@/lib/axiosInstance';
import {
  AdminDashboardStats,
  AdminDocument,
  AdminPayment,
  AdminUser,
  PaginatedResponse,
  RevenueAnalytics,
  UsageAnalytics,
  UserGrowthItem,
} from '../types/admin.types';
import { AxiosResponse } from 'axios';

// ── Query param helpers ───────────────────────────────────────────────────────

export interface UserQueryParams {
  status?: string;
  subscribed?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaymentQueryParams {
  status?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface DocumentQueryParams {
  status?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const adminAPI = {
  // ── Dashboard ───────────────────────────────────────────────────────────────
  getDashboard: async (): Promise<AxiosResponse<{ success: boolean; data: AdminDashboardStats }>> => {
    return axiosInstance.get('/admin/dashboard');
  },

  // ── Payments ─────────────────────────────────────────────────────────────────
  getPayments: async (params?: PaymentQueryParams): Promise<
    AxiosResponse<{ success: boolean; data: PaginatedResponse<AdminPayment> }>
  > => {
    return axiosInstance.get('/admin/payments', { params });
  },

  getPaymentById: async (id: string): Promise<
    AxiosResponse<{ success: boolean; data: AdminPayment }>
  > => {
    return axiosInstance.get(`/admin/payments/${id}`);
  },

  updatePaymentStatus: async (paymentId: string, status: string): Promise<AxiosResponse> => {
    return axiosInstance.patch(`/admin/payments/${paymentId}/status`, { status });
  },

  // ── Users ────────────────────────────────────────────────────────────────────
  getUsers: async (params?: UserQueryParams): Promise<
    AxiosResponse<{ success: boolean; data: PaginatedResponse<AdminUser> }>
  > => {
    return axiosInstance.get('/admin/users', { params });
  },

  getUserById: async (id: string): Promise<
    AxiosResponse<{ success: boolean; data: AdminUser }>
  > => {
    return axiosInstance.get(`/admin/users/${id}`);
  },

  updateUser: async (userId: string, data: Partial<AdminUser>): Promise<AxiosResponse> => {
    return axiosInstance.patch(`/admin/users/${userId}`, data);
  },

  deleteUser: async (userId: string): Promise<AxiosResponse> => {
    return axiosInstance.delete(`/admin/users/${userId}`);
  },

  updateUserStatus: async (userId: string, status: string): Promise<AxiosResponse> => {
    return axiosInstance.patch(`/admin/users/${userId}/status`, { status });
  },

  updateUserRole: async (userId: string, role: string): Promise<AxiosResponse> => {
    return axiosInstance.patch(`/admin/users/${userId}/role`, { role });
  },

  updateUserSubscription: async (userId: string, data: { isSubscribed: boolean; subscriptionEndsAt?: string }): Promise<AxiosResponse> => {
    return axiosInstance.patch(`/admin/users/${userId}/subscription`, data);
  },

  // ── Documents ─────────────────────────────────────────────────────────────────
  getDocuments: async (params?: DocumentQueryParams): Promise<
    AxiosResponse<{ success: boolean; data: PaginatedResponse<AdminDocument> }>
  > => {
    return axiosInstance.get('/admin/documents', { params });
  },

  getDocumentById: async (id: string): Promise<
    AxiosResponse<{ success: boolean; data: AdminDocument }>
  > => {
    return axiosInstance.get(`/admin/documents/${id}`);
  },

  deleteDocument: async (documentId: string): Promise<AxiosResponse> => {
    return axiosInstance.delete(`/admin/documents/${documentId}`);
  },

  // ── Analytics ─────────────────────────────────────────────────────────────────
  getUsersGrowth: async (): Promise<AxiosResponse<{ success: boolean; data: UserGrowthItem[] }>> => {
    return axiosInstance.get('/admin/analytics/users-growth');
  },

  getRevenueAnalytics: async (): Promise<AxiosResponse<{ success: boolean; data: RevenueAnalytics }>> => {
    return axiosInstance.get('/admin/analytics/revenue');
  },

  getUsageAnalytics: async (): Promise<AxiosResponse<{ success: boolean; data: UsageAnalytics }>> => {
    return axiosInstance.get('/admin/analytics/usage');
  },
};
