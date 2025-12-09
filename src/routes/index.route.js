import express from "express";

// IMPORT ALL ROUTES HERE
import authRoutes from './authRoutes.js'
import blogRoutes from './blogRoutes.js'
import likeRoutes from './likeRoutes.js'
import commentsRoutes from './commentsRoute.js'
import ratingRoutes from './ratingsRoute.js'

const router = express.Router();

// Auth → /auth
router.use("/auth", authRoutes);

// Blogs → /blogs
router.use("/blogs", blogRoutes);

// Likes → /blogs/:blogId/likes
router.use("/blogs/:blogId/likes", likeRoutes);

// Comments → /blogs/:blogId/comments
router.use("/blogs/:blogId/comments", commentsRoutes);

// Ratings → /blogs/:blogId/ratings
router.use("/blogs/:blogId/ratings", ratingRoutes);

export default router;
