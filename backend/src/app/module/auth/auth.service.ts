import status from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { UserStatus } from '../../../generated/prisma/enums';
import { envVars } from '../../config';
import AppError from '../../errors/AppError';
import { auth } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import { jwtUtils } from '../../utils/jwt';
import { tokenUtils } from '../../utils/token';
import { IChangePasswordPayload, ILoginUserPayload, IRegisterUserPayload } from './auth.interface';

/* ── helpers ────────────────────────────────────────────────── */
type TokenPayload = {
  userId: string;
  role: string;
  name: string;
  email: string;
  status?: string;
  isDeleted?: boolean;
  emailVerified?: boolean;
};

const buildTokens = (p: TokenPayload) => ({
  accessToken: tokenUtils.getAccessToken(p as JwtPayload),
  refreshToken: tokenUtils.getRefreshToken(p as JwtPayload),
});

/* ── POST /api/v1/auth/register ─────────────────────────────── */
const registerUser = async (payload: IRegisterUserPayload) => {
  const { name, email, password } = payload;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {

    throw new AppError(status.BAD_REQUEST, 'User already exists');

  }

  const data = await auth.api.signUpEmail({ body: { name, email, password } });

  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, 'Registration failed');
  }

  const { accessToken, refreshToken } = buildTokens({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return { user: data.user, token: data.token, accessToken, refreshToken };
};

/* ── POST /api/v1/auth/login ────────────────────────────────── */
const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;



  const data = await auth.api.signInEmail({ body: { email, password } });

  if (data.user.status === UserStatus.SUSPENDED) {
    throw new AppError(status.FORBIDDEN, 'Account is suspended');
  }

  if (data.user.isDeleted || data.user.status === UserStatus.INACTIVE) {
    throw new AppError(status.NOT_FOUND, 'Account not found');
  }

  const { accessToken, refreshToken } = buildTokens({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return { user: data.user, token: data.token, accessToken, refreshToken };
};

/* ── GET /api/v1/auth/me ────────────────────────────────────── */
const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      emailVerified: true,
      image: true,
      isDeleted: true,
      isSubscribed: true,
      subscriptionEndsAt: true,
      createdAt: true,
    },
  });

  if (!user) throw new AppError(status.NOT_FOUND, 'User not found');
  return user;
};

/* ── POST /api/v1/auth/refresh-token ────────────────────────── */
const getNewToken = async (refreshToken: string, sessionToken?: string) => {
  // If a sessionToken is provided (cookie-based flow), validate it in the DB
  // for an extra layer of security. Without it, we rely solely on JWT verification.
  if (sessionToken) {
    const sessionExists = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!sessionExists) throw new AppError(status.UNAUTHORIZED, 'Invalid session token');
  }

  const verified = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET);
  if (!verified.success) throw new AppError(status.UNAUTHORIZED, 'Invalid refresh token');

  const data = verified.data as JwtPayload;

  const newTokens = buildTokens({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  // Extend session lifetime only when we have a valid session token.
  if (sessionToken) {
    await prisma.session.update({
      where: { token: sessionToken },
      data: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });
  }

  return { ...newTokens, sessionToken };
};


/* ── POST /api/v1/auth/change-password ──────────────────────── */
const changePassword = async (payload: IChangePasswordPayload, sessionToken: string) => {
  const session = await auth.api.getSession({
    headers: new Headers({ Authorization: `Bearer ${sessionToken}` }),
  });

  if (!session) throw new AppError(status.UNAUTHORIZED, 'Invalid session');

  const { currentPassword, newPassword } = payload;

  const result = await auth.api.changePassword({
    body: { currentPassword, newPassword, revokeOtherSessions: true },
    headers: new Headers({ Authorization: `Bearer ${sessionToken}` }),
  });

  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { needPasswordChange: false },
    });
  }

  const tokens = buildTokens({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  return { ...result, ...tokens };
};

/* ── POST /api/v1/auth/logout ───────────────────────────────── */
const logoutUser = async (sessionToken: string) => {
  return auth.api.signOut({
    headers: new Headers({ Authorization: `Bearer ${sessionToken}` }),
  });
};


/* ── Google OAuth success callback ──────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const googleLoginSuccess = async (session: Record<string, any>) => {
  const tokens = buildTokens({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  return tokens;
};

export const AuthService = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  googleLoginSuccess,
};