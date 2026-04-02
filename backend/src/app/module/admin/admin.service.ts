import status from 'http-status';
import { PaymentStatus, Role, UserStatus } from '../../../generated/prisma/enums';
import AppError from '../../errors/AppError';
import { prisma } from '../../lib/prisma';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse "field:asc" / "field:desc" → Prisma orderBy object */
function parseSort(sort?: string): Record<string, 'asc' | 'desc'> {
  if (!sort) return { createdAt: 'desc' };
  const [field, dir] = sort.split(':');
  return { [field as string]: dir === 'asc' ? 'asc' : 'desc' };
}

function parsePagination(query: { page?: string; limit?: string }) {
  const page  = Math.max(1, parseInt(query.page  ?? '1',  10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)));
  return { page, limit, skip: (page - 1) * limit };
}

function guardSelf(targetId: string, adminId: string, label = 'this resource') {
  if (targetId === adminId) {
    throw new AppError(
      status.FORBIDDEN,
      `You cannot ${label} on your own account via admin actions`,
    );
  }
}

// ─── Payment & Revenue ────────────────────────────────────────────────────────

const listPayments = async (query: {
  status?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  page?: string;
  limit?: string;
}) => {
  const where: Record<string, unknown> = {};

  if (query.status) where.status = query.status.toUpperCase() as PaymentStatus;
  if (query.userId) where.userId = query.userId;

  if (query.dateFrom || query.dateTo) {
    const createdAt: Record<string, Date> = {};
    if (query.dateFrom) createdAt.gte = new Date(query.dateFrom);
    if (query.dateTo) {
      const to = new Date(query.dateTo);
      to.setHours(23, 59, 59, 999);
      createdAt.lte = to;
    }
    where.createdAt = createdAt;
  }

  const { page, limit, skip } = parsePagination(query);
  const orderBy = parseSort(query.sort);

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.payment.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

const getPaymentById = async (id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!payment) throw new AppError(status.NOT_FOUND, 'Payment not found');
  return payment;
};

const updatePaymentStatus = async (
  id: string,
  newStatus: string,
  adminId: string,
) => {
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw new AppError(status.NOT_FOUND, 'Payment not found');

  // Only PENDING → SUCCEEDED | FAILED
  const ALLOWED_TRANSITIONS: Record<string, PaymentStatus[]> = {
    PENDING: [PaymentStatus.SUCCEEDED, PaymentStatus.FAILED],
  };

  const current = payment.status as string;
  const allowed = ALLOWED_TRANSITIONS[current] ?? [];
  const incoming = newStatus.toUpperCase() as PaymentStatus;

  if (!allowed.includes(incoming)) {
    throw new AppError(
      status.UNPROCESSABLE_ENTITY,
      `Cannot transition from '${current}' to '${newStatus}'. Only PENDING → SUCCEEDED | FAILED is allowed.`,
    );
  }

  return prisma.payment.update({ where: { id }, data: { status: incoming } });
};

// ─── User Management ──────────────────────────────────────────────────────────

const listUsers = async (query: {
  status?: string;
  subscribed?: string;
  search?: string;
  sort?: string;
  page?: string;
  limit?: string;
}) => {
  const where: Record<string, unknown> = { isDeleted: false };

  if (query.status) where.status = query.status.toUpperCase() as UserStatus;
  if (query.subscribed === 'true')  where.isSubscribed = true;
  if (query.subscribed === 'false') where.isSubscribed = false;

  if (query.search) {
    where.OR = [
      { name:  { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const { page, limit, skip } = parsePagination(query);
  const orderBy = parseSort(query.sort);

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true, name: true, email: true, role: true, status: true,
        isSubscribed: true, subscriptionEndsAt: true,
        isDeleted: true, deletedAt: true, createdAt: true, updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: { id, isDeleted: false },
    select: {
      id: true, name: true, email: true, image: true, role: true, status: true,
      isSubscribed: true, subscriptionEndsAt: true,
      isDeleted: true, deletedAt: true, createdAt: true, updatedAt: true,
    },
  });
  if (!user) throw new AppError(status.NOT_FOUND, 'User not found');
  return user;
};

const updateUser = async (
  id: string,
  adminId: string,
  data: { name?: string; email?: string; image?: string },
) => {
  guardSelf(id, adminId, 'update');
  const user = await prisma.user.findFirst({ where: { id, isDeleted: false } });
  if (!user) throw new AppError(status.NOT_FOUND, 'User not found');

  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true, name: true, email: true, image: true, role: true, status: true,
      isSubscribed: true, subscriptionEndsAt: true, createdAt: true, updatedAt: true,
    },
  });
};

const softDeleteUser = async (id: string, adminId: string) => {
  guardSelf(id, adminId, 'delete');
  const user = await prisma.user.findFirst({ where: { id, isDeleted: false } });
  if (!user) throw new AppError(status.NOT_FOUND, 'User not found');

  return prisma.user.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
};

const updateUserStatus = async (
  id: string,
  adminId: string,
  newStatus: string,
) => {
  guardSelf(id, adminId, 'update status of');
  const valid = Object.values(UserStatus) as string[];
  const incoming = newStatus.toUpperCase();
  if (!valid.includes(incoming)) {
    throw new AppError(status.BAD_REQUEST, `Status must be one of: ${valid.join(', ')}`);
  }

  const user = await prisma.user.findFirst({ where: { id, isDeleted: false } });
  if (!user) throw new AppError(status.NOT_FOUND, 'User not found');

  return prisma.user.update({
    where: { id },
    data: { status: incoming as UserStatus },
    select: {
      id: true, name: true, email: true, role: true, status: true, createdAt: true,
    },
  });
};

