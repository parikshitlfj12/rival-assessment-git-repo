import fs from "node:fs";
import path from "node:path";
import { beforeAll } from "vitest";
import { prisma } from "@/lib/db";

const TEST_DB_URL_FILE = path.join(process.cwd(), ".test-db-url");

beforeAll(async () => {
  if (fs.existsSync(TEST_DB_URL_FILE)) {
    process.env.DATABASE_URL = fs.readFileSync(TEST_DB_URL_FILE, "utf8").trim();
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for tests");
  }

  await prisma.$connect();
});
