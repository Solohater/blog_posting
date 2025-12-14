import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { addComment, getComments, updateComment, deleteComment } from "../controllers/comment.controller.js";

const router = express.Router({ mergeParams: true }); 

router.post("/", verifyToken, addComment);

router.get("/", getComments);

router.put("/:commentId", verifyToken, updateComment);

router.delete("/:commentId", verifyToken, deleteComment);

export default router;
