import pool from "../config/db.js";

// ---------------- FIND RATING ----------------
export const findRating = async (blogId, userId) => {
  const { rows } = await pool.query(
    `SELECT * FROM blogratings WHERE blogid = $1 AND userid = $2`,
    [blogId, userId]
  );
  return rows[0] || null;
};

// ---------------- CREATE RATING ----------------
export const createRating = async (blogId, userId, ratingValue) => {
  const { rows } = await pool.query(
    `INSERT INTO blogratings (blogid, userid, ratingvalue)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [blogId, userId, ratingValue]
  );
  return rows[0];
};

// ---------------- UPDATE RATING ----------------
export const updateRating = async (ratingId, ratingValue) => {
  const { rows } = await pool.query(
    `UPDATE blogratings 
     SET ratingvalue = $1 
     WHERE ratingid = $2
     RETURNING *`,
    [ratingValue, ratingId]
  );
  return rows[0];
};
