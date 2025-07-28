import { defineConfig } from "drizzle-kit";

// Use DATABASE_URL_MIGRATIONS for migrations if available, otherwise fall back to DATABASE_URL
const databaseUrl = process.env.DATABASE_URL_MIGRATIONS || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or DATABASE_URL_MIGRATIONS must be set");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
