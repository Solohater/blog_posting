import { readFileSync } from "fs";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,

});

async function migrate() {
  try {
    const result = await pool.query("SELECT 1");
    console.log("Database connection test passed");

    const sqlPath = new URL("./init.sql", import.meta.url);
    const sql = readFileSync(sqlPath, "utf-8");
    await pool.query(sql);
    console.log("Migration completed successfully");
  } catch (err) {
    console.error("Migration failed:", err.message);
    console.error("Stack:", err.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
