import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import { prisma } from '../lib/prisma';
import AppError from '../errors/AppError';

const FREE_DAILY_LIMIT    = 10;   // max AI calls/day for free users
const PREMIUM_DAILY_LIMIT = 100;  // max AI calls/day for subscribed users

export const usageLimiter = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isSubscribed: true, subscriptionEndsAt: true },
    });
    if (!user) throw new AppError(status.UNAUTHORIZED, 'User not found');

    // Admins bypass limits entirely
    if (user.role === 'ADMIN') return next();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count ASSISTANT messages created today (each AI call = 1 ASSISTANT message)
    const todayUsage = await prisma.chatMessage.count({
      where: {
        chatHistory: { userId },
        role: 'ASSISTANT',
        createdAt: { gte: today },
      },
    });

    // Premium: subscribed AND subscription not expired
    const isPremium =
      user.isSubscribed &&
      user.subscriptionEndsAt !== null &&
      user.subscriptionEndsAt > new Date();

    const dailyLimit = isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;

    if (todayUsage >= dailyLimit) {
      throw new AppError(
        status.TOO_MANY_REQUESTS,
        isPremium
          ? `Daily AI usage limit reached (${dailyLimit} calls/day).`
          : `Daily AI usage limit reached (${dailyLimit} calls/day). Upgrade to premium for more.`,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
