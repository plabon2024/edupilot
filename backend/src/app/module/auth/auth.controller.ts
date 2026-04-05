import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import { envVars } from '../../config';
import AppError from '../../errors/AppError';
import { auth } from '../../lib/auth';
import { CookieUtils } from '../../utils/cookie';
import { tokenUtils } from '../../utils/token';
import { AuthService } from './auth.service';

/* ── POST /api/v1/auth/register ─────────────────────────────── */
const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.registerUser(req.body as { name: string; email: string; password: string });

    tokenUtils.setAccessTokenCookie(res, result.accessToken);
    tokenUtils.setRefreshTokenCookie(res, result.refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, result.token as string);

    res.status(status.CREATED).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) { next(error); }
};

/* ── POST /api/v1/auth/login ────────────────────────────────── */
const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.loginUser(req.body as { email: string; password: string });

    tokenUtils.setAccessTokenCookie(res, result.accessToken);
    tokenUtils.setRefreshTokenCookie(res, result.refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, result.token as string);

    res.status(status.OK).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) { next(error); }
};

/* ── GET /api/v1/auth/me ────────────────────────────────────── */
const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'Unauthorized');

    const user = await AuthService.getMe(userId);
    res.status(status.OK).json({ success: true, data: user });
  } catch (error) { next(error); }
};

/* ── POST /api/v1/auth/refresh-token ────────────────────────── */
const getNewToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    const sessionToken = req.cookies['better-auth.session_token'] as string | undefined;

    if (!refreshToken) throw new AppError(status.UNAUTHORIZED, 'Refresh token missing');
    if (!sessionToken) throw new AppError(status.UNAUTHORIZED, 'Session token missing');

    const result = await AuthService.getNewToken(refreshToken, sessionToken);

    tokenUtils.setAccessTokenCookie(res, result.accessToken);
    tokenUtils.setRefreshTokenCookie(res, result.refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, result.sessionToken);

    res.status(status.OK).json({
      success: true,
      message: 'Tokens refreshed',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) { next(error); }
};

/* ── POST /api/v1/auth/change-password ──────────────────────── */
const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = req.cookies['better-auth.session_token'] as string | undefined;
    if (!sessionToken) throw new AppError(status.UNAUTHORIZED, 'Session token missing');

    const result = await AuthService.changePassword(
      req.body as { currentPassword: string; newPassword: string },
      sessionToken,
    );

    tokenUtils.setAccessTokenCookie(res, result.accessToken);
    tokenUtils.setRefreshTokenCookie(res, result.refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, result.token as string);

    res.status(status.OK).json({ success: true, message: 'Password changed successfully' });
  } catch (error) { next(error); }
};

/* ── POST /api/v1/auth/logout ───────────────────────────────── */
const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = req.cookies['better-auth.session_token'] as string | undefined;
    if (sessionToken) await AuthService.logoutUser(sessionToken);

    const cookieOpts = { httpOnly: true, secure: true, sameSite: 'none' as const };
    CookieUtils.clearCookie(res, 'accessToken', cookieOpts);
    CookieUtils.clearCookie(res, 'refreshToken', cookieOpts);
    CookieUtils.clearCookie(res, 'better-auth.session_token', cookieOpts);

    res.status(status.OK).json({ success: true, message: 'Logged out successfully' });
  } catch (error) { next(error); }
};

/* ── GET /api/v1/auth/login/google ──────────────────────────── */
const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redirectPath = (req.query.redirect as string) || '/dashboard';
    const encodedRedirectPath = encodeURIComponent(redirectPath);
    const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;

    // Convert Express headers to Web Headers
    const reqHeaders = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        reqHeaders.set(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => reqHeaders.append(key, v));
      }
    }

    const response = await auth.api.signInSocial({
      body: {
        provider: 'google',
        callbackURL,
      },
      headers: reqHeaders,
      asResponse: true,
    }) as unknown as globalThis.Response;

    // Forward cookies (this contains the state cookie needed to prevent state_mismatch)
    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      res.setHeader('Set-Cookie', setCookieHeaders);
    }

    const data = await response.json();

    if (data && data.url) {
      res.redirect(data.url);
    } else {
      res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_init_failed`);
    }
  } catch (error) { next(error); }
};

/* ── GET /api/v1/auth/google/success ────────────────────────── */
/* ── GET /api/v1/auth/google/success ────────────────────────── */
const googleLoginSuccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redirectPath = (req.query.redirect as string) || '/dashboard';
    const sessionToken = req.cookies['better-auth.session_token'] as string | undefined;

    if (!sessionToken) {
      return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const session = await auth.api.getSession({
      headers: { Cookie: `better-auth.session_token=${sessionToken}` },
    });

    if (!session?.user) {
      return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
    }

    const result = await AuthService.googleLoginSuccess(session);

    tokenUtils.setAccessTokenCookie(res, result.accessToken);
    tokenUtils.setRefreshTokenCookie(res, result.refreshToken);

    const isValidPath = redirectPath.startsWith('/') && !redirectPath.startsWith('//');
    const finalPath = isValidPath ? redirectPath : '/dashboard';
    const finalUrl = `${envVars.FRONTEND_URL}${finalPath}`;

    // RENDER THE EJS TEMPLATE INSTEAD OF REDIRECTING
    res.render('googleRedirect', { url: finalUrl });
    
  } catch (error) { next(error); }
};


/* ── GET /api/v1/auth/oauth/error ───────────────────────────── */
const handleOAuthError = (req: Request, res: Response) => {
  const error = (req.query.error as string) || 'oauth_failed';
  res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
};

export const AuthController = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  googleLogin,
  googleLoginSuccess,
  handleOAuthError,
};