---
name: react-hook-form-zod
description: Guidelines for building forms and handling validation in Next.js using React Hook Form, Zod, and Drizzle.
---

# Forms & Validation Skill

Forms in this application are built using a specific, highly robust stack:
1. **Zod** for schema definition and validation.
2. **React Hook Form (RHF)** for form state management and submission.
3. **`@hookform/resolvers/zod`** for hooking Zod into RHF.
4. **Drizzle Zod (`drizzle-zod`)** to bridge database schemas directly into frontend/backend validation schemas.

## Core Flow

When creating or modifying a form that creates/updates database records, follow this pattern:

1. **Schema Definition**: 
   - Start by looking at the Drizzle database schema (`server/db/schema.ts` or similar).
   - Use `createInsertSchema` or `createSelectSchema` from `drizzle-zod` to automatically generate a base Zod schema perfectly matching the DB.
   - Extend or omit fields from this base schema to create your specific "Form Schema" (e.g., omitting `id` or `createdAt` for a creation form, or adding cross-field validation rules).

2. **Form Component Setup**:
   - Initialize the form using `useForm<z.infer<typeof yourFormSchema>>`.
   - Always pass the `zodResolver(yourFormSchema)` to the `resolver` option.
   - Provide default values (`defaultValues: { ... }`) to avoid uncontrolled-to-controlled input warnings in React.

3. **Form Submission & API Interaction**:
   - The form's `onSubmit` handler should gather the validated data.
   - Submit the data to an endpoint inside `app/api/...` (or use a Server Action if appropriate, though API Routes are prevalent here).
   - **Crucial**: The backend API Route **must re-validate** the incoming payload using the exact same Zod schema:
     ```typescript
     const payload = yourFormSchema.parse(await req.json());
     ```

4. **Error Handling**:
   - Differentiate between client-side Zod validation errors (caught instantly by React Hook Form) and server-side errors (e.g., uniqueness constraints, business logic failures).
   - If the Next.js API returns an error response, catch it and use RHF's `setError` to display it nicely in the UI, or surface a generic toast notification.

## Example Skeleton
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@/server/db/schema"; // (Example import)
import * as z from "zod";

// Create specific form schema
const formSchema = insertUserSchema.omit({ id: true });
type FormValues = z.infer<typeof formSchema>;

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "" },
  });

  const onSubmit = async (data: FormValues) => {
    // Submit to /api/endpoint
  }
}
```
