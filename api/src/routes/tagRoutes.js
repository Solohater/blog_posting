import express from "express";
import { listTags } from "../controllers/tag.controller.js";

const router = express.Router();

router.get("/", listTags);

export default router;