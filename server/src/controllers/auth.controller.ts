import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";
import { RegisterInput, LoginInput } from "../schemas/auth.schema";

const prisma = new PrismaClient();

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: env.SESSION_MAX_AGE_MS,
});

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body as RegisterInput;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "An account with this email already exists",
        },
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    const expiresAt = new Date(Date.now() + env.SESSION_MAX_AGE_MS);
    const rawToken = jwt.sign(
      { userId: user.id, timestamp: Date.now() },
      env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: rawToken,
        expiresAt,
      },
    });

    // sign final token containing sessionId
    const token = jwt.sign(
      { userId: user.id, sessionId: session.id },
      env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    await prisma.session.update({
      where: { id: session.id },
      data: { token },
    });

    res.cookie("slate_session", token, getCookieOptions());

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        },
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        },
      });
      return;
    }

    const expiresAt = new Date(Date.now() + env.SESSION_MAX_AGE_MS);
    const tempToken = jwt.sign(
      { userId: user.id, timestamp: Date.now() },
      env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: tempToken,
        expiresAt,
      },
    });

    const token = jwt.sign(
      { userId: user.id, sessionId: session.id },
      env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    await prisma.session.update({
      where: { id: session.id },
      data: { token },
    });

    res.cookie("slate_session", token, getCookieOptions());

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.sessionId) {
      await prisma.session.delete({ where: { id: req.sessionId } }).catch(() => {});
    }

    res.clearCookie("slate_session", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      data: {
        message: "Logged out successfully",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // return null user when unauthenticated
    if (!req.user) {
      res.status(200).json({
        success: true,
        data: {
          user: null,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Not authenticated" },
      });
      return;
    }

    const { name, email } = req.body;
    const updateData: { name?: string; email?: string } = {};

    if (name) updateData.name = name;
    if (email && email !== req.user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(409).json({
          success: false,
          error: { code: "CONFLICT", message: "Email already in use" },
        });
        return;
      }
      updateData.email = email;
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: { id: true, email: true, name: true, createdAt: true },
    });

    res.status(200).json({
      success: true,
      data: { user: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Not authenticated" },
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "User not found" },
      });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "Current password is incorrect" },
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // revoke other sessions on password change
    if (req.sessionId) {
      await prisma.session.deleteMany({
        where: {
          userId: user.id,
          id: { not: req.sessionId },
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { message: "Password updated successfully" },
    });
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Not authenticated" },
      });
      return;
    }

    const sessions = await prisma.session.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        currentSessionId: req.sessionId,
        sessions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Not authenticated" },
      });
      return;
    }

    await prisma.session.deleteMany({
      where: { userId: req.user.id },
    });

    res.clearCookie("slate_session", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      data: { message: "Signed out from all devices" },
    });
  } catch (error) {
    next(error);
  }
};
