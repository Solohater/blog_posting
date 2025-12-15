import pool from "../config/db.js";

const table = "comments";

const columns = {
  commentId: "commentid",
  blogId: "blogid",
  userId: "userid",
  content: "content",
};

// Insert a comment only if the blog exists
export async function insertComment(blogId, userId, content) {
  const { rows } = await pool.query(
    `INSERT INTO ${table} (${columns.blogId}, ${columns.userId}, ${columns.content})
     SELECT $1, $2, $3
     WHERE EXISTS (SELECT 1 FROM blogs WHERE blogid = $1)
     RETURNING *`,
    [blogId, userId, content]
  );
  return rows[0] || null;
}

// Fetch all comments for a specific blog
export async function fetchCommentsByBlog(blogId) {
  const { rows } = await pool.query(
    `SELECT c.${columns.commentId}, c.${columns.content}, c.${columns.userId}, u.name AS username
     FROM ${table} c
     JOIN users u ON u.userid = c.userid
     WHERE c.${columns.blogId} = $1
     ORDER BY c.${columns.commentId} DESC`,
    [blogId]
  );
  return rows; // returns an array, empty if no comments
}

// Find a comment by its ID
export async function findCommentById(commentId) {
  const { rows } = await pool.query(
    `SELECT * FROM ${table} WHERE ${columns.commentId} = $1`,
    [commentId]
  );
  return rows[0] || null;
}

// Update comment content by ID
export async function updateCommentById(commentId, content) {
  const { rows } = await pool.query(
    `UPDATE ${table}
     SET ${columns.content} = $1
     WHERE ${columns.commentId} = $2
     RETURNING *`,
    [content, commentId]
  );
  return rows[0] || null;
}

// Delete a comment by ID
export async function deleteCommentById(commentId) {
  const { rows } = await pool.query(
    `DELETE FROM ${table}
     WHERE ${columns.commentId} = $1
     RETURNING *`,
    [commentId]
  );
  return rows[0] || null;
}
