import pool from "../config/db.js";

const table = "blogs";
const columns = {
  id: "blogid",
  userId: "userid",
  title: "title",
  content: "content",
  tagId: "tagid",
};

// ---------------- GET ALL BLOGS ----------------
export const getAllBlogs = () => {
  return pool.query(`
    SELECT 
      b.*,
      row_to_json(u) AS user,
      (SELECT json_agg(c) FROM comments c WHERE c.blogid = b.blogid) AS comments,
      (SELECT json_agg(l) FROM likes l WHERE l.blogid = b.blogid) AS likes,
      (SELECT json_agg(r) FROM blogratings r WHERE r.blogid = b.blogid) AS ratings
    FROM ${table} b
    LEFT JOIN users u ON u.userid = b.userid
    ORDER BY b.${columns.id} DESC;
  `);
};

// ---------------- GET BLOGS BY USER ----------------
export const getBlogsByUser = (userId) => {
  return pool.query(`
    SELECT 
      b.*,
      row_to_json(u) AS user,
      (SELECT json_agg(c) FROM comments c WHERE c.blogid = b.blogid) AS comments,
      (SELECT json_agg(l) FROM likes l WHERE l.blogid = b.blogid) AS likes,
      (SELECT json_agg(r) FROM blogratings r WHERE r.blogid = b.blogid) AS ratings
    FROM ${table} b
    LEFT JOIN users u ON u.userid = b.userid
    WHERE b.${columns.userId} = $1
    ORDER BY b.${columns.id} DESC;
  `, [userId]);
};

// ---------------- CREATE BLOG ----------------
export const createBlog = (title, content, tagId, userId) => {
  return pool.query(
    `INSERT INTO ${table} 
       (${columns.title}, ${columns.content}, ${columns.tagId}, ${columns.userId})
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, content, tagId || null, userId]
  );
};

// ---------------- FIND BLOG BY ID ----------------
export const findBlogById = (id) => {
  return pool.query(
    `SELECT * FROM ${table} WHERE ${columns.id} = $1`,
    [id]
  );
};

// ---------------- UPDATE BLOG ----------------
export const updateBlog = (id, title, content, tagId) => {
  return pool.query(
    `UPDATE ${table}
     SET ${columns.title} = $1,
         ${columns.content} = $2,
         ${columns.tagId} = $3
     WHERE ${columns.id} = $4
     RETURNING *`,
    [title, content, tagId || null, id]
  );
};

// ---------------- DELETE BLOG ----------------
export const deleteBlogById = (id) => {
  return pool.query(
    `DELETE FROM ${table} WHERE ${columns.id} = $1`,
    [id]
  );
};
