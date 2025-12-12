import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { addOrUpdateRating } from "../controllers/rating.controller.js";

const router = express.Router({ mergeParams: true });

router.post("/", verifyToken, addOrUpdateRating);

export default router;
