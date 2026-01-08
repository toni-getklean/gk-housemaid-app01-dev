import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    proofOfArrival: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for proofOfArrival");
            console.log("file url", file.ufsUrl);
            return { uploadedBy: "housemaid" };
        }),

    transportReceipt: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for transportReceipt");
            console.log("file url", file.ufsUrl);
            return { uploadedBy: "housemaid" };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
