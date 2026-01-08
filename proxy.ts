import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    // 1. Define protected routes
    const protectedPaths = [
        "/bookings",
        "/profile",
        "/manage-availability",
        "/api/bookings",
        "/api/profile",
        "/api/availability",
        "/api/dashboard",
    ];

    const isProtected = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtected) {
        // 2. Check cookie
        const token = request.cookies.get("session")?.value;

        if (!token) {
            if (request.nextUrl.pathname.startsWith("/api")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // 3. Verify Token
        const session = await verifySession(token);
        if (!session) {
            if (request.nextUrl.pathname.startsWith("/api")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Token is valid, allow request
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login
         * - auth
         * - public (public files)
         */
        "/((?!_next/static|_next/image|favicon.ico|login|auth|public).*)",
    ],
};
