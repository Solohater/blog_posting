// controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findUserByUsernameOrEmail,
  createUser,
  findUserByUsername,
  getUserById,
  updateUserProfile,
  followUser,
  addToFollowing,
  unfollowUser,
  removeFromFollowing,
  searchUsers,
  searchBlogs
} from "../models/user.model.js";

// --------------------------- REGISTER ---------------------------
export const registerUser = async (req, res) => {
  const { username, email, password, name, bio, role } = req.body;

  try {
    const existingUsers = await findUserByUsernameOrEmail(username, email);

    if (existingUsers.rows.length > 0) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const { rows } = await createUser(
      username,
      email,
      hashedPassword,
      name,
      bio,
      role === "ADMIN" ? "ADMIN" : "USER"
    );

    const newUser = rows[0];

    const token = jwt.sign(
      { userid: newUser.userid, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
};

// --------------------------- LOGIN ---------------------------
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const { rows } = await findUserByUsername(username);

    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = rows[0];

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { userid: user.userid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      message: "You have logged in successfully",
      userid: user.userid,
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
};

// --------------------------- GET PROFILE ---------------------------
export const getProfile = async (req, res) => {
  const userId = parseInt(req.userId, 10);

  try {
    const result = await getUserById(userId);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// --------------------------- EDIT PROFILE ---------------------------
export const editProfile = async (req, res) => {
  const userId = parseInt(req.userId, 10);
  const { name, bio } = req.body;

  try {
    const { rows } = await updateUserProfile(name, bio, userId);
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// --------------------------- FOLLOW ---------------------------
export const follow = async (req, res) => {
  const targetUserId = parseInt(req.params.id, 10);
  const currentUserId = req.userId;

  try {
    await followUser(currentUserId, targetUserId);
    await addToFollowing(currentUserId, targetUserId);

    return res.json({ message: `You are now following user ${targetUserId}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// --------------------------- UNFOLLOW ---------------------------
export const unfollow = async (req, res) => {
  const targetUserId = parseInt(req.params.id, 10);
  const currentUserId = req.userId;

  try {
    await unfollowUser(currentUserId, targetUserId);
    await removeFromFollowing(currentUserId, targetUserId);

    return res.json({ message: `You have unfollowed user ${targetUserId}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// --------------------------- SEARCH ---------------------------
export const search = async (req, res) => {
  const q = req.query.q?.trim();

  if (!q) return res.status(400).json({ message: "Query 'q' required" });

  try {
    const term = `%${q.toLowerCase()}%`;

    const users = await searchUsers(term);
    const blogs = await searchBlogs(term);

    res.json({
      users: users.rows,
      blogs: blogs.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
