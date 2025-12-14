import express from "express";
import dotenv from "dotenv";
import indexRoutes from "./routes/index.route.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(indexRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
