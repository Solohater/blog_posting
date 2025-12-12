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


export const registerUser = async (req, res) => {
  try {
    const { username, email, password, name, bio, role } = req.body;

    //VALIDATION 
    if (!username) return res.status(400).json({ message: "Username is required" });
    if (!email)    return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    if (typeof username !== "string") return res.status(400).json({ message: "Username must be a string" });
    if (typeof email !== "string")    return res.status(400).json({ message: "Email must be a string" });
    if (typeof password !== "string") return res.status(400).json({ message: "Password must be a string" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    // Check if username/email already exists
    const existingUsers = await findUserByUsernameOrEmail(username, email);
    if (existingUsers.rows.length > 0) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    // Create user
    const hashedPassword = bcrypt.hashSync(password, 8);

    const { rows } = await createUser(
      username,
      email,
      hashedPassword,
      name || "",
      bio || "",
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
    console.error("Register Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // STRICT FIELD CHECK 
    const allowedFields = ["username", "password"];
    const bodyFields = Object.keys(req.body);

    for (const field of bodyFields) {
      if (!allowedFields.includes(field)) {
        return res.status(400).json({
          message: `Invalid field: '${field}'. Only 'username' and 'password' are allowed`
        });
      }
    }

    // VALIDATION
    if (!username)
      return res.status(400).json({ message: "Username is required" });

    if (!password)
      return res.status(400).json({ message: "Password is required" });

    if (typeof username !== "string")
      return res.status(400).json({ message: "Username must be a string" });

    if (typeof password !== "string")
      return res.status(400).json({ message: "Password must be a string" });

    // FETCH USER 
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

    return res.status(200).json({
      token,
      message: "You have logged in successfully",
      userid: user.userid,
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = parseInt(req.userId, 10);

    if (isNaN(userId))
      return res.status(400).json({ message: "Invalid user ID" });

    const result = await getUserById(userId);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    return res.json(result.rows[0]);

  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = parseInt(req.userId, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid or missing user ID" });
    }

    const allowedFields = ["name", "bio"];
    const payload = {};

    // Only accept allowed fields
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }

    // Reject unknown fields
    const unknownKeys = Object.keys(req.body).filter(
      key => !allowedFields.includes(key)
    );
    if (unknownKeys.length > 0) {
      return res.status(400).json({
        message: "Invalid fields sent",
        invalidFields: unknownKeys
      });
    }

    // Must send at least one allowed field
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ message: "No valid fields provided" });
    }

    // Validation checks
    if (payload.name !== undefined) {
      if (typeof payload.name !== "string")
        return res.status(400).json({ message: "Name must be a string" });

      if (payload.name.trim().length < 2)
        return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    if (payload.bio !== undefined) {
      if (typeof payload.bio !== "string")
        return res.status(400).json({ message: "Bio must be a string" });

      if (payload.bio.length > 300)
        return res.status(400).json({ message: "Bio cannot exceed 300 characters" });
    }

    // SQL update only for fields that exist
    const { rows } = await updateUserProfile(payload, userId);

    return res.status(200).json({
      message: "Profile updated successfully",
      user: rows[0]
    });

  } catch (error) {
    console.error("Edit Profile Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const follow = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const currentUserId = req.userId;

    // VALIDATION 
    if (isNaN(targetUserId))
      return res.status(400).json({ message: "Invalid target user ID" });

    if (targetUserId === currentUserId)
      return res.status(400).json({ message: "You cannot follow yourself" });

    await followUser(currentUserId, targetUserId);
    await addToFollowing(currentUserId, targetUserId);

    return res.json({ message: `You are now following user ${targetUserId}` });

  } catch (error) {
    console.error("Follow Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const unfollow = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const currentUserId = req.userId;

    if (isNaN(targetUserId))
      return res.status(400).json({ message: "Invalid target user ID" });

    if (targetUserId === currentUserId)
      return res.status(400).json({ message: "You cannot unfollow yourself" });

    await unfollowUser(currentUserId, targetUserId);
    await removeFromFollowing(currentUserId, targetUserId);

    return res.json({ message: `You have unfollowed user ${targetUserId}` });

  } catch (error) {
    console.error("Unfollow Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const search = async (req, res) => {
  try {
    const q = req.query.q?.trim();

    if (!q)
      return res.status(400).json({ message: "Query 'q' is required" });

    const term = `%${q.toLowerCase()}%`;

    const users = await searchUsers(term);
    const blogs = await searchBlogs(term);

    return res.json({
      users: users.rows,
      blogs: blogs.rows
    });

  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
