import express from "express";
import pool from "../config/db.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ------------------------------------
// ADD COMMENT  →  POST /blogs/:blogId/comments
// ------------------------------------
router.post("/:blogId/comments", verifyToken, async (req, res) => {
  const { blogId } = req.params;
  const { content } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO comments (blogid, userid, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [blogId, req.userId, content]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});
// ------------------------------------
// GET COMMENTS for a blog → GET /blogs/:blogId/comments
// ------------------------------------
router.get("/:blogId/comments", async (req, res) => {
  const { blogId } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.commentid, c.content, c.userid, u.name AS username
       FROM comments c
       JOIN users u ON u.userid = c.userid
       WHERE c.blogid = $1
       ORDER BY c.commentid DESC`,
      [blogId]
    );

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});


// ------------------------------------
// EDIT COMMENT  →  PUT /blogs/:blogId/comments/:commentId
// ------------------------------------
router.put("/:blogId/comments/:commentId", verifyToken, async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    const check = await pool.query(
      "SELECT * FROM comments WHERE commentid = $1",
      [commentId]
    );

    if (check.rows.length === 0)
      return res.status(404).json({ message: "Comment not found" });

    const comment = check.rows[0];

    if (comment.userid !== req.userId)
      return res.status(403).json({ message: "Forbidden" });

    const updated = await pool.query(
      `UPDATE comments 
       SET content = $1 
       WHERE commentid = $2
       RETURNING *`,
      [content, commentId]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

// ------------------------------------
// DELETE COMMENT → DELETE /blogs/:blogId/comments/:commentId
// ------------------------------------
router.delete("/:blogId/comments/:commentId", verifyToken, async (req, res) => {
  const { commentId } = req.params;

  try {
    const check = await pool.query(
      "SELECT * FROM comments WHERE commentid = $1",
      [commentId]
    );

    if (check.rows.length === 0)
      return res.status(404).json({ message: "Comment not found" });

    const comment = check.rows[0];

    if (comment.userid !== req.userId && req.userRole !== "ADMIN")
      return res.status(403).json({ message: "Forbidden" });

    await pool.query(
      "DELETE FROM comments WHERE commentid = $1",
      [commentId]
    );

    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

export default router;
