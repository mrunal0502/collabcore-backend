import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  forgotPasswordRequest,
  resetForgotPassword,
  verifyEmail,
  resendEmailVerificationLink,
  changeCurrentPassword,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import express, { Router } from "express";
import {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userResetForgotPasswordValidator,
  userForgotPasswordValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router
  .route("/reset-password/:token")
  .post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

// Protected routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/resend-verification-email")
  .post(verifyJWT, resendEmailVerificationLink);
router
  .route("/change-password")
  .post(
    verifyJWT,
    userChangeCurrentPasswordValidator(),
    validate,
    changeCurrentPassword,
  );

export default router;
