import {
  insertComment,
  fetchCommentsByBlog,
  findCommentById,
  updateCommentById,
  deleteCommentById
} from "../models/comment.model.js";

// --------------------------- ADD COMMENT ---------------------------
export const addComment = async (req, res) => {
  try {
    const allowedFields = ["content"];
    const receivedFields = Object.keys(req.body);

    // ❌ Reject invalid/extra fields
    const invalidFields = receivedFields.filter(f => !allowedFields.includes(f));
    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid fields: ${invalidFields.join(", ")}`,
        allowed: allowedFields
      });
    }

    const { content } = req.body;

    // ---------- VALIDATION ----------
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    if (typeof content !== "string") {
      return res.status(400).json({ message: "Content must be a string" });
    }

    if (content.trim().length < 1) {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    // INSERT COMMENT
    const result = await insertComment(req.params.blogId, req.userId, content.trim());
    return res.status(201).json(result);

  } catch (err) {
    console.error("Add Comment Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const getComments = async (req, res) => {
  const { blogId } = req.params;

  try {
    const comments = await fetchCommentsByBlog(blogId);
    res.json(comments);
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
};

// --------------------------- UPDATE COMMENT ---------------------------
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const allowedFields = ["content"];
    const receivedFields = Object.keys(req.body);

    // ❌ Reject invalid/extra fields
    const invalidFields = receivedFields.filter(f => !allowedFields.includes(f));
    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid fields: ${invalidFields.join(", ")}`,
        allowed: allowedFields
      });
    }

    const { content } = req.body;

    // VALIDATION
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    if (typeof content !== "string") {
      return res.status(400).json({ message: "Content must be a string" });
    }

    if (content.trim().length < 1) {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    // CHECK IF COMMENT EXISTS
    const comment = await findCommentById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // PERMISSION CHECK
    if (comment.userid !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You cannot edit this comment" });
    }

    // UPDATE COMMENT
    const updated = await updateCommentById(commentId, content.trim());
    return res.json(updated);

  } catch (err) {
    console.error("Update Comment Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await findCommentById(commentId);

    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    if (comment.userid !== req.userId && req.userRole !== "ADMIN")
      return res.status(403).json({ message: "Forbidden" });

    await deleteCommentById(commentId);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
};

