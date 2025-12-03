import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { verifyToken } from "../middleware/authMiddleware.js";


const router = express.Router();

// ---------------------------
// REGISTER
// ---------------------------
router.post("/register", async (req, res) => {
  const { username, email, password, name, bio, role } = req.body;

  try {
    const client = await pool.connect();

    // Check if username or email exists
    const { rows: existingUsers } = await client.query(
      `SELECT * FROM users WHERE username = $1 OR email = $2`,
      [username, email]
    );

    if (existingUsers.length > 0) {
      client.release();
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Create user
    const { rows } = await client.query(
      `INSERT INTO users (username, email, password, name, bio, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING userid, username, email, name, bio, role`,
      [username, email, hashedPassword, name || null, bio || null, role === "ADMIN" ? "ADMIN" : "USER"]
    );

    const newUser = rows[0];

    // Generate JWT
    const token = jwt.sign(
      { userid: newUser.userid, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    client.release();
    res.json({ token, user: newUser });
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});

// ---------------------------
// LOGIN
// ---------------------------
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const client = await pool.connect();

    const { rows } = await client.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );

    if (rows.length === 0) {
      client.release();
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      client.release();
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate token
    const token = jwt.sign(
      { userid: user.userid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    client.release();
    res.json({ token, user });
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
});
//get profile

 // authRoute.js
router.get("/profile", verifyToken, async (req, res) => {
  // Trim any accidental whitespace from the path (optional)
  const cleanedPath = req.path.trim();

  if (cleanedPath !== "/profile") {
    return res.status(404).json({ message: "Not found" });
  }

  const userId = parseInt(req.userId, 10);
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID from token" });
  }

  try {
    const userResult = await pool.query(
      `SELECT userid, name, email, bio, role
       FROM users
       WHERE userid = $1`,
      [userId]
    );

    if (userResult.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    return res.json(userResult.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

//edit profile
router.put("/profile", verifyToken, async (req, res) => {
  const userId = parseInt(req.userId, 10);
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID from token" });
  }

  const { name, bio } = req.body;

  try {
    const updatedResult = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name), bio = COALESCE($2, bio)
       WHERE userid = $3
       RETURNING userid, name, bio, email, role`,
      [name, bio, userId]
    );

    return res.json(updatedResult.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});
 

//follow
router.post("/follow/:id", verifyToken, async (req, res) => {
  const targetUserId = parseInt(req.params.id, 10);
  const currentUserId = req.userId;

  if (!targetUserId || targetUserId === currentUserId) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Add current user to target's followers
    await pool.query(
      `UPDATE users
       SET followers = array_append(followers, $1)
       WHERE userid = $2 AND NOT ($1 = ANY(followers))`,
      [currentUserId, targetUserId]
    );

    // Add target to current user's following
    await pool.query(
      `UPDATE users
       SET following = array_append(following, $1)
       WHERE userid = $2 AND NOT ($1 = ANY(following))`,
      [targetUserId, currentUserId]
    );

    return res.json({ message: `You are now following user ${targetUserId}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

//unfollow
router.delete("/unfollow/:id", verifyToken, async (req, res) => {
  const targetUserId = parseInt(req.params.id, 10);
  const currentUserId = req.userId;

  if (!targetUserId || targetUserId === currentUserId) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Remove current user from target's followers
    await pool.query(
      `UPDATE users
       SET followers = array_remove(followers, $1)
       WHERE userid = $2`,
      [currentUserId, targetUserId]
    );

    // Remove target from current user's following
    await pool.query(
      `UPDATE users
       SET following = array_remove(following, $1)
       WHERE userid = $2`,
      [targetUserId, currentUserId]
    );

    return res.json({ message: `You have unfollowed user ${targetUserId}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});



//search
  router.get("/search", async (req, res) => {
  const q = req.query.q?.trim();

  if (!q) {
    return res.status(400).json({ message: "Query parameter 'q' is required" });
  }

  try {
    const searchTerm = `%${q.toLowerCase()}%`;

    // Search users by name or username
    const userResult = await pool.query(
      `SELECT userid, username, name, bio
       FROM users
       WHERE LOWER(username) LIKE $1
          OR LOWER(name) LIKE $1
       LIMIT 20`,
      [searchTerm]
    );

    // Search blogs by title or content
    const blogResult = await pool.query(
      `SELECT blogid, userid, title, content, tagid
       FROM blogs
       WHERE LOWER(title) LIKE $1
          OR LOWER(content) LIKE $1
          OR (CAST(tagid AS TEXT) LIKE $1)
       LIMIT 20`,
      [searchTerm]
    );

    res.json({
      users: userResult.rows,
      blogs: blogResult.rows,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});





export default router;
