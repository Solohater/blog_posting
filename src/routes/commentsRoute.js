import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  addComment,
  getComments,
  updateComment,
  deleteComment
} from "../controllers/comment.controller.js";

const router = express.Router();

// ADD COMMENT
router.post("/:blogId/comments", verifyToken, addComment);

// GET COMMENTS
router.get("/:blogId/comments", getComments);

// UPDATE COMMENT
router.put("/:blogId/comments/:commentId", verifyToken, updateComment);

// DELETE COMMENT
router.delete("/:blogId/comments/:commentId", verifyToken, deleteComment);

export default router;
