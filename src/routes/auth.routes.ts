import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema } from "../validators/auth.validator.js";
import { registerController } from "../controllers/auth.controller.js";
import { authRateLimiter } from "../middleware/auth-rate-limit.middleware.js";
import { loginSchema } from "../validators/auth.validator.js";
import { loginController } from "../controllers/auth.controller.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  registerController
);

router.post(
    "/login",
    validate(loginSchema),
    loginController
)

export default router;