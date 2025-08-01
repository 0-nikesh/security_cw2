import express from "express";
import { initiatePayment, verifyPayment } from "../controller/PaymentController.js";

const router = express.Router();

// Route to initiate payment
router.post("/initiate", initiatePayment);

// Route to verify payment
router.post("/verify", verifyPayment);

export default router;
