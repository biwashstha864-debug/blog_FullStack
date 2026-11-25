import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator.js";
import {
  registerController,
  loginController,
  getMeController,
  refreshController,
  logoutController,
} from "../controllers/auth.controller.js";
import { authRateLimiter } from "../middleware/auth-rate-limit.middleware.js";
import { authenticate } from "../middleware/authenticate.middleware.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  registerController,
);

router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  loginController,
);

router.post("/refresh", authRateLimiter, refreshController);

router.post("/logout", logoutController);

router.get("/me", authenticate, getMeController);

export default router;