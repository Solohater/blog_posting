import {
  insertComment,
  fetchCommentsByBlog,
  findCommentById,
  updateCommentById,
  deleteCommentById
} from "../models/comment.model.js";

export const addComment = async (req, res) => {
  const { blogId } = req.params;
  const { content } = req.body;

  try {
    const result = await insertComment(blogId, req.userId, content);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
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

export const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    const comment = await findCommentById(commentId);

    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    if (comment.userid !== req.userId)
      return res.status(403).json({ message: "Forbidden" });

    const updated = await updateCommentById(commentId, content);
    res.json(updated);
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
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
