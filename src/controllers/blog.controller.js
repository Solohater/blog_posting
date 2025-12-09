import {
  getAllBlogs,
  getBlogsByUser,
  createBlog,
  findBlogById,
  updateBlog,
  deleteBlogById
} from "../models/blog.model.js";

export const getBlogs = async (req, res) => {
  try {
    const blogsResult = await getAllBlogs(); // full query result
    const blogs = blogsResult.rows.map(blog => ({
      blogid: blog.blogid,
      userid: blog.userid,
      title: blog.title,
      content: blog.content,
      tagid: blog.tagid
    }));
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.sendStatus(503);
  }
};

export const getUserBlogs = async (req, res) => {
  try {
    const blogs = await getBlogsByUser(req.params.userId);
    res.json(blogs.rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(503);
  }
};

export const createNewBlog = async (req, res) => {
  const { title, content, tagId } = req.body;

  try {
    const result = await createBlog(title, content, tagId, req.userId);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.sendStatus(503);
  }
};

export const updateExistingBlog = async (req, res) => {
  const { id } = req.params;
  const { title, content, tagId } = req.body;

  try {
    const { rows } = await findBlogById(id);
    if (rows.length === 0) return res.status(404).json({ message: "Blog not found" });

    const blog = rows[0];

    if (blog.userid !== req.userId)
      return res.status(403).json({ message: "Forbidden: only owner can update" });

    const updated = await updateBlog(id, title, content, tagId);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.sendStatus(503);
  }
};

export const deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const blogCheck = await findBlogById(id);

    if (blogCheck.rows.length === 0)
      return res.status(404).json({ message: "Blog not found" });

    const blog = blogCheck.rows[0];

    if (Number(blog.userid) !== Number(req.userId) && req.userRole !== "ADMIN")
      return res.status(403).json({ message: "Forbidden" });

    await deleteBlogById(id);

    res.json({ message: "Blog deleted" });
  } catch (err) {
    console.error(err);
    res.sendStatus(503);
  }
};
