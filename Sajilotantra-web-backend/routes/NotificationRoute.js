import express from "express";
import { createNotification, getNotifications } from "../controller/NotificationController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/all", protect, getNotifications);
router.post("/post", protect, admin, createNotification)

export default router;