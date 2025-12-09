import { findRating, createRating, updateRating } from "../models/rating.model.js";

export const addOrUpdateRating = async (req, res) => {
  const blogId = parseInt(req.params.blogId, 10);
  const { ratingValue } = req.body;

  if (!blogId || blogId <= 0) {
    return res.status(400).json({ message: "Invalid blog id" });
  }

  if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
    return res.status(400).json({ message: "Rating must be 1–5" });
  }

  try {
    const existingRating = await findRating(blogId, req.userId);

    if (existingRating) {
      const updated = await updateRating(existingRating.ratingid, ratingValue);
      return res.json({ rating: updated.ratingvalue });
    }

    const newRating = await createRating(blogId, req.userId, ratingValue);
    res.status(201).json({ rating: newRating.ratingvalue });
  } catch (err) {
    console.error(err);
    res.status(503).json({ message: "Server error" });
  }
};
