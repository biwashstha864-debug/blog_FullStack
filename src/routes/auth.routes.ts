import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";
import {
  registerController,
  loginController,
  getMeController,
  refreshController,
  logoutController,
  logoutAllController,
  changePasswordController,
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

router.post("/logout-all", authenticate, logoutAllController);

router.patch(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  changePasswordController,
);


router.get("/me", authenticate, getMeController);



export default router;