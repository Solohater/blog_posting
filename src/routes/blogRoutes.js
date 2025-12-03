import express from "express";
import pool from "../config/db.js"; // Postgres connection
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------------------------
// GET ALL BLOGS (public)
// ---------------------------
router.get("/", async (req, res) => {
  try {
    const blogs = await pool.query(`
      SELECT 
        b.*,
        row_to_json(u) AS user,
        (
          SELECT json_agg(c) 
          FROM comments c 
          WHERE c.blogid = b.blogid
        ) AS comments,
        (
          SELECT json_agg(l)
          FROM likes l
          WHERE l.blogid = b.blogid
        ) AS likes,
        (
          SELECT json_agg(r)
          FROM blogratings r
          WHERE r.blogid = b.blogid
        ) AS ratings
      FROM blogs b
      LEFT JOIN users u ON u.userid = b.userid
      ORDER BY b.blogid DESC;
    `);

    res.json(blogs.rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(503);
  }
});

// ---------------------------
// GET BLOGS BY USER
// ---------------------------
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const blogs = await pool.query(`
      SELECT 
        b.*,
        row_to_json(u) AS user,
        (
          SELECT json_agg(c) 
          FROM comments c 
          WHERE c.blogid = b.blogid
        ) AS comments,
        (
          SELECT json_agg(l)
          FROM likes l
          WHERE l.blogid = b.blogid
        ) AS likes,
        (
          SELECT json_agg(r)
          FROM blogratings r
          WHERE r.blogid = b.blogid
        ) AS ratings
      FROM blogs b
      LEFT JOIN users u ON u.userid = b.userid
      WHERE b.userid = $1
      ORDER BY b.blogid DESC;
    `, [userId]);

    res.json(blogs.rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(503);
  }
});

// ---------------------------
// CREATE BLOG (authenticated)
// ---------------------------
router.post("/", verifyToken, async (req, res) => {
  const { title, content, tagId } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO blogs (title, content, tagid, userid)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, content, tagId || null, req.userId] // <-- userid comes from token
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.sendStatus(503);
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, tagId } = req.body;

  try {
    const { rows } = await pool.query("SELECT * FROM blogs WHERE blogid = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Blog not found" });

    const blog = rows[0];

    if (blog.userid !== req.userId) {
      return res.status(403).json({ message: "Forbidden: only owner can update" });
    }

    const { rows: updatedRows } = await pool.query(
      `UPDATE blogs 
       SET title = $1, content = $2, tagid = $3 
       WHERE blogid = $4
       RETURNING *`,
      [title, content, tagId || null, id]
    );

    res.json(updatedRows[0]);
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});


// ---------------------------
// DELETE BLOG (owner or admin)
// ---------------------------
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const blogCheck = await pool.query(
      "SELECT * FROM blogs WHERE blogid = $1",
      [id]
    );

    if (blogCheck.rows.length === 0)
      return res.status(404).json({ message: "Blog not found" });

    const blog = blogCheck.rows[0];

    if (Number(blog.userid) !== Number(req.userId) && req.userRole !== "ADMIN")
      return res.status(403).json({ message: "Forbidden" });

    await pool.query("DELETE FROM blogs WHERE blogid = $1", [id]);

    res.json({ message: "Blog deleted" });
  } catch (err) {
    console.error(err);
    res.sendStatus(503);
  }
});

export default router;
