import pool from "../config/db.js";

export const insertComment = async (blogId, userId, content) => {
  const { rows } = await pool.query(
    `INSERT INTO comments (blogid, userid, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [blogId, userId, content]
  );
  return rows[0];
};

export const fetchCommentsByBlog = async (blogId) => {
  const { rows } = await pool.query(
    `SELECT c.commentid, c.content, c.userid, u.name AS username
     FROM comments c
     JOIN users u ON u.userid = c.userid
     WHERE c.blogid = $1 
     ORDER BY c.commentid DESC`,
    [blogId]
  );
  return rows;
};

export const findCommentById = async (commentId) => {
  const { rows } = await pool.query(
    `SELECT * FROM comments WHERE commentid = $1`,
    [commentId]
  );
  return rows[0];
};

export const updateCommentById = async (commentId, content) => {
  const { rows } = await pool.query(
    `UPDATE comments
     SET content = $1
     WHERE commentid = $2
     RETURNING *`,
    [content, commentId]
  );
  return rows[0];
};

export const deleteCommentById = async (commentId) => {
  await pool.query(
    `DELETE FROM comments WHERE commentid = $1`,
    [commentId]
  );
};
