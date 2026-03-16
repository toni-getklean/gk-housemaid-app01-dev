---
name: drizzle-postgres
description: Guidelines for interacting with the database using Drizzle ORM and PostgreSQL (Neon Serverless).
---

# Drizzle ORM & PostgreSQL Database Skill

This project uses **Drizzle ORM** with **Neon Serverless PostgreSQL** (`@neondatabase/serverless` and `postgres`).

## Core Principles

1. **Schema Location**: All Drizzle schema definitions and the core `db.ts` connection setup are located in the `server/db/` directory. Do not place schema files anywhere else.
2. **Serverless Driver Setup**: The database connection uses the Neon serverless driver to prevent connection exhaustion. Do not attempt to use `pg` or other standard Node.js connection pools without verifying the architecture first.
3. **API Routes**: Database queries are predominantly executed within standard Next.js App Router API Routes (`app/api/...`), and occasionally in React Server Components for fetching data.

## Workflows

### 1. Modifying the Schema
When you need to make changes to the database schema:
1. Locate the relevant schema file in `server/db/` (or create a new one).
2. Modify the schema TypeScript definitions using `drizzle-orm`.
3. Generate the required database migrations:
   ```bash
   npm run db:generate
   ```
4. During local development, apply the changes to your local database using:
   ```bash
   npm run db:push
   ```
   *(Note: For production, `npm run db:migrate` may be used depending on deployment processes. Read `fly-deployment` skill if applicable).*

### 2. Seeding Data
This repository has an extensive custom seeding architecture.
- All seed scripts are in `server/db/seeds/`.
- If you add a new table, you will often need to create a corresponding seed file or update an existing one.
- Seed files should ideally be idempotent (clearing existing records or inserting logically new ones without conflict).
- To run seed commands individually, reference `package.json` for specific scripts like `npm run db:seed:customers`.
- When in doubt, prefer using the specific existing seeder commands rather than writing bespoke manual SQL inserts.

## Query Best Practices
- **Relational Queries**: Use Drizzle's relational queries API (`db.query...`) where possible to fetch related nested data cleanly, rather than complex joins, unless performance dictates otherwise.
- **Transactions**: For critical multi-step operations (e.g., booking creation, payment logging), ensure you are wrapping database calls in Drizzle transactions (`db.transaction(async (tx) => { ... })`).
