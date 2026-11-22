import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema } from "../validators/auth.validator.js";
import {
  registerController,
  loginController,
  getMeController,
} from "../controllers/auth.controller.js";
import { authRateLimiter } from "../middleware/auth-rate-limit.middleware.js";
import { loginSchema } from "../validators/auth.validator.js";
import { authenticate } from "../middleware/authenticate.middleware.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  registerController,
);

router.post("/login", authRateLimiter, validate(loginSchema), loginController);

router.get("/me", authenticate, getMeController);

export default router;
