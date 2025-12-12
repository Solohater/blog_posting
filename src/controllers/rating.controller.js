import { findRating, createRating, updateRating } from "../models/rating.model.js";

export const addOrUpdateRating = async (req, res) => {
  try {
    const blogId = parseInt(req.params.blogId, 10);

    // VALIDATION
    if (isNaN(blogId) || blogId <= 0) {
      return res.status(400).json({ message: "Invalid blog ID" });
    }

    // VALIDATE BODY 
    const allowedFields = ["ratingValue"];
    const receivedFields = Object.keys(req.body);

    // Reject extra fields
    const invalidFields = receivedFields.filter(f => !allowedFields.includes(f));
    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid fields: ${invalidFields.join(", ")}`,
        allowed: allowedFields
      });
    }

    const { ratingValue } = req.body;

    if (ratingValue === undefined) {
      return res.status(400).json({ message: "ratingValue is required" });
    }

    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: "ratingValue must be an integer between 1 and 5" });
    }

    const existingRating = await findRating(blogId, req.userId);

    if (existingRating) {
      const updated = await updateRating(existingRating.ratingid, ratingValue);
      return res.json({ rating: updated.ratingvalue });
    }

    const newRating = await createRating(blogId, req.userId, ratingValue);
    return res.status(201).json({ rating: newRating.ratingvalue });

  } catch (err) {
    console.error("Rating Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
