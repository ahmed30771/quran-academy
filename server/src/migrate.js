import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schema = fs.readFileSync(path.join(__dirname, "../sql/schema.sql"), "utf8");

async function migrate() {
  await pool.query(schema);
  console.log("PostgreSQL tables are ready.");
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
