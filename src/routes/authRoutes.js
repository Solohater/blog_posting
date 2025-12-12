import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  registerUser,
  loginUser,
  getProfile,
  editProfile,
  follow,
  unfollow,
  search
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, editProfile);

router.post("/follow/:id", verifyToken, follow);
router.delete("/unfollow/:id", verifyToken, unfollow);

router.get("/search", search);

export default router;
