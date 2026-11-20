import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema } from "../validators/auth.validator.js";
import { registerController } from "../controllers/auth.controller.js";
import { authRateLimiter } from "../middleware/auth-rate-limit.middleware.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  registerController
);

export default router;