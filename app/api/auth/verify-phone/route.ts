import { NextRequest, NextResponse } from "next/server";
import { databaseService } from "@/lib/database";
import { cynSMS } from "@/lib/sms";
import { otpService } from "@/lib/otp";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facebookName, mobileNumber, facebookId } = body;

    console.log("body:", body);
    console.log("facebookName:", facebookName);
    console.log("mobileNumber:", mobileNumber);
    console.log("facebookId:", facebookId);

    if (!facebookName || !mobileNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Facebook name and mobile number are required",
        },
        { status: 400 }
      );
    }

    console.log(
      `Verifying phone for Facebook name: ${facebookName}, Mobile: ${mobileNumber}`
    );

    const housemaid = await databaseService.findHousemaidByFacebookNameAndMobile(
      facebookName,
      mobileNumber
    );

    if (!housemaid) {
      console.log(
        `Housemaid not found for ${facebookName} and ${mobileNumber}`
      );

      const authAttempt = await databaseService.getAuthAttemptByMobile(mobileNumber);

      if (authAttempt) {
        const currentCount = authAttempt.otpRequestCount ?? 0;
        const newCount = currentCount + 1;

        if (currentCount >= 3) {
          console.log(`OTP request limit reached for ${mobileNumber}`);
          return NextResponse.json(
            {
              success: false,
              message: "Account temporarily locked. Please contact admin.",
              locked: true,
            },
            { status: 403 }
          );
        }

        await databaseService.updateAuthAttempt(authAttempt.id, "otp", true);

        return NextResponse.json(
          {
            success: false,
            message: `Not a registered housemaid. Attempt ${newCount} of 3.`,
            attempts: newCount,
          },
          { status: 401 }
        );
      } else {
        await databaseService.createAuthAttempt(mobileNumber, facebookId, "otp");

        return NextResponse.json(
          {
            success: false,
            message: "Not a registered housemaid. Attempt 1 of 3.",
            attempts: 1,
          },
          { status: 401 }
        );
      }
    }

    if (housemaid.status !== "active") {
      console.log(`Housemaid account is not active for ${facebookName}`);
      return NextResponse.json(
        {
          success: false,
          message: "Account is not active. Please contact admin.",
        },
        { status: 403 }
      );
    }

    const authAttemptForValid = await databaseService.getAuthAttemptByMobile(
      mobileNumber
    );
    if (authAttemptForValid) {
      if ((authAttemptForValid.otpRequestCount ?? 0) >= 3) {
        console.log(
          `OTP request limit reached for legitimate user: ${mobileNumber}`
        );
        return NextResponse.json(
          {
            success: false,
            message:
              "Too many OTP requests. Please try again later or contact admin.",
            locked: true,
          },
          { status: 429 }
        );
      }
      await databaseService.updateAuthAttempt(authAttemptForValid.id, "otp", true);
    } else {
      await databaseService.createAuthAttempt(mobileNumber, facebookId, "otp");
    }

    const otpCode = otpService.generateOTP(6);
    const expiresAt = otpService.getExpirationTime(10);

    console.log(
      `Generated OTP for ${housemaid.housemaidId}: ${otpCode} (expires at ${expiresAt})`
    );

    console.log("facebookId:", facebookId);
    console.log("mobileNumber:", mobileNumber);
    console.log("otpCode:", otpCode);
    console.log("expiresAt:", expiresAt);

    const otpCreated = await databaseService.createOTPVerification(
      facebookId,
      mobileNumber,
      otpCode,
      expiresAt
    );

    if (!otpCreated) {
      console.error("Failed to create OTP verification record");
      return NextResponse.json(
        { success: false, message: "Failed to create OTP verification" },
        { status: 500 }
      );
    }

    const smsResult = await cynSMS.sendOTP(mobileNumber, otpCode);
    // const smsResult = { success: true, error: null };
    console.log("SMS result:", smsResult);

    if (!smsResult.success) {
      console.error("Failed to send OTP SMS:", smsResult.error);
      return NextResponse.json(
        { success: false, message: `Failed to send OTP: ${smsResult.error}` },
        { status: 500 }
      );
    }

    console.log(`OTP sent successfully to ${mobileNumber}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      data: {
        facebook_id: facebookId,
        mobile_number: mobileNumber,
        expires_in_minutes: 10,
      },
    });
  } catch (error) {
    console.error("Phone verification error:", error);
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
