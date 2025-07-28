import express from "express";
import {
    createGuidance,
    getAllGuidances,
    getGuidanceById,
    updateDocumentTracking,
    updateGuidance
} from "../controller/GuidanceController.js";
import { admin, protect } from "../middleware/authMiddleware.js";
import upload from '../utils/multer.js';

const router = express.Router();

router.post("/post", protect, admin, upload.single("thumbnail"), createGuidance);

router.get("/getall", getAllGuidances);

router.get("/:id", getGuidanceById);

router.put("/:id", protect, admin, updateGuidance);

router.put("/:id", protect, updateDocumentTracking);


export default router;