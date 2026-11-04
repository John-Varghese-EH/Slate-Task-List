import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getSessions,
  logoutAll,
} from "../controllers/auth.controller";
import { validateBody } from "../middleware/validate";
import { requireAuth, optionalAuth } from "../middleware/auth";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../schemas/auth.schema";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/register", authLimiter, validateBody(registerSchema), register);
router.post("/login", authLimiter, validateBody(loginSchema), login);
router.post("/logout", requireAuth, logout);
router.get("/me", optionalAuth, getMe);
router.patch("/profile", requireAuth, validateBody(updateProfileSchema), updateProfile);
router.post("/change-password", requireAuth, authLimiter, validateBody(changePasswordSchema), changePassword);
router.get("/sessions", requireAuth, getSessions);
router.post("/logout-all", requireAuth, logoutAll);

export default router;
