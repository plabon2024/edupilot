import Stripe from 'stripe';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import status from 'http-status';

/** Add N calendar months to a date */
const addMonths = (date: Date, n: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
};

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-02-25.clover',
});

/** Price per month in USD cents (set MONTHLY_PRICE_USD in .env, default 9.99) */
const MONTHLY_PRICE_USD = Number(process.env.MONTHLY_PRICE_USD ?? 9.99);
const MONTHLY_PRICE_CENTS = Math.round(MONTHLY_PRICE_USD * 100);

/* ── POST /api/v1/payments/checkout ──────────────────────────── */
const createCheckoutSession = async (
  userId: string,
  body: { months: number },
) => {
  const { months } = body;

  if (!months || !Number.isInteger(months) || months < 1)
    throw new AppError(status.BAD_REQUEST, 'months must be a positive integer (e.g. 1, 2, 3)');

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

  // Build Stripe Checkout Session (hosted page) — user can adjust quantity (= months) on Stripe's UI
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'EduPilot Subscription',
            description: 'Monthly AI-powered study tools — change quantity to add more months',
            images: [],
          },
          unit_amount: MONTHLY_PRICE_CENTS,
        },
        quantity: months,
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
          maximum: 24,
        },
      },
    ],
    // Stripe appends {CHECKOUT_SESSION_ID} automatically so we can verify on success
    success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/payment/failed`,
    metadata: { userId, months: String(months) },
  });

  // Create a PENDING payment record; amount/months will be corrected by webhook
  await prisma.payment.create({
    data: {
      userId,
      amount: MONTHLY_PRICE_USD * months,
      currency: 'usd',
      status: 'PENDING',
      type: 'SUBSCRIPTION',
      months,
      description: `EduPilot subscription — ${months} month${months > 1 ? 's' : ''}`,
      stripePaymentIntentId: session.id, // will be overwritten by webhook with real PI id
    },
  });

  return { url: session.url! };
};

/* ── POST /api/v1/payments/webhook ───────────────────────────── */
const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const monthsStr = session.metadata?.months;

      if (!userId || !monthsStr) {
        console.error("Missing userId or months in session metadata");
        return { message: "Missing userId or months in session metadata" };
      }

      const paidMonths = session.amount_total
        ? Math.round(session.amount_total / MONTHLY_PRICE_CENTS)
        : Number(monthsStr);

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        console.error(`User with id ${userId} not found`);
        return { message: `User with id ${userId} not found` };
      }

      const payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: session.id, status: 'PENDING' },
      });

      if (!payment) {
        console.log(`Event ${event.id} already processed or payment not found. Skipping`);
        return { message: `Event ${event.id} already processed or payment not found. Skipping` };
      }

      await prisma.$transaction(async (tx) => {
        const baseDate =
          user.subscriptionEndsAt && user.subscriptionEndsAt > new Date()
            ? user.subscriptionEndsAt
            : new Date();
        const newEnd = addMonths(baseDate, paidMonths);

        await tx.user.update({
          where: { id: userId },
          data: {
            isSubscribed: true,
            subscriptionEndsAt: newEnd,
            status: 'ACTIVE',
          },
        });

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: session.payment_status === 'paid' ? 'SUCCEEDED' : 'PENDING',
            amount: (session.amount_total ?? 0) / 100,
            months: paidMonths,
            description: `EduPilot subscription — ${paidMonths} month${paidMonths > 1 ? 's' : ''}`,
            stripePaymentIntentId: (session.payment_intent as string) ?? session.id,
            metadata: { stripeEventId: event.id },
          },
        });
      });

      console.log(`Processed checkout.session.completed for user ${userId} and payment ${payment.id}`);
      break;
    }
    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;

      const payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: session.id, status: 'PENDING' },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED', metadata: { stripeEventId: event.id } },
        });
      }

      console.log(`Checkout session ${session.id} expired. Marking associated payment as failed.`);
      break;
    }
    case 'payment_intent.payment_failed': {
      const session = event.data.object as Stripe.PaymentIntent;

      const payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: session.id, status: 'PENDING' },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED', metadata: { stripeEventId: event.id } },
        });
      }

      console.log(`Payment intent ${session.id} failed. Marking associated payment as failed.`);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { message: `Webhook Event ${event.id} processed successfully` };
};

/* ── GET /api/v1/payments/status ─────────────────────────────── */
const getCurrentSubscription = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSubscribed: true, subscriptionEndsAt: true },
  });
  if (!user) throw new AppError(status.NOT_FOUND, 'User not found');

  const isActive =
    user.isSubscribed &&
    user.subscriptionEndsAt !== null &&
    user.subscriptionEndsAt > new Date();

  return {
    isSubscribed: isActive,
    subscriptionEndsAt: user.subscriptionEndsAt,
    monthlyPrice: MONTHLY_PRICE_USD,
  };
};

/* ── GET /api/v1/payments/history ────────────────────────────── */
const getPaymentHistory = async (userId: string) => {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

/* ── GET /api/v1/payments/:id ────────────────────────────────── */
const getPaymentById = async (userId: string, paymentId: string) => {
  const payment = await prisma.payment.findFirst({
    where: {
      userId,
      OR: [{ id: paymentId }, { stripePaymentIntentId: paymentId }],
    },
  });
  if (!payment) throw new AppError(status.NOT_FOUND, 'Payment not found');
  return payment;
};

/* ── DELETE /api/v1/payments/:id ─────────────────────────────── */
const cancelPayment = async (userId: string, paymentId: string) => {
  const payment = await prisma.payment.findFirst({
    where: {
      userId,
      OR: [{ id: paymentId }, { stripePaymentIntentId: paymentId }],
    },
  });
  if (!payment) throw new AppError(status.NOT_FOUND, 'Payment not found');
  if (payment.status !== 'PENDING')
    throw new AppError(status.BAD_REQUEST, 'Only PENDING payments can be cancelled');

  // Cancel the checkout session in Stripe if it exists AND starts with cs_
  if (payment.stripePaymentIntentId && payment.stripePaymentIntentId.startsWith('cs_')) {
    try {
      await stripe.checkout.sessions.expire(payment.stripePaymentIntentId);
    } catch (err) {
      // Ignore errors if already expired or not a checkout session
      console.error('Failed to expire Stripe session', err);
    }
  }

  return prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'CANCELLED' },
  });
};

/* ── POST /api/v1/payments/verify ────────────────────────────── */
const verifyPayment = async (userId: string, sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session) throw new AppError(status.NOT_FOUND, 'Stripe session not found');

  if (session.payment_status !== 'paid') {
    return { message: 'Payment not completed yet' };
  }

  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: session.id },
  });

  if (!payment) {
    throw new AppError(status.NOT_FOUND, 'Associated payment record not found');
  }

  if (payment.status === 'SUCCEEDED') {
    return { message: 'Payment already verified' };
  }

  // Fulfill the payment synchronously
  const monthsStr = session.metadata?.months;
  const paidMonths = session.amount_total
    ? Math.round(session.amount_total / MONTHLY_PRICE_CENTS)
    : Number(monthsStr || 1);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  await prisma.$transaction(async (tx) => {
    const baseDate =
      user?.subscriptionEndsAt && user.subscriptionEndsAt > new Date()
        ? user.subscriptionEndsAt
        : new Date();
    const newEnd = addMonths(baseDate, paidMonths);

    await tx.user.update({
      where: { id: userId },
      data: {
        isSubscribed: true,
        subscriptionEndsAt: newEnd,
        status: 'ACTIVE',
      },
    });

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCEEDED',
        amount: (session.amount_total ?? 0) / 100,
        months: paidMonths,
        description: `EduPilot subscription — ${paidMonths} month${paidMonths > 1 ? 's' : ''}`,
        stripePaymentIntentId: (session.payment_intent as string) ?? session.id,
      },
    });
  });

  return { message: 'Payment verified successfully' };
};

export const PaymentService = {
  createCheckoutSession,
  handlerStripeWebhookEvent,
  getCurrentSubscription,
  getPaymentHistory,
  getPaymentById,
  cancelPayment,
  verifyPayment,
};
