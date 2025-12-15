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
    const blogsResult = await getAllBlogs(); 
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
  try {
    const allowedFields = ["title", "content", "tagId"];
    const receivedFields = Object.keys(req.body);

    // Reject extra/invalid fields
    const invalidFields = receivedFields.filter(f => !allowedFields.includes(f));
    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid fields: ${invalidFields.join(", ")}`,
        allowed: allowedFields
      });
    }

    const { title, content, tagId } = req.body;

    // VALIDATION
    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!content) return res.status(400).json({ message: "Content is required" });
    if (tagId === undefined || tagId === null)
      return res.status(400).json({ message: "tagId is required" });

    if (typeof title !== "string")
      return res.status(400).json({ message: "Title must be a string" });

    if (typeof content !== "string")
      return res.status(400).json({ message: "Content must be a string" });

    if (isNaN(Number(tagId)))
      return res.status(400).json({ message: "tagId must be a number" });

    const result = await createBlog(title.trim(), content.trim(), Number(tagId), req.userId);
    return res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("Create Blog Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateExistingBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = ["title", "content", "tagId"];
    const receivedFields = Object.keys(req.body);

    const invalidFields = receivedFields.filter(f => !allowedFields.includes(f));
    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid fields: ${invalidFields.join(", ")}`,
        allowed: allowedFields
      });
    }

    const { title, content, tagId } = req.body;

    if (title !== undefined && typeof title !== "string")
      return res.status(400).json({ message: "Title must be a string" });

    if (content !== undefined && typeof content !== "string")
      return res.status(400).json({ message: "Content must be a string" });

    if (tagId !== undefined && isNaN(Number(tagId)))
      return res.status(400).json({ message: "tagId must be a number" });

    const { rows } = await findBlogById(id);
    if (rows.length === 0)
      return res.status(404).json({ message: "Blog not found" });

    const blog = rows[0];

    if (blog.userid !== req.userId)
      return res.status(403).json({ message: "Forbidden: only owner can update" });

    const finalTitle = title ?? blog.title;
    const finalContent = content ?? blog.content;
    const finalTagId = tagId ?? blog.tagid;

    const noChange =
      finalTitle.trim() === blog.title &&
      finalContent.trim() === blog.content &&
      Number(finalTagId) === blog.tagid;

    if (noChange) {
      return res.status(200).json({ message: "Nothing updated" });
    }
    
    const updated = await updateBlog(
      id,
      title ?? blog.title,
      content ?? blog.content,
      tagId ?? blog.tagid
    );

    return res.json(updated.rows[0]);

  } catch (err) {
    console.error("Update Blog Error:", err);
    return res.status(500).json({ message: "Server error" });
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
