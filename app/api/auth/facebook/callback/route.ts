import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getDatabaseService } from "@/lib/database";
import { FacebookProfile, FacebookTokenResponse } from "@/lib/types/database";

export const dynamic = "force-dynamic";

const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "";
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "";
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || "";

async function getFacebookAccessToken(
  code: string
): Promise<{ accessToken: string; expiresIn: number }> {
  try {
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token`;
    const params = {
      client_id: FACEBOOK_APP_ID,
      client_secret: FACEBOOK_APP_SECRET,
      redirect_uri: FACEBOOK_REDIRECT_URI,
      code,
    };

    console.log("Requesting Facebook access token...");
    const response = await axios.get<FacebookTokenResponse>(tokenUrl, {
      params,
    });

    console.log("Facebook token response:", {
      expiresIn: response.data.expires_in,
    });

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in,
    };
  } catch (error: any) {
    console.error("Error getting Facebook access token:", error);
    throw new Error("Failed to get Facebook access token");
  }
}

async function getFacebookProfile(
  accessToken: string
): Promise<FacebookProfile> {
  try {
    const profileUrl = `https://graph.facebook.com/v18.0/me`;
    const params = {
      fields: "id,name,email",
      access_token: accessToken,
    };

    console.log("Fetching Facebook profile...");
    const response = await axios.get<FacebookProfile>(profileUrl, { params });

    console.log("Facebook profile:", {
      id: response.data.id,
      name: response.data.name,
    });

    return response.data;
  } catch (error) {
    console.error("Error getting Facebook profile:", error);
    throw new Error("Failed to get Facebook profile");
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.error("Facebook OAuth error:", error);
      return NextResponse.json(
        { success: false, message: "Facebook authentication failed" },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Authorization code is missing" },
        { status: 400 }
      );
    }

    const { accessToken, expiresIn } = await getFacebookAccessToken(code);
    const facebookProfile = await getFacebookProfile(accessToken);
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    console.log("state:", state);

    if (state === "verify") {
      console.log(
        `Verification flow - returning Facebook profile for: ${facebookProfile.id}`
      );
      // const tokenExpiresAt = new Date(
      //   Date.now() + expiresIn * 1000
      // ).toISOString();

      console.log("facebookProfile.id", facebookProfile.id);
      console.log("accessToken", accessToken);
      console.log("tokenExpiresAt", tokenExpiresAt);

      return NextResponse.json({
        success: true,
        message: "Facebook profile retrieved",
        facebook_id: facebookProfile.id,
        facebook_name: facebookProfile.name,
        facebook_access_token: accessToken,
        token_expires_at: tokenExpiresAt,
      });
    }

    const databaseService = getDatabaseService();
    const housemaid = await databaseService.findHousemaidByFacebookId(
      facebookProfile.id
    );

    if (!housemaid) {
      console.log(`Housemaid not found for Facebook ID: ${facebookProfile.id}`);

      const authAttempt = await databaseService.getAuthAttempt(facebookProfile.id);

      if (authAttempt) {
        const currentCount = authAttempt.loginFailCount ?? 0;
        const newCount = currentCount + 1;

        if (newCount >= 3) {
          console.log(
            `Login attempt limit reached for Facebook ID: ${facebookProfile.id}`
          );
          return NextResponse.json(
            {
              success: false,
              message: "Account temporarily locked. Please contact admin.",
              locked: true,
            },
            { status: 403 }
          );
        }

        await databaseService.updateAuthAttempt(authAttempt.id, "login", true);

        return NextResponse.json(
          {
            success: false,
            message: `Not a registered housemaid. Attempt ${newCount} of 3.`,
            attempts: newCount,
            facebook_name: facebookProfile.name,
            facebook_id: facebookProfile.id,
            facebook_access_token: accessToken,
            token_expires_at: tokenExpiresAt,
          },
          { status: 401 }
        );
      } else {
        await databaseService.createAuthAttempt("", facebookProfile.id, "login");

        return NextResponse.json(
          {
            success: false,
            message: "Not a registered housemaid. Attempt 1 of 3.",
            attempts: 1,
            facebook_name: facebookProfile.name,
            facebook_id: facebookProfile.id,
          },
          { status: 401 }
        );
      }
    }

    if (housemaid.status !== "active") {
      console.log(`Housemaid account is not active: ${housemaid.housemaidId}`);
      return NextResponse.json(
        {
          success: false,
          message: "Account is not active. Please contact admin.",
        },
        { status: 403 }
      );
    }

    // const tokenExpiresAt = new Date(
    //   Date.now() + expiresIn * 1000
    // ).toISOString();

    console.log("facebookProfile.id", facebookProfile.id);
    console.log("accessToken", accessToken);
    console.log("tokenExpiresAt", tokenExpiresAt);
    console.log("housemaid.housemaidId", housemaid.housemaidId);

    const updated = await databaseService.updateHousemaidAccessToken(
      housemaid.housemaidId,
      accessToken,
      tokenExpiresAt,
      facebookProfile.id
    );

    if (!updated) {
      console.error("Failed to update access token");
      return NextResponse.json(
        { success: false, message: "Failed to update access token" },
        { status: 500 }
      );
    }

    const authAttempt = await databaseService.getAuthAttempt(facebookProfile.id);
    if (authAttempt && (authAttempt.loginFailCount ?? 0) > 0) {
      await databaseService.updateAuthAttempt(authAttempt.id, "login", false);
    }

    console.log(`Login successful for housemaid: ${housemaid.housemaidId}`);

    // Create App Session Token
    const { signSession } = await import("@/lib/auth");
    const token = await signSession({
      sub: housemaid.housemaidId.toString(),
      role: "housemaid",
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        name: housemaid.name,
        // Only return non-sensitive info needed for UI
        status: housemaid.status,
      },
    });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Facebook OAuth callback error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
