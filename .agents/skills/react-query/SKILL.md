---
name: react-query
description: Guidelines for setting up and using React Query for data fetching in a Next.js App Router project.
---

# Data Fetching Strategy (React Query) Skill

This project utilizes both standard Next.js App Router (React Server Components caching) and `@tanstack/react-query` for client-side data fetching. When writing code, you must consciously choose between the two.

## The Guiding Principle

1. **Server Components (Default)**: Fetch data server-side in your `page.tsx` or `layout.tsx` using `await db.query...` by default. This is best for static data, SEO-critical content, and initial page load speed (e.g., initial lists of customers, static lookup tables).
2. **React Query (Client-Side)**: Use `useQuery` exclusively in Client Components (`"use client"`) when the data:
   - Changes frequently and needs polling or background refetching.
   - Powers highly interactive dashboards or complex data tables with client-side filtering/pagination.
   - Depends on complex client-side state.

## Implementation Rules for `react-query`

1. **Query Keys**: Be incredibly consistent with query keys to ensure cache invalidation works correctly. Use array structures (e.g., `["bookings", bookingId]` or `["customers", { status: 'active' }]`).
2. **Fetching Functions**: Extract your fetch functions into a separate `lib/api/` folder or keep them tightly coupled with the custom hooks. These functions should call your `app/api/...` Next.js routes using `fetch` or `axios`.
3. **Mutations**: When data is created, updated, or deleted, always use `useMutation`.
   - On `onSuccess`, explicitly invalidate the relevant queries using the QueryClient.
   ```tsx
   const queryClient = useQueryClient();
   const mutation = useMutation({
     mutationFn: createBooking,
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['bookings'] });
       // Optional: Add a success toast here
     },
   });
   ```
4. **Hydration**: When necessary, you can fetch data on the server using a Server Component and dehydrate state to the client `QueryClientProvider` for an instant initial load, although this pattern adds complexity and should only be used for critical interactive components.
