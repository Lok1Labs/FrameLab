import 'dotenv/config';
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Client generation does not connect to the database. Cache/migration jobs
    // still need a real DATABASE_URL when they run.
    url: process.env.DATABASE_URL ?? "",
  },
});
