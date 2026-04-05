import { Router } from 'express';
import { Role } from '../../../generated/prisma/enums';
import { checkAuth } from '../../middleware/checkAuth';
import { AuthController } from './auth.controller';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', AuthController.registerUser);

// POST /api/v1/auth/login
router.post('/login', AuthController.loginUser);

// GET  /api/v1/auth/me
router.get('/me', checkAuth(Role.ADMIN, Role.USER), AuthController.getMe);

// POST /api/v1/auth/refresh-token
router.post('/refresh-token', AuthController.getNewToken);

// POST /api/v1/auth/change-password
router.post('/change-password', checkAuth(Role.ADMIN, Role.USER), AuthController.changePassword);

// POST /api/v1/auth/logout
router.post('/logout', checkAuth(Role.ADMIN, Role.USER), AuthController.logoutUser);

// GET  /api/v1/auth/login/google          — initiates Google OAuth
router.get('/login/google', AuthController.googleLogin);

// GET  /api/v1/auth/google/success        — OAuth callback
router.get('/google/success', AuthController.googleLoginSuccess);

// GET  /api/v1/auth/oauth/error
router.get('/oauth/error', AuthController.handleOAuthError);

export const AuthRoutes = router;