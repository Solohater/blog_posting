import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { addComment, getComments, updateComment, deleteComment } from "../controllers/comment.controller.js";

const router = express.Router({ mergeParams: true }); // ← MUST HAVE

// POST /blogs/:blogId/comments
router.post("/", verifyToken, addComment);

// GET /blogs/:blogId/comments
router.get("/", getComments);

// PUT /blogs/:blogId/comments/:commentId
router.put("/:commentId", verifyToken, updateComment);

// DELETE /blogs/:blogId/comments/:commentId
router.delete("/:commentId", verifyToken, deleteComment);

export default router;
