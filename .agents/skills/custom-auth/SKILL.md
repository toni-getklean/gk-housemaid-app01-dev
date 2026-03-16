---
name: custom-auth
description: Guidelines for handling authentication and session state using the project's custom Passport/Express-Session setup in Next.js.
---

# Authentication & Middleware Skill

This project does **not** use NextAuth.js or Auth.js. Instead, it relies on a custom implementation integrating `passport.js`, `express-session`, and `jose` alongside the standard Next.js App Router.

## Architecture

1. **Session Storage**: Sessions are likely managed via `express-session` and stored in the database or Redis (check dependencies like `connect-pg-simple`).
2. **JWT/Tokens**: `jose` indicates custom JWT signing and verifying is used.
3. **App Router Integration**: Next.js `middleware.ts` intercepts requests to verify active sessions or valid tokens before allowing access to protected dashboard routes or specific `app/api/...` endpoints.

## Agent Guidelines

When building protected pages or API endpoints:

1. **API Protection**:
   - Always check for an active user session/token at the top of your `app/api/...` route handlers.
   - If the user is unauthenticated or lacks the correct role (e.g., Admin vs. Housemaid), immediately return a `401 Unauthorized` or `403 Forbidden` JSON response.
   - Do not trust client-side data payload claims; re-verify the user's role/ID against the session.

2. **Middleware**:
   - If creating a new section of the application (e.g., `/admin-panel`), ensure the routing rules in `middleware.ts` are updated to cover those paths.
   - The middleware should handle redirecting unauthenticated users to `/login`.

3. **Frontend State**:
   - Do not query the database directly from client components to check auth status.
   - Expose an endpoint like `/api/auth/me` to fetch the current user's profile and roles.
   - Use React Context or React Query (`useQuery(['user'])`) to distribute this state throughout the application efficiently.

4. **Security**:
   - Never expose sensitive tokens, hashed passwords, or session IDs in API responses or HTML data attributes.
