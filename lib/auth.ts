import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET;
const key = new TextEncoder().encode(secretKey);

export interface SessionPayload {
    sub: string;
    role: "housemaid";
    [key: string]: any;
}

export async function signSession(payload: SessionPayload): Promise<string> {
    if (!secretKey) throw new Error("JWT_SECRET is not defined");

    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d") // Session valid for 7 days
        .sign(key);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
    if (!secretKey) throw new Error("JWT_SECRET is not defined");

    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ["HS256"],
        });
        return payload as SessionPayload;
    } catch (error) {
        console.error("Failed to verify session:", error);
        return null;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return null;
    return await verifySession(session);
}
