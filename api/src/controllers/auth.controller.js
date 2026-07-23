import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findUserByUsernameOrEmail,
  createUser,
  findUserByUsername,
  getUserById,
  updateUserProfile,
  countUsers,
  updateUserRole,
  followUser,
  addToFollowing,
  unfollowUser,
  removeFromFollowing,
  searchUsers,
  searchBlogs,
  getUserByIdPublic,
} from "../models/user.model.js";

function sanitize(str) {
  if (typeof str !== "string") return str;
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

function sanitizeUser(user) {
  if (!user) return user;
  const { password, ...rest } = user;
  return rest;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, name, bio } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "Username, email, and password are required" });

    if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string")
      return res.status(400).json({ message: "Fields must be strings" });

    if (username.length < 3) return res.status(400).json({ message: "Username must be at least 3 characters" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    if (!isValidEmail(email)) return res.status(400).json({ message: "Invalid email format" });

    const existing = await findUserByUsernameOrEmail(username, email);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: "Username or email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const cleanName = name ? sanitize(name.trim()) : "";
    const cleanBio = bio ? sanitize(bio.trim()) : "";

    const { rows: countRows } = await countUsers();
    const isFirstUser = countRows[0].count === 0;
    const role = isFirstUser ? "REVIEWER" : "USER";

    const { rows } = await createUser(
      username, email, hashedPassword,
      cleanName, cleanBio, role
    );

    const newUser = rows[0];
    const token = jwt.sign(
      { userid: newUser.userid, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({ token, user: sanitizeUser(newUser) });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const allowedFields = ["username", "password"];
    for (const field of Object.keys(req.body)) {
      if (!allowedFields.includes(field))
        return res.status(400).json({ message: `Invalid field: '${field}'` });
    }

    if (!username || !password)
      return res.status(400).json({ message: "Username and password are required" });
    if (typeof username !== "string" || typeof password !== "string")
      return res.status(400).json({ message: "Fields must be strings" });

    const { rows } = await findUserByUsername(username);
    if (rows.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userid: user.userid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      token, message: "You have logged in successfully", userid: user.userid,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = parseInt(req.userId, 10);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });

    const result = await getUserById(userId);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.json(sanitizeUser(result.rows[0]));
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = parseInt(req.userId, 10);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });

    const allowedFields = ["name", "bio"];
    for (const key of Object.keys(req.body)) {
      if (!allowedFields.includes(key))
        return res.status(400).json({ message: `Invalid field: '${key}'` });
    }

    const { name, bio } = req.body;
    if (Object.keys(req.body).length === 0)
      return res.status(400).json({ message: "No fields provided" });

    if (name !== undefined) {
      if (typeof name !== "string") return res.status(400).json({ message: "Name must be a string" });
      if (name.trim().length < 2) return res.status(400).json({ message: "Name must be at least 2 characters" });
    }
    if (bio !== undefined) {
      if (typeof bio !== "string") return res.status(400).json({ message: "Bio must be a string" });
      if (bio.length > 300) return res.status(400).json({ message: "Bio cannot exceed 300 characters" });
    }

    const cleanName = name ? sanitize(name.trim()) : undefined;
    const cleanBio = bio ? sanitize(bio.trim()) : undefined;

    const { rows } = await updateUserProfile(cleanName, cleanBio, userId);
    res.status(200).json({
      message: "Profile updated successfully",
      user: sanitizeUser(rows[0]),
    });
  } catch (error) {
    console.error("Edit Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const promoteToReviewer = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    if (isNaN(targetUserId)) return res.status(400).json({ message: "Invalid user ID" });

    const { rows } = await updateUserRole(targetUserId, "REVIEWER");
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User promoted to reviewer", user: sanitizeUser(rows[0]) });
  } catch (error) {
    console.error("Promote Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const demoteToUser = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    if (isNaN(targetUserId)) return res.status(400).json({ message: "Invalid user ID" });

    const { rows } = await updateUserRole(targetUserId, "USER");
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User demoted to user", user: sanitizeUser(rows[0]) });
  } catch (error) {
    console.error("Demote Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const follow = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const currentUserId = req.userId;

    if (isNaN(targetUserId)) return res.status(400).json({ message: "Invalid target user ID" });
    if (targetUserId === currentUserId) return res.status(400).json({ message: "You cannot follow yourself" });

    const target = await getUserByIdPublic(targetUserId);
    if (!target) return res.status(404).json({ message: "User not found" });

    await followUser(currentUserId, targetUserId);
    await addToFollowing(currentUserId, targetUserId);

    res.json({ message: "You are now following this user" });
  } catch (error) {
    console.error("Follow Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const unfollow = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const currentUserId = req.userId;

    if (isNaN(targetUserId)) return res.status(400).json({ message: "Invalid target user ID" });
    if (targetUserId === currentUserId) return res.status(400).json({ message: "You cannot unfollow yourself" });

    await unfollowUser(currentUserId, targetUserId);
    await removeFromFollowing(currentUserId, targetUserId);

    res.json({ message: "You have unfollowed this user" });
  } catch (error) {
    console.error("Unfollow Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const search = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.status(400).json({ message: "Query 'q' is required" });

    const term = `%${sanitize(q.toLowerCase())}%`;
    const [users, blogs] = await Promise.all([
      searchUsers(term),
      searchBlogs(term),
    ]);

    res.json({
      users: users.rows.map(sanitizeUser),
      blogs: blogs.rows,
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
