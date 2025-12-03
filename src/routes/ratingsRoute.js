import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import pool from "../config/db.js";

const router = express.Router({ mergeParams: true });

// POST /blogs/:blogId/ratings
router.post("/", verifyToken, async (req, res) => {
  const blogId = parseInt(req.params.blogId, 10); 
  if (!blogId || blogId <= 0) {
    return res.status(400).json({ message: "Invalid blog id" });
  }

  const { ratingValue } = req.body;
  if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
    return res.status(400).json({ message: "Rating must be 1–5" });
  }

  try {
    // Check if rating exists
    const existing = await pool.query(
      `SELECT * FROM blogratings WHERE blogid = $1 AND userid = $2`,
      [blogId, req.userId]
    );

    if (existing.rows.length > 0) {
      // Update existing rating
      const updated = await pool.query(
        `UPDATE blogratings SET ratingvalue = $1 WHERE ratingid = $2 RETURNING *`,
        [ratingValue, existing.rows[0].ratingid]
      );
      return res.json(updated.rows[0]);
    }

    // Insert new rating
    const newRating = await pool.query(
      `INSERT INTO blogratings (blogid, userid, ratingvalue) VALUES ($1, $2, $3) RETURNING *`,
      [blogId, req.userId, ratingValue]
    );

    return res.json(newRating.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(503).json({ message: "Server error" });
  }
});

export default router;
