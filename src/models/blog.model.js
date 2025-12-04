import pool from "../config/db.js";

// Get all blogs with user, comments, likes, ratings
export const getAllBlogs = async () => {
  return pool.query(`
    SELECT 
      b.*,
      row_to_json(u) AS user,
      (SELECT json_agg(c) FROM comments c WHERE c.blogid = b.blogid) AS comments,
      (SELECT json_agg(l) FROM likes l WHERE l.blogid = b.blogid) AS likes,
      (SELECT json_agg(r) FROM blogratings r WHERE r.blogid = b.blogid) AS ratings
    FROM blogs b
    LEFT JOIN users u ON u.userid = b.userid
    ORDER BY b.blogid DESC;
  `);
};

// Get blogs by user
export const getBlogsByUser = async (userId) => {
  return pool.query(`
    SELECT 
      b.*,
      row_to_json(u) AS user,
      (SELECT json_agg(c) FROM comments c WHERE c.blogid = b.blogid) AS comments,
      (SELECT json_agg(l) FROM likes l WHERE l.blogid = b.blogid) AS likes,
      (SELECT json_agg(r) FROM blogratings r WHERE r.blogid = b.blogid) AS ratings
    FROM blogs b
    LEFT JOIN users u ON u.userid = b.userid
    WHERE b.userid = $1
    ORDER BY b.blogid DESC;
  `, [userId]);
};

export const createBlog = (title, content, tagId, userId) => {
  return pool.query(
    `INSERT INTO blogs (title, content, tagid, userid)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, content, tagId || null, userId]
  );
};

export const findBlogById = (id) => {
  return pool.query(`SELECT * FROM blogs WHERE blogid = $1`, [id]);
};

export const updateBlog = (id, title, content, tagId) => {
  return pool.query(
    `UPDATE blogs 
     SET title = $1, content = $2, tagid = $3
     WHERE blogid = $4
     RETURNING *`,
    [title, content, tagId || null, id]
  );
};

export const deleteBlogById = (id) => {
  return pool.query(`DELETE FROM blogs WHERE blogid = $1`, [id]);
};
