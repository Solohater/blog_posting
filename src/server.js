import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import commentsRoutes from "./routes/commentsRoute.js";
import likeRoutes from "./routes/likeRoutes.js";
import ratingRoutes from "./routes/ratingsRoute.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use((req, res, next) => {
  req.url = req.url.replace(/[\s\n\r]+$/g, ""); // remove trailing spaces/newlines
  next();
});

app.use(express.json());


/* ------------------ ROUTES ------------------ */

// Auth (login/register)
app.use("/auth", authRoutes);

// Blogs (PUBLIC)
app.use("/blogs", blogRoutes);

// Likes → /blogs/:blogId/likes
app.use("/blogs/:blogId/likes", likeRoutes);

// Comments → /blogs/:blogId/comments
app.use("/blogs", commentsRoutes);


// Ratings → /blogs/:blogId/ratings
app.use("/blogs/:blogId/ratings", ratingRoutes);

/* -------------------------------------------- */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
