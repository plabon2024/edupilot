import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import AppError from '../../errors/AppError';
import { PaymentService } from './payment.service';

/* ── POST /api/v1/payments/checkout ─────────────────────────── */
const checkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const data = await PaymentService.createCheckoutSession(userId, req.body as { months: number });
    res.status(status.CREATED).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};


/* ── POST /api/v1/payments/webhook ──────────────────────────── */
const handleStripeWebhookEvent = async (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error("Missing Stripe signature or webhook secret");
    return res.status(status.BAD_REQUEST).json({ message: "Missing Stripe signature or webhook secret" });
  }

  let event;
  try {
    const { stripe } = await import('./payment.service');
    event = stripe.webhooks.constructEvent(req.body as Buffer, signature, webhookSecret);
  } catch (error: any) {
    console.error("Error processing Stripe webhook:", error);
    return res.status(status.BAD_REQUEST).json({ message: "Error processing Stripe webhook" });
  }

  try {
    const result = await PaymentService.handlerStripeWebhookEvent(event);
    res.status(status.OK).json({ success: true, message: "Stripe webhook event processed successfully", data: result });
  } catch (error) {
    console.error("Error handling Stripe webhook event:", error);
    res.status(status.INTERNAL_SERVER_ERROR).json({ success: false, message: "Error handling Stripe webhook event" });
  }
};

/* ── GET /api/v1/payments/status ────────────────────────────── */
const getSubscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const data = await PaymentService.getCurrentSubscription(userId);
    res.status(status.OK).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/* ── GET /api/v1/payments/history ───────────────────────────── */
const getPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const payments = await PaymentService.getPaymentHistory(userId);
    res.status(status.OK).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

/* ── GET /api/v1/payments/:id ───────────────────────────────── */
const getPaymentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const payment = await PaymentService.getPaymentById(userId, req.params.id as string);
    res.status(status.OK).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

/* ── DELETE /api/v1/payments/:id ────────────────────────────── */
const cancelPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const payment = await PaymentService.cancelPayment(userId, req.params.id as string);
    res.status(status.OK).json({ success: true, message: 'Payment cancelled', data: payment });
  } catch (error) {
    next(error);
  }
};

export const PaymentController = {
  checkout,
  handleStripeWebhookEvent,
  getSubscriptionStatus,
  getPaymentHistory,
  getPaymentById,
  cancelPayment,
};