const updateUserRole = async (
  id: string,
  adminId: string,
  newRole: string,
) => {
  guardSelf(id, adminId, 'change role of');
  const valid = Object.values(Role) as string[];
  const incoming = newRole.toUpperCase();
  if (!valid.includes(incoming)) {
    throw new AppError(status.BAD_REQUEST, `Role must be one of: ${valid.join(', ')}`);
  }

  const user = await prisma.user.findFirst({ where: { id, isDeleted: false } });
  if (!user) throw new AppError(status.NOT_FOUND, 'User not found');

  return prisma.user.update({
    where: { id },
    data: { role: incoming as Role },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });
};

const updateUserSubscription = async (
  id: string,
  adminId: string,
  data: { isSubscribed: boolean; subscriptionEndsAt?: string },
) => {
  guardSelf(id, adminId, 'update subscription of');
  const user = await prisma.user.findFirst({ where: { id, isDeleted: false } });
  if (!user) throw new AppError(status.NOT_FOUND, 'User not found');

  const subscriptionEndsAt = data.isSubscribed
    ? data.subscriptionEndsAt
      ? new Date(data.subscriptionEndsAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)   // default 30 days
    : null;

  return prisma.user.update({
    where: { id },
    data: { isSubscribed: data.isSubscribed, subscriptionEndsAt },
    select: {
      id: true, name: true, email: true, isSubscribed: true,
      subscriptionEndsAt: true, updatedAt: true,
    },
  });
};

// ─── Documents ────────────────────────────────────────────────────────────────

const listDocuments = async (query: {
  status?: string;
  userId?: string;
  sort?: string;
  page?: string;
  limit?: string;
}) => {
  const where: Record<string, unknown> = {};

  // When status is explicitly provided, filter by it (allows ?status=FAILED to see soft-deleted).
  // When NOT provided, exclude FAILED docs (they are treated as soft-deleted by admin).
  if (query.status) {
    where.status = query.status.toUpperCase();
  } else {
    where.status = { not: 'FAILED' };
  }

  if (query.userId) where.userId = query.userId;

  const { page, limit, skip } = parsePagination(query);
  const orderBy = parseSort(query.sort);

  const [data, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.document.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

const getDocumentById = async (id: string) => {
  const doc = await prisma.document.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!doc) throw new AppError(status.NOT_FOUND, 'Document not found');
  return doc;
};

const softDeleteDocument = async (id: string) => {
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) throw new AppError(status.NOT_FOUND, 'Document not found');

  // Document schema has no isDeleted — use status=FAILED as a soft-delete flag.
  // This preserves the record for audit/abuse tracking while hiding it from active use.
  return prisma.document.update({
    where: { id },
    data: { status: 'FAILED' },
  });
};

// ─── Analytics ───────────────────────────────────────────────────────────────

const getUsersGrowth = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const rows = await prisma.$queryRaw<
    { date: string; new_users: bigint }[]
  >`
    SELECT
      TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD') AS date,
      COUNT(*) AS new_users
    FROM "user"
    WHERE "createdAt" >= ${thirtyDaysAgo}
      AND "isDeleted" = false
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY DATE_TRUNC('day', "createdAt") ASC
  `;

  return rows.map((r: { date: string; new_users: bigint }) => ({ date: r.date, newUsers: Number(r.new_users) }));
};

const getRevenue = async () => {
  const [totalResult, byMonth] = await Promise.all([
    prisma.$queryRaw<{ total: number | null }[]>`
      SELECT SUM(amount) AS total FROM payment WHERE status = 'SUCCEEDED'
    `,
    prisma.$queryRaw<{ year: number; month: number; revenue: number; transactions: bigint }[]>`
      SELECT
        EXTRACT(YEAR  FROM "createdAt")::int  AS year,
        EXTRACT(MONTH FROM "createdAt")::int  AS month,
        SUM(amount)                            AS revenue,
        COUNT(*)                               AS transactions
      FROM payment
      WHERE status = 'SUCCEEDED'
      GROUP BY year, month
      ORDER BY year DESC, month DESC
    `,
  ]);

  return {
    totalRevenue: Number(totalResult[0]?.total ?? 0),
    byMonth: byMonth.map((r: { year: number; month: number; revenue: number; transactions: bigint }) => ({
      year:         r.year,
      month:        r.month,
      revenue:      Number(r.revenue),
      transactions: Number(r.transactions),
    })),
  };
};

const getUsage = async () => {
  const [documents, quizzes, chats] = await Promise.all([
    prisma.document.count(),
    prisma.quiz.count(),
    prisma.chatHistory.count(),
  ]);

  return { documents, quizzes, chats };
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

const getDashboard = async () => {
  const [users, documents, revenueRows, activeSubscriptions] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.document.count(),
    prisma.$queryRaw<{ total: number | null }[]>`
      SELECT SUM(amount) AS total FROM payment WHERE status = 'SUCCEEDED'
    `,
    prisma.user.count({ where: { isSubscribed: true, isDeleted: false } }),
  ]);

  return {
    users,
    documents,
    revenue: Number(revenueRows[0]?.total ?? 0),
    activeSubscriptions,
  };
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const AdminService = {
  listPayments,
  getPaymentById,
  updatePaymentStatus,
  listUsers,
  getUserById,
  updateUser,
  softDeleteUser,
  updateUserStatus,
  updateUserRole,
  updateUserSubscription,
  listDocuments,
  getDocumentById,
  softDeleteDocument,
  getUsersGrowth,
  getRevenue,
  getUsage,
  getDashboard,
};
