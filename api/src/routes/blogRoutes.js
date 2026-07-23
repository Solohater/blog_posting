import express from "express";
import { verifyToken, requireReviewer } from "../middleware/authMiddleware.js";
import {
  getMyDocs,
  getAllDocs,
  getPendingDocs,
  createNewBlog,
  updateExistingBlog,
  deleteBlog,
  passBlog,
  failBlog,
} from "../controllers/blog.controller.js";

const router = express.Router();

router.get("/", verifyToken, getMyDocs);
router.get("/all", verifyToken, requireReviewer, getAllDocs);
router.get("/pending", verifyToken, requireReviewer, getPendingDocs);
router.post("/", verifyToken, createNewBlog);
router.put("/:id", verifyToken, updateExistingBlog);
router.delete("/:id", verifyToken, deleteBlog);
router.post("/:id/pass", verifyToken, requireReviewer, passBlog);
router.post("/:id/fail", verifyToken, requireReviewer, failBlog);

export default router;
