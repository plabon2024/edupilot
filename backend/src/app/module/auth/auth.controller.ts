import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import AppError from '../../errors/AppError';
import { auth } from '../../lib/auth';
import { envVars } from '../../config';
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

    // Let better-auth generate the Google OAuth URL directly.
    // asResponse:true returns the raw Response with the redirect + state cookie.
    const response = await auth.api.signInSocial({
      body: { provider: 'google', callbackURL },
      headers: new Headers(req.headers as Record<string, string>),
      asResponse: true,
    }) as unknown as globalThis.Response;

    // ✅ Forward the state cookie set by better-auth to the browser
    const setCookieHeaders = response.headers.getSetCookie?.() ?? [];
    if (setCookieHeaders.length > 0) {
      res.setHeader('Set-Cookie', setCookieHeaders);
    }

    const body = await response.json();

    if (!body?.url) {
      return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_init_failed`);
    }

    // ✅ Redirect the browser to Google
    return res.redirect(body.url);
  } catch (error) { next(error); }
};

/* ── GET /api/v1/auth/google/success ────────────────────────── */
const googleLoginSuccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redirectPath = (req.query.redirect as string) || '/dashboard';

    // better-auth sets this cookie after completing the OAuth callback.
    // Also try the raw Cookie header as a fallback (cookie-parser can sometimes
    // mangle keys that contain dots depending on configuration).
    let sessionToken = req.cookies['better-auth.session_token'] as string | undefined;

    if (!sessionToken) {
      // Fallback: parse the raw Cookie header manually
      const rawCookie = req.headers.cookie ?? '';
      const match = rawCookie.match(/better-auth\.session_token=([^;]+)/);
      if (match) {
        sessionToken = decodeURIComponent(match[1]);
      }
    }

    if (!sessionToken) {
      console.error('[googleLoginSuccess] No session token in cookies. Available cookies:', req.cookies);
      console.error('[googleLoginSuccess] Raw cookie header:', req.headers.cookie);
      return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
    }

    // Pass the full raw cookie string so better-auth can resolve the session
    const session = await auth.api.getSession({
      headers: new Headers({ Cookie: req.headers.cookie ?? `better-auth.session_token=${sessionToken}` }),
    });

    if (!session?.user) {
      console.error('[googleLoginSuccess] Session or User not found for token:', sessionToken);
      return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
    }

    console.log('[googleLoginSuccess] Successfully retrieved session for user:', session.user.email);

    const result = await AuthService.googleLoginSuccess(session);

    const isValidPath = redirectPath.startsWith('/') && !redirectPath.startsWith('//');
    const finalPath = isValidPath ? redirectPath : '/dashboard';

    // ✅ Redirect to the frontend's /auth/google/success page with tokens in the URL
    // hash fragment (hashes are never sent to any server — client-side only).
    // The frontend page reads the hash, stores tokens in localStorage, then calls /me.
    const hash = `accessToken=${encodeURIComponent(result.accessToken)}&refreshToken=${encodeURIComponent(result.refreshToken)}`;
    const successUrl = `${envVars.FRONTEND_URL}/auth/google/success?redirect=${encodeURIComponent(finalPath)}#${hash}`;
    res.render('googleRedirect', { url: successUrl });
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