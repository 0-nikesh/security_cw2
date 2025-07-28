import express from "express";
import {
    createGovernmentProfile,
    deleteGovernmentProfile,
    findNearestLocation,
    getAllGovernmentProfiles,
    getGovernmentProfileById,
    updateGovernmentProfile,
} from "../controller/GovernmentProfileController.js";
import { admin, protect } from "../middleware/authMiddleware.js";
import upload from "../utils/multer.js"; // Use your existing Cloudinary-based multer configuration

const router = express.Router();

router.post("/create", protect, admin, upload.single("thumbnail"), createGovernmentProfile);
router.get("/", protect, getAllGovernmentProfiles);
router.get("/:id", protect, getGovernmentProfileById);
router.put("/:id", protect, admin, upload.single("thumbnail"), updateGovernmentProfile);
router.delete("/:id", protect, admin, deleteGovernmentProfile);
router.get("/nearest", protect, findNearestLocation);

export default router;

