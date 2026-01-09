import { NextRequest, NextResponse } from "next/server";
import { databaseService } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      facebookId,
      facebookName,
      mobileNumber,
      otpCode,
      facebookAccessToken,
      tokenExpiresAt,
    } = body;

    if (!facebookId || !mobileNumber || !otpCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Facebook ID, mobile number, and OTP code are required",
        },
        { status: 400 }
      );
    }

    console.log(
      `Verifying OTP for Facebook ID: ${facebookId}, Mobile: ${mobileNumber}`
    );

    const result = await databaseService.verifyOTP(facebookId, mobileNumber, otpCode);

    if (!result.success) {
      if (result.expired) {
        console.log(`OTP expired for ${facebookId}`);
        return NextResponse.json(
          {
            success: false,
            message: "OTP has expired. Please request a new one.",
          },
          { status: 401 }
        );
      }

      if (result.alreadyUsed) {
        console.log(`OTP already used for ${facebookId}`);
        return NextResponse.json(
          {
            success: false,
            message:
              "This OTP has already been used. Please request a new one.",
          },
          { status: 401 }
        );
      }

      console.log(`Invalid OTP for ${facebookId}`);

      let authAttempt = await databaseService.getAuthAttemptByMobile(mobileNumber);
      if (!authAttempt) {
        authAttempt = await databaseService.getAuthAttempt(facebookId);
      }

      if (authAttempt) {
        await databaseService.updateAuthAttempt(
          authAttempt.id,
          "otp_verify_fail",
          true
        );

        const updatedAttempt = await databaseService.getAuthAttemptById(authAttempt.id);
        if (
          updatedAttempt &&
          (updatedAttempt.otpVerificationFailCount ?? 0) >= 5
        ) {
          console.log(
            `Too many failed OTP verification attempts for ${facebookId}`
          );
          return NextResponse.json(
            {
              success: false,
              message:
                "Too many failed attempts. Please request a new OTP or contact admin.",
              locked: true,
            },
            { status: 429 }
          );
        }
      } else {
        await databaseService.createAuthAttempt(mobileNumber, facebookId, "otp");
      }

      return NextResponse.json(
        { success: false, message: "Invalid OTP code." },
        { status: 401 }
      );
    }

    const housemaid = await databaseService.findHousemaidByFacebookNameAndMobile(
      facebookName,
      mobileNumber
    );

    if (!housemaid) {
      console.error(
        `Housemaid not found after successful OTP verification: ${facebookId}`
      );
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update housemaid with Facebook access token if provided (from verification flow)
    if (facebookAccessToken && tokenExpiresAt) {
      console.log(
        `Updating housemaid ${housemaid.housemaidId} with Facebook access token`
      );
      const updated = await databaseService.updateHousemaidAccessToken(
        housemaid.housemaidId,
        facebookAccessToken,
        tokenExpiresAt,
        facebookId
      );

      if (!updated) {
        console.error(
          `Failed to update access token for housemaid: ${housemaid.housemaidId}`
        );
      }
    }

    let authAttempt = await databaseService.getAuthAttemptByMobile(mobileNumber);
    if (!authAttempt) {
      authAttempt = await databaseService.getAuthAttempt(facebookId);
    }
    if (
      authAttempt &&
      (authAttempt.otpVerificationFailCount ?? 0) > 0
    ) {
      await databaseService.updateAuthAttempt(authAttempt.id, "otp_verify_fail", false);
    }

    console.log(
      `OTP verified successfully for housemaid: ${housemaid.housemaidId}`
    );

    // Create App Session Token
    const { signSession } = await import("@/lib/auth");
    const token = await signSession({
      sub: housemaid.housemaidId.toString(),
      role: "housemaid",
    });

    const response = NextResponse.json({
      success: true,
      message: "OTP verified successfully. Redirecting to dashboard...",
      user: {
        name: housemaid.name,
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
    console.error("OTP verification error:", error);
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
