import pool from "../config/db.js";

export const checkLikeExists = async (blogId, userId) => {
  const { rows } = await pool.query(
    `SELECT * FROM likes WHERE blogid = $1 AND userid = $2`,
    [blogId, userId]
  );
  return rows.length > 0;
};

export const addLike = async (blogId, userId) => {
  const { rows } = await pool.query(
    `INSERT INTO likes (blogid, userid)
     SELECT $1, $2 WHERE EXISTS 
     ( SELECT 1 FROM blogs WHERE blogid = $1)
     RETURNING *`,
    [blogId, userId]
  );
  return rows[0] || null;
};

export const removeLike = async (blogId, userId) => {
  const { rows } = await pool.query(
    `DELETE FROM likes
     WHERE blogid = $1 AND userid = $2
     RETURNING *`,
    [blogId, userId]
  );
  return rows[0] || null;
};
