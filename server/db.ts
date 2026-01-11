import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./db/schema";

if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set, using dummy connection for build");
    process.env.DATABASE_URL = "postgres://dummy:dummy@localhost:5432/dummy";
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
