import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createCheckoutSession,
  verifyPaymentAndEnroll,
  getAllPurchasedCourse,
  getCourseDetailWithPurchaseStatus,
  stripeWebhook,
} from "../controllers/coursePurchase.controller.js";

const router = express.Router();

router.post("/checkout/create-checkout-session", isAuthenticated, createCheckoutSession);
router.post("/webhook", stripeWebhook);
router.get("/verify/:sessionId", isAuthenticated, verifyPaymentAndEnroll);
router.get("/course/:courseId/detail-with-status", isAuthenticated, getCourseDetailWithPurchaseStatus);
router.get("/", isAuthenticated, getAllPurchasedCourse);

export default router;