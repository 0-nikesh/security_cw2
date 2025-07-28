import express from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controller/UserProfileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to get the authenticated user's profile
router.get("/profile", protect, getUserProfile);

// Route to update the authenticated user's profile (with file upload)
router.put("/profile", protect, updateUserProfile);

export default router;
