import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const TEST_DB_URL_FILE = path.join(process.cwd(), ".test-db-url");

let pg: EmbeddedPostgres | null = null;

export async function setup() {
  if (process.env.DATABASE_URL && process.env.USE_EXTERNAL_TEST_DB === "true") {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    fs.writeFileSync(TEST_DB_URL_FILE, process.env.DATABASE_URL);
    return;
  }

  pg = new EmbeddedPostgres({
    databaseDir: "./.embedded-postgres",
    user: "postgres",
    password: "password",
    port: 54329,
    persistent: false,
  });

  await pg.initialise();
  await pg.start();

  const databaseUrl = "postgresql://postgres:password@localhost:54329/postgres";
  process.env.DATABASE_URL = databaseUrl;
  fs.writeFileSync(TEST_DB_URL_FILE, databaseUrl);

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}

export async function teardown() {
  if (fs.existsSync(TEST_DB_URL_FILE)) {
    fs.unlinkSync(TEST_DB_URL_FILE);
  }

  if (pg) {
    await pg.stop();
    pg = null;
  }
}
