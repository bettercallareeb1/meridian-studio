import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load local credentials for development. Existing environment variables
// (for example, a production DATABASE_URL in CI) take precedence.
config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    // Schema changes go through the direct (unpooled) connection. The pooled
    // URL is for the running app; drizzle-kit needs a session-level connection.
    url:
      process.env.DATABASE_URL_UNPOOLED ??
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});
