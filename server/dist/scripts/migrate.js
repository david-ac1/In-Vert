import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { closePool, withTransaction } from "../lib/db.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, "../../migrations");
async function run() {
    const files = (await readdir(migrationsDir))
        .filter((file) => file.endsWith(".sql"))
        .sort();
    await withTransaction(async (client) => {
        await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        for (const file of files) {
            const existing = await client.query("SELECT filename FROM schema_migrations WHERE filename = $1", [file]);
            if (existing.rowCount) {
                continue;
            }
            const sql = await readFile(path.join(migrationsDir, file), "utf8");
            await client.query(sql);
            await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
            console.log(`Applied migration ${file}`);
        }
    });
    await closePool();
}
void run().catch(async (error) => {
    console.error(error);
    await closePool();
    process.exit(1);
});
