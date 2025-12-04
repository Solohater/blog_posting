import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

import {
  getBlogs,
  getUserBlogs,
  createNewBlog,
  updateExistingBlog,
  deleteBlog
} from "../controllers/blog.controller.js";

const router = express.Router();

router.get("/", getBlogs);
router.get("/user/:userId", getUserBlogs);
router.post("/", verifyToken, createNewBlog);
router.put("/:id", verifyToken, updateExistingBlog);
router.delete("/:id", verifyToken, deleteBlog);

export default router;
