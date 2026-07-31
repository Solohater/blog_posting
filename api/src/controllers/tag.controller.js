import { getAllTags } from "../models/tag.model.js";

export const listTags = async (_req, res) => {
  try {
    const result = await getAllTags();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(503);
  }
};