import pool from "../config/db.js";

const table = "blogratings";

const columns = {
  id: "ratingid",
  userId: "userid",
  blogId: "blogid",
  value: "ratingvalue",
};

export async function findRating(blogId, userId) {
  const { rows } = await pool.query(
    `SELECT * FROM ${table} WHERE ${columns.blogId} = $1 AND ${columns.userId} = $2`,
    [blogId, userId]
  );
  return rows[0] || null;
}

export async function createRating(blogId, userId, ratingValue) {
  const { rows } = await pool.query(
    `INSERT INTO ${table} (${columns.blogId}, ${columns.userId}, ${columns.value})
     SELECT $1, $2, $3
     WHERE EXISTS (SELECT 1 FROM blogs WHERE blogid = $1)
     RETURNING *`,
    [blogId, userId, ratingValue]
  );
  return rows[0] || null; // always return a single object or null
}

export async function updateRating(ratingId, ratingValue) {
  const { rows } = await pool.query(
    `UPDATE ${table} SET ${columns.value} = $1 WHERE ${columns.id} = $2 RETURNING *`,
    [ratingValue, ratingId]
  );
  return rows[0] || null;
}
