import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

const prisma = new PrismaClient();

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      userId?: string | null;
      sessionId?: string;
    }
  }
}

interface JwtPayload {
  userId: string;
  sessionId: string;
}

// Extracts session token from cookie or authorization header
const extractToken = (req: Request): string | null => {
  if (req.cookies && req.cookies.slate_session) {
    return req.cookies.slate_session;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
};

// Authenticates user and attaches to request if valid
export const authenticateUser = async (req: Request): Promise<AuthUser | null> => {
  const token = extractToken(req);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (!decoded || !decoded.sessionId) return null;

    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!session) return null;

    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    req.user = session.user;
    req.userId = session.user.id;
    req.sessionId = session.id;
    return session.user;
  } catch {
    return null;
  }
};

// Strict middleware requiring authentication
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = await authenticateUser(req);
  if (!user) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required to access this resource",
      },
    });
    return;
  }
  next();
};

// Optional middleware allowing guests while identifying logged-in users
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  await authenticateUser(req);
  if (!req.userId) {
    req.userId = null;
  }
  next();
};
