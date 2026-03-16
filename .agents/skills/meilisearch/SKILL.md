---
name: meilisearch
description: Guidelines for managing the Meilisearch architecture and syncing patterns.
---

# Search Architecture (Meilisearch) Skill

This project relies upon **Meilisearch** (`meilisearch`) for advanced search functionalities (such as fuzzy searching across Customers, Bookings, or Housemaids), rather than basic PostgREST or `LIKE '%search%'` SQL statements.

## Core Directives

1. **Integration Overview**:
   - The primary source of truth is the PostgreSQL database.
   - Meilisearch acts as a secondary indexed store specifically optimized for read-heavy search operations.
   - Do not use Meilisearch for simple exact-match lookups where a Drizzle `db.query.customers.findFirst({ where: eq(customers.id, id) })` would suffice.

2. **Syncing State**:
   - When a Drizzle database mutation occurs (Create, Update, Delete) on an entity that needs to be searchable, you MUST also sync that change to Meilisearch.
   - Generally, this synchronization logic should live in a central service file (`server/services/...`) rather than being duplicated across numerous API route handlers.
   - A simplified flow:
     ```typescript
     // 1. Drizzle DB Mutation
     const [newCustomer] = await db.insert(customers).values(data).returning();
     
     // 2. Sync to Meilisearch
     const client = new MeiliSearch({ host: 'YOUR_HOST', apiKey: 'YOUR_KEY' });
     await client.index('customers').addDocuments([newCustomer]);
     ```

3. **Frontend Searching**:
   - For highly interactive search bars, perform the search requests directly from the client components hitting a Next.js API Route (which safely holds the Meilisearch API keys).
   - Alternatively, for static search results pages, perform the query in a Server Component before rendering the initial DOM.

## Search Capabilities

When implementing a new search feature using Meilisearch, leverage its advanced features:
- Typo tolerance
- Complex filtering (using attributes for facetting)
- Rapid sorting strategies

Always consult the Meilisearch official documentation when building new search indices.
