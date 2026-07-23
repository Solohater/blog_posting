import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { likeBlog, unlikeBlog } from "../controllers/like.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/", verifyToken, likeBlog);

router.delete("/", verifyToken, unlikeBlog);

export default router;
