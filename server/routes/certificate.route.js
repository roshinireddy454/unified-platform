import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  generateCertificate,
  getMyCertificates,
  verifyCertificate,
} from "../controllers/certificate.controller.js";

const router = express.Router();

router.post("/generate/:courseId", isAuthenticated, generateCertificate);
router.get("/my", isAuthenticated, getMyCertificates);
router.get("/verify/:certificateId", verifyCertificate); // public

export default router;