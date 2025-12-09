import pool from "../config/db.js";

const table = "users";

const columns = {
  id: "userid",
  username: "username",
  email: "email",
  password: "password",
  name: "name",
  bio: "bio",
  role: "role",
  followers: "followers",
  following: "following",
};

// ---------------- FIND BY USERNAME OR EMAIL ----------------
export function findUserByUsernameOrEmail(username, email) {
  return pool.query(
    `SELECT * FROM ${table} 
     WHERE ${columns.username} = $1 
        OR ${columns.email} = $2`,
    [username, email]
  );
}

// ---------------- CREATE USER ----------------
export function createUser(username, email, hashedPassword, name, bio, role) {
  return pool.query(
    `INSERT INTO ${table} 
       (${columns.username}, ${columns.email}, ${columns.password}, ${columns.name}, ${columns.bio}, ${columns.role})
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${columns.id}, ${columns.username}, ${columns.email}, ${columns.name}, ${columns.bio}, ${columns.role}`,
    [username, email, hashedPassword, name || null, bio || null, role]
  );
}

// ---------------- FIND BY USERNAME ----------------
export function findUserByUsername(username) {
  return pool.query(
    `SELECT * FROM ${table} WHERE ${columns.username} = $1`,
    [username]
  );
}

// ---------------- GET USER BY ID ----------------
export function getUserById(id) {
  return pool.query(
    `SELECT ${columns.id}, ${columns.name}, ${columns.email}, ${columns.bio}, ${columns.role}
       FROM ${table}
       WHERE ${columns.id} = $1`,
    [id]
  );
}

// ---------------- UPDATE PROFILE ----------------
export function updateUserProfile(name, bio, userId) {
  return pool.query(
    `UPDATE ${table}
     SET ${columns.name} = COALESCE($1, ${columns.name}),
         ${columns.bio} = COALESCE($2, ${columns.bio})
     WHERE ${columns.id} = $3
     RETURNING ${columns.id}, ${columns.name}, ${columns.bio}, ${columns.email}, ${columns.role}`,
    [name, bio, userId]
  );
}

// ---------------- FOLLOW USER ----------------
export function followUser(currentUserId, targetUserId) {
  return pool.query(
    `UPDATE ${table}
     SET ${columns.followers} = array_append(${columns.followers}, $1)
     WHERE ${columns.id} = $2 
       AND NOT ($1 = ANY(${columns.followers}))`,
    [currentUserId, targetUserId]
  );
}

// ---------------- ADD TO FOLLOWING ----------------
export function addToFollowing(currentUserId, targetUserId) {
  return pool.query(
    `UPDATE ${table}
     SET ${columns.following} = array_append(${columns.following}, $1)
     WHERE ${columns.id} = $2 
       AND NOT ($1 = ANY(${columns.following}))`,
    [targetUserId, currentUserId]
  );
}

// ---------------- UNFOLLOW ----------------
export function unfollowUser(currentUserId, targetUserId) {
  return pool.query(
    `UPDATE ${table}
     SET ${columns.followers} = array_remove(${columns.followers}, $1)
     WHERE ${columns.id} = $2`,
    [currentUserId, targetUserId]
  );
}

// ---------------- REMOVE FROM FOLLOWING ----------------
export function removeFromFollowing(currentUserId, targetUserId) {
  return pool.query(
    `UPDATE ${table}
     SET ${columns.following} = array_remove(${columns.following}, $1)
     WHERE ${columns.id} = $2`,
    [targetUserId, currentUserId]
  );
}

// ---------------- SEARCH USERS ----------------
export function searchUsers(searchTerm) {
  return pool.query(
    `SELECT ${columns.id}, ${columns.username}, ${columns.name}, ${columns.bio}
     FROM ${table}
     WHERE LOWER(${columns.username}) LIKE $1
        OR LOWER(${columns.name}) LIKE $1
     LIMIT 20`,
    [searchTerm]
  );
}

// ---------------- SEARCH BLOGS ----------------
export function searchBlogs(searchTerm) {
  return pool.query(
    `SELECT blogid, userid, title, content, tagid
     FROM blogs
     WHERE LOWER(title) LIKE $1
        OR LOWER(content) LIKE $1
        OR CAST(tagid AS TEXT) LIKE $1
     LIMIT 20`,
    [searchTerm]
  );
}
