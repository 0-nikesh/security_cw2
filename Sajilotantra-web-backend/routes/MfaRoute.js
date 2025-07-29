import express from "express";
import { generateMfaSecret, verifyMfaToken } from "../controller/MfaController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to generate MFA secret and QR code (protected)
router.post("/setup", protect, generateMfaSecret);

// Route to verify MFA token (protected)
router.post("/verify", protect, verifyMfaToken);

export default router;
