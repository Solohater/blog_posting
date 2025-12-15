import pool from "../config/db.js";

const table = "likes";

const columns = {
  blogId: "blogid",
  userId: "userid",
};

export async function checkLikeExists(blogId, userId) {
  const { rows } = await pool.query(
    `SELECT * FROM ${table} WHERE ${columns.blogId} = $1 AND ${columns.userId} = $2`,
    [blogId, userId]
  );
  return rows.length > 0; // returns true if like exists, false otherwise
}

export async function addLike(blogId, userId) {
  const { rows } = await pool.query(
    `INSERT INTO ${table} (${columns.blogId}, ${columns.userId})
     SELECT $1, $2
     WHERE EXISTS (SELECT 1 FROM blogs WHERE blogid = $1)
     RETURNING *`,
    [blogId, userId]
  );
  return rows[0] || null; // returns the newly inserted like or null if blog doesn't exist
}

export async function removeLike(blogId, userId) {
  const { rows } = await pool.query(
    `DELETE FROM ${table}
     WHERE ${columns.blogId} = $1 AND ${columns.userId} = $2
     RETURNING *`,
    [blogId, userId]
  );
  return rows[0] || null; // returns the removed like or null if it didn't exist
}
