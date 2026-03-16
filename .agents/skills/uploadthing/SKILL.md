---
name: uploadthing
description: Guidelines for managing file uploads using UploadThing.
---

# File Uploads (UploadThing) Skill

This project utilizes `uploadthing` and `@uploadthing/react` to securely handle file uploads (e.g., Housemaid profile pictures, certification PDFs, customer IDs).

## Core Rules

1. **Do Not Implement Alternatives**: Do not attempt to use `multer`, basic Express file uploads, direct S3 implementations, or save files to the local container disk unless explicitly instructed. `uploadthing` is the dedicated standard.

2. **Backend Configuration**:
   - The core configuration defining allowed file types, maximum sizes, and access controls exists in the server-side router (typically `app/api/uploadthing/core.ts`).
   - If you need a new type of upload (e.g., video instead of image), you must define a new endpoint in the UploadThing router before trying to use it on the frontend.

3. **Frontend Integration**:
   - Use the pre-built React components provided by `@uploadthing/react` (like `<UploadButton />` or `<UploadDropzone />`).
   - Ensure the `endpoint` prop on these components perfectly matches the configured route in your `core.ts`.
   
   ```tsx
   import { UploadDropzone } from "@/utils/uploadthing"; // Path may vary
   
   <UploadDropzone
     endpoint="imageUploader" // Defined in app/api/uploadthing/core.ts
     onClientUploadComplete={(res) => {
       // Save the `res[0].url` to your database using an API route
       console.log("Files: ", res);
       alert("Upload Completed");
     }}
     onUploadError={(error: Error) => {
       alert(`ERROR! ${error.message}`);
     }}
   />
   ```

4. **Database State**: 
   - UploadThing only handles the storage of the file. You must implement the logic to take the returned secure URL (`res[0].url`) and update the relevant Drizzle database record (e.g., `db.update(housemaids).set({ avatarUrl: url })`).
