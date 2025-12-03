import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import pool from "../config/db.js";

const router = express.Router({ mergeParams: true }); // <-- important!

// LIKE A BLOG
router.post("/", verifyToken, async (req, res) => {
  const blogId = parseInt(req.params.blogId, 10);

  if (isNaN(blogId)) {
    return res.status(400).json({ message: "Invalid blog id" });
  }

  try {
    const check = await pool.query(
      `SELECT * FROM likes WHERE blogid = $1 AND userid = $2`,
      [blogId, req.userId]
    );

    if (check.rows.length > 0)
      return res.status(400).json({ message: "You already liked this blog" });

    const like = await pool.query(
      `INSERT INTO likes (blogid, userid) VALUES ($1, $2) RETURNING *`,
      [blogId, req.userId]
    );

    res.json(like.rows[0]);
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

// UNLIKE A BLOG
router.delete("/", verifyToken, async (req, res) => {
  const blogId = parseInt(req.params.blogId, 10);

  if (isNaN(blogId)) {
    return res.status(400).json({ message: "Invalid blog id" });
  }

  try {
    const deleted = await pool.query(
      `DELETE FROM likes WHERE blogid = $1 AND userid = $2 RETURNING *`,
      [blogId, req.userId]
    );

    if (deleted.rows.length === 0)
      return res.status(404).json({ message: "Like not found" });

    res.json({ message: "Like removed" });
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

export default router;
