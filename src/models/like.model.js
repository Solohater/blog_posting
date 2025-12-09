import pool from "../config/db.js";

// ---------------- CHECK IF LIKE EXISTS ----------------
export const checkLikeExists = async (blogId, userId) => {
  const { rows } = await pool.query(
    `SELECT * FROM likes WHERE blogid = $1 AND userid = $2`,
    [blogId, userId]
  );
  return rows.length > 0;
};

// ---------------- ADD LIKE ----------------
export const addLike = async (blogId, userId) => {
  const { rows } = await pool.query(
    `INSERT INTO likes (blogid, userid)
     VALUES ($1, $2)
     RETURNING *`,
    [blogId, userId]
  );
  return rows[0];
};

// ---------------- REMOVE LIKE ----------------
export const removeLike = async (blogId, userId) => {
  const { rows } = await pool.query(
    `DELETE FROM likes
     WHERE blogid = $1 AND userid = $2
     RETURNING *`,
    [blogId, userId]
  );
  return rows[0] || null;
};
