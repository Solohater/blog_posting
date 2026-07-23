import {
  getMyBlogs,
  getAllBlogsForReviewer,
  getPendingBlogsForReviewer,
  createBlog,
  findBlogById,
  updateBlog,
  deleteBlogById,
  reviewBlog,
} from "../models/blog.model.js";

function sanitize(str) {
  if (typeof str !== "string") return str;
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function mapBlog(b) {
  return {
    blogid: b.blogid,
    userid: b.userid,
    title: b.title,
    content: b.content,
    tagid: b.tagid,
    status: b.status,
    user: b.user,
    comments: b.comments || [],
    likes: b.likes || [],
    ratings: b.ratings || [],
  };
}

export const getMyDocs = async (req, res) => {
  try {
    const status = req.query.status || null;
    const result = await getMyBlogs(req.userId, status);
    res.json(result.rows.map(mapBlog));
  } catch (err) {
    console.error(err);
    res.sendStatus(503);
  }
};

export const getAllDocs = async (req, res) => {
  try {
    const status = req.query.status || null;
    const result = await getAllBlogsForReviewer(status);
    res.json(result.rows.map(mapBlog));
  } catch (err) {
    console.error(err);
    res.sendStatus(503);
  }
};

export const getPendingDocs = async (req, res) => {
  try {
    const result = await getPendingBlogsForReviewer();
    res.json(result.rows.map(mapBlog));
  } catch (err) {
    console.error(err);
    res.sendStatus(503);
  }
};

export const createNewBlog = async (req, res) => {
  try {
    const allowedFields = ["title", "content", "tagId"];
    for (const field of Object.keys(req.body)) {
      if (!allowedFields.includes(field))
        return res.status(400).json({ message: `Invalid field: '${field}'` });
    }

    const { title, content, tagId } = req.body;

    if (!title || !content)
      return res.status(400).json({ message: "Title and content are required" });
    if (typeof title !== "string" || typeof content !== "string")
      return res.status(400).json({ message: "Title and content must be strings" });
    if (title.trim().length < 3)
      return res.status(400).json({ message: "Title must be at least 3 characters" });
    if (content.trim().length < 10)
      return res.status(400).json({ message: "Content must be at least 10 characters" });
    if (tagId !== undefined && tagId !== null && isNaN(Number(tagId)))
      return res.status(400).json({ message: "tagId must be a number" });

    const result = await createBlog(
      sanitize(title.trim()),
      sanitize(content.trim()),
      tagId ? Number(tagId) : null,
      req.userId
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create Blog Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateExistingBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = ["title", "content", "tagId"];
    for (const field of Object.keys(req.body)) {
      if (!allowedFields.includes(field))
        return res.status(400).json({ message: `Invalid field: '${field}'` });
    }

    const { title, content, tagId } = req.body;

    const blogCheck = await findBlogById(id);
    if (blogCheck.rows.length === 0)
      return res.status(404).json({ message: "Blog not found" });

    const blog = blogCheck.rows[0];
    if (blog.userid !== req.userId)
      return res.status(403).json({ message: "Forbidden: only owner can update" });

    if (blog.status !== "pending")
      return res.status(403).json({ message: "Cannot edit a reviewed document" });

    const finalTitle = sanitize(title ?? blog.title);
    const finalContent = sanitize(content ?? blog.content);
    const finalTagId = tagId ?? blog.tagid;

    const updated = await updateBlog(id, finalTitle, finalContent, finalTagId);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error("Update Blog Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const blogCheck = await findBlogById(id);
    if (blogCheck.rows.length === 0)
      return res.status(404).json({ message: "Blog not found" });

    const blog = blogCheck.rows[0];
    if (Number(blog.userid) !== Number(req.userId))
      return res.status(403).json({ message: "Forbidden" });

    if (blog.status !== "pending")
      return res.status(403).json({ message: "Cannot delete a reviewed document" });

    await deleteBlogById(id);
    res.json({ message: "Blog deleted" });
  } catch (err) {
    console.error(err);
    res.sendStatus(503);
  }
};

export const passBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blogCheck = await findBlogById(id);
    if (blogCheck.rows.length === 0)
      return res.status(404).json({ message: "Blog not found" });

    if (req.userRole !== "REVIEWER")
      return res.status(403).json({ message: "Forbidden: only reviewers can review" });

    const result = await reviewBlog(id, "passed");
    res.json({ message: "Blog passed", blog: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.sendStatus(503);
  }
};

export const failBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blogCheck = await findBlogById(id);
    if (blogCheck.rows.length === 0)
      return res.status(404).json({ message: "Blog not found" });

    if (req.userRole !== "REVIEWER")
      return res.status(403).json({ message: "Forbidden: only reviewers can review" });

    const result = await reviewBlog(id, "failed");
    res.json({ message: "Blog failed", blog: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.sendStatus(503);
  }
};
