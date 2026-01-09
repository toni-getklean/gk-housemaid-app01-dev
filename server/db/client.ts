import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
    // throw new Error("DATABASE_URL environment variable is required");
    console.warn("DATABASE_URL not set, using dummy connection for build");
    process.env.DATABASE_URL = "postgres://dummy:dummy@localhost:5432/dummy";
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });
