import express from 'express'; // Change 'require' to 'import'
import {
    addComment,
    createPost,
    deletePost,
    getAllPosts,
    getCommentsForPost,
    getPostById,
    getUserPosts,
    likePost
} from '../controller/PostController.js';
import { protect } from '../middleware/authMiddleware.js'; // Change 'require' to 'import'
const router = express.Router();

router.post("/", protect, createPost);
router.get("/all", protect, getAllPosts);
router.get("/:id", getPostById);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, likePost);
router.post("/:id/comment", protect, addComment);
router.get("/:id/comments", protect, getCommentsForPost); // New route for fetching comments


router.get("/user/:userId", protect, getUserPosts); // Get posts for a specific user

export default router;