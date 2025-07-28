import express from "express";
import { getAllFeedback, submitFeedback } from "../controller/FeedbackController.js";
import { admin, protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", protect, submitFeedback);
router.get("/getall", protect, admin, getAllFeedback)

export default router;