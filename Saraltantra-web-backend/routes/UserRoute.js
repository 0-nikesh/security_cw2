import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getProfile,
  getUserById,
  getUserProfilePost,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updateUserProfile,
  verifyOtp,
} from '../controller/UserController.js';
import { admin, protect } from '../middleware/authMiddleware.js';
import upload from '../utils/multer.js';

const router = express.Router();

router.post("/register", upload.single("profileImage"), registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);

router.get("/all", protect, admin, getAllUsers);
router.get("/:id", protect, getUserById);
router.delete("/:id", protect, admin, deleteUser);
router.get("/profile", protect, getProfile); // ✅ Define this first
router.get("/:id", protect, getUserById);
router.put("/profile", protect, updateUserProfile);

router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

router.get("/:id/profile", protect, getUserProfilePost); // Get user profile info only

export default router;
