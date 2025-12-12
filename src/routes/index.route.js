import express from "express";

// IMPORT ALL ROUTES HERE
import authRoutes from './authRoutes.js'
import blogRoutes from './blogRoutes.js'
import likeRoutes from './likeRoutes.js'
import commentsRoutes from './commentsRoute.js'
import ratingRoutes from './ratingsRoute.js'

const router = express.Router();

router.use("/auth", authRoutes);

router.use("/blogs", blogRoutes);

router.use("/blogs/:blogId/likes", likeRoutes);

router.use("/blogs/:blogId/comments", commentsRoutes);

router.use("/blogs/:blogId/ratings", ratingRoutes);

export default router;
