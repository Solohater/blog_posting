// models/user.model.js
import pool from "../config/db.js";

// ------------------ USER MODEL ------------------

// Find user by username or email
export const findUserByUsernameOrEmail = (username, email) => {
  return pool.query(
    `SELECT * FROM users WHERE username = $1 OR email = $2`,
    [username, email]
  );
};

// Create a new user
export const createUser = (username, email, hashedPassword, name, bio, role) => {
  return pool.query(
    `INSERT INTO users (username, email, password, name, bio, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING userid, username, email, name, bio, role`,
    [username, email, hashedPassword, name || null, bio || null, role]
  );
};

// Find user by username
export const findUserByUsername = (username) => {
  return pool.query(`SELECT * FROM users WHERE username = $1`, [username]);
};

// Get user by ID
export const getUserById = (id) => {
  return pool.query(
    `SELECT userid, name, email, bio, role FROM users WHERE userid = $1`,
    [id]
  );
};

// Update user profile
export const updateUserProfile = (name, bio, userId) => {
  return pool.query(
    `UPDATE users
     SET name = COALESCE($1, name), bio = COALESCE($2, bio)
     WHERE userid = $3
     RETURNING userid, name, bio, email, role`,
    [name, bio, userId]
  );
};

// Follow user
export const followUser = (currentUserId, targetUserId) => {
  return pool.query(
    `UPDATE users
     SET followers = array_append(followers, $1)
     WHERE userid = $2 AND NOT ($1 = ANY(followers))`,
    [currentUserId, targetUserId]
  );
};

// Add to following
export const addToFollowing = (currentUserId, targetUserId) => {
  return pool.query(
    `UPDATE users
     SET following = array_append(following, $1)
     WHERE userid = $2 AND NOT ($1 = ANY(following))`,
    [targetUserId, currentUserId]
  );
};

// Unfollow user
export const unfollowUser = (currentUserId, targetUserId) => {
  return pool.query(
    `UPDATE users
     SET followers = array_remove(followers, $1)
     WHERE userid = $2`,
    [currentUserId, targetUserId]
  );
};

// Remove from following
export const removeFromFollowing = (currentUserId, targetUserId) => {
  return pool.query(
    `UPDATE users
     SET following = array_remove(following, $1)
     WHERE userid = $2`,
    [targetUserId, currentUserId]
  );
};

// Search users
export const searchUsers = (searchTerm) => {
  return pool.query(
    `SELECT userid, username, name, bio
     FROM users
     WHERE LOWER(username) LIKE $1
        OR LOWER(name) LIKE $1
     LIMIT 20`,
    [searchTerm]
  );
};

// Search blogs
export const searchBlogs = (searchTerm) => {
  return pool.query(
    `SELECT blogid, userid, title, content, tagid
     FROM blogs
     WHERE LOWER(title) LIKE $1
        OR LOWER(content) LIKE $1
        OR (CAST(tagid AS TEXT) LIKE $1)
     LIMIT 20`,
    [searchTerm]
  );
};
