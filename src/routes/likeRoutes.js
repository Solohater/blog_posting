import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { likeBlog, unlikeBlog } from "../controllers/like.controller.js";

const router = express.Router({ mergeParams: true });

// LIKE A BLOG
router.post("/", verifyToken, likeBlog);

// UNLIKE A BLOG
router.delete("/", verifyToken, unlikeBlog);

export default router;
