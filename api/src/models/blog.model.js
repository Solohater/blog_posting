import pool from "../config/db.js";

const table = "blogs";
const columns = {
  id: "blogid",
  userId: "userid",
  title: "title",
  content: "content",
  tagId: "tagid",
  status: "status",
};

function buildBlogQuery(whereClause = "1=1", order = "b.blogid DESC") {
  return `
    SELECT b.*,
      row_to_json(u) AS "user",
      (SELECT COALESCE(json_agg(c ORDER BY c.commentid DESC), '[]'::json) FROM comments c WHERE c.blogid = b.blogid) AS comments,
      (SELECT COALESCE(json_agg(l), '[]'::json) FROM likes l WHERE l.blogid = b.blogid) AS likes,
      (SELECT COALESCE(json_agg(r), '[]'::json) FROM blogratings r WHERE r.blogid = b.blogid) AS ratings
    FROM ${table} b
    LEFT JOIN users u ON u.userid = b.userid
    WHERE ${whereClause}
    ORDER BY ${order}
  `;
}

export const getMyBlogs = (userId, status) => {
  const where = status
    ? `b.userid = $1 AND b.status = $2`
    : `b.userid = $1`;
  const params = status ? [userId, status] : [userId];
  return pool.query(buildBlogQuery(where), params);
};

export const getAllBlogsForReviewer = (status) => {
  const where = status ? `b.status = $1` : "1=1";
  const params = status ? [status] : [];
  return pool.query(buildBlogQuery(where), params);
};

export const getPendingBlogsForReviewer = () => {
  return pool.query(buildBlogQuery(`b.status = 'pending'`));
};

export const createBlog = (title, content, tagId, userId) => {
  return pool.query(
    `INSERT INTO ${table}
       (${columns.title}, ${columns.content}, ${columns.tagId}, ${columns.userId}, ${columns.status})
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [title, content, tagId || null, userId]
  );
};

export const findBlogById = (id) => {
  return pool.query(`SELECT * FROM ${table} WHERE ${columns.id} = $1`, [id]);
};

export const updateBlog = (id, title, content, tagId) => {
  return pool.query(
    `UPDATE ${table}
     SET ${columns.title} = $1, ${columns.content} = $2, ${columns.tagId} = $3, ${columns.status} = 'pending'
     WHERE ${columns.id} = $4
     RETURNING *`,
    [title, content, tagId || null, id]
  );
};

export const deleteBlogById = (id) => {
  return pool.query(`DELETE FROM ${table} WHERE ${columns.id} = $1`, [id]);
};

export const reviewBlog = (id, status) => {
  return pool.query(
    `UPDATE ${table} SET ${columns.status} = $1 WHERE ${columns.id} = $2 RETURNING *`,
    [status, id]
  );
};
