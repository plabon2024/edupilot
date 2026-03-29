import { envVars } from './../config/index';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { Role, UserStatus } from "../../generated/prisma/enums";

import { prisma } from "../lib/prisma";
import { CookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";
import AppError from "../errors/AppError";

export const checkAuth =
  (...authRoles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Get Tokens from Cookies or Authorization Header
      let sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");
      let accessToken = CookieUtils.getCookie(req, "accessToken");

      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        // If it's a JWT (has 2 dots), treat as accessToken, otherwise as sessionToken (for better-auth)
        if (token.split(".").length === 3) {
          if (!accessToken) accessToken = token;
        } else {
          if (!sessionToken) sessionToken = token;
        }
      }

      if (!sessionToken && !accessToken) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized access! No session or access token provided.");
      }

      // 2. Session Token Verification (Better Auth)
      if (sessionToken) {
        const sessionExists = await prisma.session.findFirst({
          where: {
            token: sessionToken,
            expiresAt: {
              gt: new Date(),
            },
          },
          include: {
            user: true,
          },
        });

        if (sessionExists && sessionExists.user) {
          const user = sessionExists.user;

          const now = new Date();
          const expiresAt = new Date(sessionExists.expiresAt);
          const createdAt = new Date(sessionExists.createdAt);

          const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
          const timeRemaining = expiresAt.getTime() - now.getTime();
          const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

          if (percentRemaining < 20) {
            res.setHeader("X-Session-Refresh", "true");
            res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
            res.setHeader("X-Time-Remaining", timeRemaining.toString());

            console.log("Session Expiring Soon!!");
          }

          if (
            user.status === UserStatus.INACTIVE ||
            user.status === UserStatus.SUSPENDED
          ) {
            throw new AppError(
              status.UNAUTHORIZED,
              "Unauthorized access! User is not active.",
            );
          }

          if (user.isDeleted) {
            throw new AppError(
              status.UNAUTHORIZED,
              "Unauthorized access! User is deleted.",
            );
          }

          if (authRoles.length > 0 && !authRoles.includes(user.role)) {
            throw new AppError(
              status.FORBIDDEN,
              "Forbidden access! You do not have permission to access this resource.",
            );
          }
          req.user = {
            userId: user.id,
            role: user.role,
            email: user.email,
          };
        }
      }

      // 3. Access Token Verification (JWT)
      if (accessToken) {
        const verifiedToken = jwtUtils.verifyToken(
          accessToken,
          envVars.ACCESS_TOKEN_SECRET,
        );

        if (verifiedToken.success) {
          // Set req.user from JWT (overwrites or sets initially)
          req.user = {
            userId: verifiedToken.data!.userId as string,
            role: verifiedToken.data!.role as string,
            email: verifiedToken.data!.email as string,
          };
        } else if (!req.user) {
          // If JWT verification failed AND no session user exists, then unauthorized
          throw new AppError(status.UNAUTHORIZED, "Unauthorized access! Invalid access token.");
        }
      }

      // 4. Role Authorization
      if (!req.user) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized access! Please login.");
      }

      if (authRoles.length > 0 && !authRoles.includes(req.user.role as Role)) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden access! You do not have permission to access this resource.",
        );
      }

      next();

    } catch (error: any) {
      next(error);
    }
  };
