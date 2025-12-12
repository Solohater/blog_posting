import express from "express";
import dotenv from "dotenv";
import indexRoutes from "./routes/index.route.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use((req, res, next) => {
  req.url = req.url.replace(/[\s\n\r]+$/g, ""); // remove trailing spaces/newlines
  next();
});

app.use(express.json());

//ROUTES 

app.use(indexRoutes)


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
