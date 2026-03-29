import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import AppError from '../../errors/AppError';
import { AdminService } from './admin.service';

/** Helper — safe admin userId (always set by checkAuth middleware) */
const uid = (req: Request): string => {
  const id = req.user?.userId;
  if (!id) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');
  return id;
};

/** Cast req.params field to string (Express types it as string | string[]) */
const param = (req: Request, key: string): string =>
  req.params[key] as string;

// ─── Dashboard ────────────────────────────────────────────────────────────────

/* GET /api/v1/admin/dashboard */
const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await AdminService.getDashboard();
    res.status(status.OK).json({ success: true, data });
  } catch (error) { next(error); }
};

// ─── Payment & Revenue ────────────────────────────────────────────────────────

/* GET /api/v1/admin/payments?status=&userId=&dateFrom=&dateTo=&sort=&page=&limit= */
const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.listPayments(req.query as Record<string, string>);
    res.status(status.OK).json({ success: true, ...result });
  } catch (error) { next(error); }
};

/* GET /api/v1/admin/payments/:id */
const getPaymentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await AdminService.getPaymentById(param(req, 'id'));
    res.status(status.OK).json({ success: true, data });
  } catch (error) { next(error); }
};

/* PATCH /api/v1/admin/payments/:id/status */
const updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status: newStatus } = req.body as { status?: string };
    if (!newStatus) throw new AppError(status.BAD_REQUEST, 'status field is required');
    const data = await AdminService.updatePaymentStatus(param(req, 'id'), newStatus, uid(req));
    res.status(status.OK).json({ success: true, data });
  } catch (error) { next(error); }
};

// ─── User Management ──────────────────────────────────────────────────────────

/* GET /api/v1/admin/users?status=&subscribed=&search=&sort=&page=&limit= */
const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.listUsers(req.query as Record<string, string>);
    res.status(status.OK).json({ success: true, ...result });
  } catch (error) { next(error); }
};

/* GET /api/v1/admin/users/:id */
const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await AdminService.getUserById(param(req, 'id'));
    res.status(status.OK).json({ success: true, data });
  } catch (error) { next(error); }
};

/* PATCH /api/v1/admin/users/:id */
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await AdminService.updateUser(
      param(req, 'id'),
      uid(req),
      req.body as { name?: string; email?: string; image?: string },
    );
    res.status(status.OK).json({ success: true, data });
  } catch (error) { next(error); }
};

/* DELETE /api/v1/admin/users/:id  (soft delete) */
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AdminService.softDeleteUser(param(req, 'id'), uid(req));
    res.status(status.OK).json({ success: true, message: 'User soft-deleted successfully' });
  } catch (error) { next(error); }
};

/* PATCH /api/v1/admin/users/:id/status */
const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status: newStatus } = req.body as { status?: string };
    if (!newStatus) throw new AppError(status.BAD_REQUEST, 'status field is required');
    const data = await AdminService.updateUserStatus(param(req, 'id'), uid(req), newStatus);
    res.status(status.OK).json({ success: true, data });
  } catch (error) { next(error); }
};

/* PATCH /api/v1/admin/users/:id/role */
const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body as { role?: string };
    if (!role) throw new AppError(status.BAD_REQUEST, 'role field is required');
    const data = await AdminService.updateUserRole(param(req, 'id'), uid(req), role);
    res.status(status.OK).json({ success: true, data });
  } catch (error) { next(error); }
};

/* PATCH /api/v1/admin/users/:id/subscription */
const updateUserSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isSubscribed, subscriptionEndsAt } = req.body as {
      isSubscribed?: boolean;
      subscriptionEndsAt?: string;
    };
    if (typeof isSubscribed !== 'boolean') {
      throw new AppError(status.BAD_REQUEST, 'isSubscribed (boolean) is required');
    }
    const data = await AdminService.updateUserSubscription(
      param(req, 'id'),
      uid(req),
      { isSubscribed, subscriptionEndsAt },
    );
    res.status(status.OK).json({ success: true, data });
  } catch (error) { next(error); }
};

// ─── Documents ────────────────────────────────────────────────────────────────

/* GET /api/v1/admin/documents?status=&userId=&sort=&page=&limit= */
const getDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.listDocuments(req.query as Record<string, string>);
    res.status(status.OK).json({ success: true, ...result });
  } catch (error) { next(error); }
};

/* GET /api/v1/admin/documents/:id */
const getDocumentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await AdminService.getDocumentById(param(req, 'id'));
    res.status(status.OK).json({ success: true, data });
  } catch (error) { next(error); }
};

/* DELETE /api/v1/admin/documents/:id */
const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AdminService.softDeleteDocument(param(req, 'id'));
    res.status(status.OK).json({ success: true, message: 'Document deleted successfully' });
  } catch (error) { next(error); }
};

// ─── Analytics ───────────────────────────────────────────────────────────────

/* GET /api/v1/admin/analytics/users-growth */
const getUsersGrowth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await AdminService.getUsersGrowth();
    res.status(status.OK).json({ success: true, data });
  } catch (error) { next(error); }
};

/* GET /api/v1/admin/analytics/revenue */
const getRevenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await AdminService.getRevenue();
    res.status(status.OK).json({ success: true, data });
  } catch (error) { next(error); }
};

/* GET /api/v1/admin/analytics/usage */
const getUsage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await AdminService.getUsage();
    res.status(status.OK).json({ success: true, data });
  } catch (error) { next(error); }
};

export const AdminController = {
  getDashboard,
  getPayments,
  getPaymentById,
  updatePaymentStatus,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  updateUserSubscription,
  getDocuments,
  getDocumentById,
  deleteDocument,
  getUsersGrowth,
  getRevenue,
  getUsage,
};
