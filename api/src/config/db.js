import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,

});

pool.on("connect", () => {
  console.log("Connected to Postgres database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

export default pool;

export async function testConnection() {
  try {
    const result = await pool.query("SELECT 1");
    console.log("Database connection test passed");
    return true;
  } catch (err) {
    console.error("Database connection test failed:", err.message);
    throw err;
  }
}
