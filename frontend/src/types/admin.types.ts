export type Role = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'COMPLETED';
export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PROCESSED' | 'FAILED';

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalDocuments: number;
  totalStorageUsed: number;
  recentUsers: AdminUser[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role | string;
  status: UserStatus | string;
  subscriptionPlan: SubscriptionPlan | string;
  creditBalance?: number;
  isEmailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPayment {
  id: string;
  userId: string;
  transactionId?: string;
  stripeSessionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus | string;
  subscriptionPlan?: string;
  createdAt: string;
  updatedAt: string;
  user?: Pick<AdminUser, 'id' | 'name' | 'email'>;
}

export interface AdminDocument {
  id: string;
  userId: string;
  title?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  status: DocumentStatus | string;
  createdAt: string;
  updatedAt: string;
  user?: Pick<AdminUser, 'id' | 'name' | 'email'>;
}

export interface AnalyticsData {
  date: string;
  count?: number;
  amount?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserGrowthItem {
  date: string;
  newUsers: number;
}

export interface RevenueByMonth {
  year: number;
  month: number;
  revenue: number;
  transactions: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  byMonth: RevenueByMonth[];
}

export interface UsageAnalytics {
  documents: number;
  quizzes: number;
  chats: number;
}
