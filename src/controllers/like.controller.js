import { checkLikeExists, addLike, removeLike } from "../models/like.model.js";
import {findBlogById} from "../models/blog.model.js"

export const likeBlog = async (req, res) => {
  const blogId = parseInt(req.params.blogId, 10);

  if (isNaN(blogId)) return res.status(400).json({ message: "Invalid blog id" });

  try {
    

    const blog = await findBlogById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    
    const exists = await checkLikeExists(blogId, req.userId);
    if (exists) return res.status(400).json({ message: "You already liked this blog" });

    const like = await addLike(blogId, req.userId);
    if (!like) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(201).json({ message: "Liked Blog" });
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
};

export const unlikeBlog = async (req, res) => {
  const blogId = parseInt(req.params.blogId, 10);

  if (isNaN(blogId)) return res.status(400).json({ message: "Invalid blog id" });

  try {
    
    const blog = await findBlogById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    const deleted = await removeLike(blogId, req.userId);

    if (!deleted) return res.status(404).json({ message: "Like not found" });

    res.json({ message: "Like removed" });
  } catch (err) {
    console.log(err);
    res.sendStatus(503);
  }
};
