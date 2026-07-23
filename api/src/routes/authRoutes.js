import express from "express";
import { verifyToken, requireReviewer } from "../middleware/authMiddleware.js";
import {
  registerUser, loginUser, getProfile, editProfile,
  promoteToReviewer, demoteToUser,
  follow, unfollow, search
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, editProfile);
router.post("/promote/:id", verifyToken, requireReviewer, promoteToReviewer);
router.post("/demote/:id", verifyToken, requireReviewer, demoteToUser);
router.post("/follow/:id", verifyToken, follow);
router.delete("/unfollow/:id", verifyToken, unfollow);
router.get("/search", search);

export default router;
