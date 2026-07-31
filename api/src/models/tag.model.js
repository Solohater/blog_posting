import pool from "../config/db.js";

export const getAllTags = () => {
  return pool.query("SELECT * FROM tags ORDER BY name");
};