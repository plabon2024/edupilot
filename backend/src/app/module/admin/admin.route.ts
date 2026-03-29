import { Router } from 'express';
import { Role } from '../../../generated/prisma/enums';
import { checkAuth } from '../../middleware/checkAuth';
import { AdminController } from './admin.controller';

const router = Router();

// All admin routes — authenticated as ADMIN only
router.use(checkAuth(Role.ADMIN));

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', AdminController.getDashboard);

// ── Payment & Revenue ─────────────────────────────────────────────────────────
// GET  /api/v1/admin/payments?status=SUCCEEDED&userId=xxx&dateFrom=&dateTo=&sort=createdAt:desc&page=1&limit=20
router.get('/payments',             AdminController.getPayments);
router.get('/payments/:id',         AdminController.getPaymentById);
router.patch('/payments/:id/status', AdminController.updatePaymentStatus);

// ── User Management ───────────────────────────────────────────────────────────
// GET  /api/v1/admin/users?status=ACTIVE&subscribed=true&search=john&page=1&limit=20
router.get('/users',                       AdminController.getUsers);
router.get('/users/:id',                   AdminController.getUserById);
router.patch('/users/:id',                 AdminController.updateUser);
router.delete('/users/:id',                AdminController.deleteUser);          // soft delete
router.patch('/users/:id/status',          AdminController.updateUserStatus);
router.patch('/users/:id/role',            AdminController.updateUserRole);
router.patch('/users/:id/subscription',    AdminController.updateUserSubscription);

// ── Documents ─────────────────────────────────────────────────────────────────
// GET  /api/v1/admin/documents?status=FAILED&userId=xxx&page=1&limit=20
router.get('/documents',      AdminController.getDocuments);
router.get('/documents/:id',  AdminController.getDocumentById);
router.delete('/documents/:id', AdminController.deleteDocument);

// ── Analytics ─────────────────────────────────────────────────────────────────
router.get('/analytics/users-growth', AdminController.getUsersGrowth);
router.get('/analytics/revenue',      AdminController.getRevenue);
router.get('/analytics/usage',        AdminController.getUsage);

export const AdminRoutes = router;
