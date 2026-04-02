import express, { Router } from 'express';
import { Role } from '../../../generated/prisma/enums';
import { checkAuth } from '../../middleware/checkAuth';
import { PaymentController } from './payment.controller';

const router = Router();

// POST /api/v1/payments/checkout        — create Stripe Checkout Session (redirects to hosted page)
router.post('/checkout', checkAuth(Role.ADMIN, Role.USER), PaymentController.checkout);

// POST /api/v1/payments/verify          — verify Stripe Checkout Session locally
router.post('/verify', checkAuth(Role.ADMIN, Role.USER), PaymentController.verifyPayment);

// POST /api/v1/payments/webhook         — Stripe webhook (raw body, no auth)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhookEvent,
);

// GET  /api/v1/payments/status          — current subscription status
router.get('/status', checkAuth(Role.ADMIN, Role.USER), PaymentController.getSubscriptionStatus);

// GET  /api/v1/payments/history         — all past payments
router.get('/history', checkAuth(Role.ADMIN, Role.USER), PaymentController.getPaymentHistory);

// GET  /api/v1/payments/:id             — single payment detail
router.get('/:id', checkAuth(Role.ADMIN, Role.USER), PaymentController.getPaymentById);

// DELETE /api/v1/payments/:id           — cancel a PENDING payment
router.delete('/:id', checkAuth(Role.ADMIN, Role.USER), PaymentController.cancelPayment);

export const PaymentRoutes = router;
