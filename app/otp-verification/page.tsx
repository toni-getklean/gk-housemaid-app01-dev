"use client";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function OTPVerification() {
  const router = useRouter();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [facebookName, setFacebookName] = useState("");
  const [facebookId, setFacebookId] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedPhone = localStorage.getItem("mobile_number");
    const storedName = localStorage.getItem("facebook_name");
    const storedId = localStorage.getItem("facebook_id");

    console.log("storedPhone:", storedPhone);
    console.log("storedName:", storedName);
    console.log("storedId:", storedId);

    if (!storedPhone || !storedName || !storedId) {
      toast({
        variant: "destructive",
        title: "Session expired",
        description: "Please start the verification process again.",
      });
      router.push("/login");
      return;
    }

    setPhoneNumber(storedPhone);
    setFacebookName(storedName);
    setFacebookId(storedId);
  }, [router, toast]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (!facebookId || !phoneNumber) {
      setError("Session data missing. Please start over.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const facebookAccessToken = localStorage.getItem("facebook_access_token");
      const tokenExpiresAt = localStorage.getItem("token_expires_at");

      console.log("Retrieved from localStorage in OTP page:", {
        facebookAccessToken: facebookAccessToken ? "Yes (Hidden)" : "No",
        tokenExpiresAt,
        facebookId,
        phoneNumber
      });

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facebookId: facebookId,
          facebookName: facebookName,
          mobileNumber: phoneNumber,
          otpCode: otp,
          facebookAccessToken: facebookAccessToken || undefined,
          tokenExpiresAt: tokenExpiresAt || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError(data.message || "Invalid OTP code");
          toast({
            variant: "destructive",
            title: "Verification failed",
            description: data.message || "Invalid OTP code",
          });
          return;
        }

        if (response.status === 404) {
          setError(data.message || "OTP not found or expired");
          toast({
            variant: "destructive",
            title: "OTP expired",
            description: data.message || "Please request a new OTP",
          });
          return;
        }

        if (response.status === 429 && data.locked) {
          setError(data.message || "Too many failed attempts");
          toast({
            variant: "destructive",
            title: "Account locked",
            description: data.message,
          });
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        throw new Error(data.message || "Verification failed");
      }

      if (data.success && data.user) {
        // Store authenticated session data
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("housemaid_id", data.user.housemaid_id);
        localStorage.setItem("facebook_id", data.user.facebook_id);
        localStorage.setItem("facebook_name", data.user.facebook_name);

        toast({
          title: "Verification successful!",
          description: `Welcome, ${data.user.name}!`,
        });

        // Clear temporary verification data
        localStorage.removeItem("mobile_number");
        localStorage.removeItem("mobile_number");
        localStorage.removeItem("facebook_access_token");
        localStorage.removeItem("token_expires_at");

        console.log("OTP verification successful - routing to dashboard");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Verification failed";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!facebookName || !phoneNumber) {
      setError("Session data missing. Please start over.");
      return;
    }

    setIsResending(true);
    setError("");
    setOtp("");

    try {
      const response = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facebookId: facebookId,
          facebookName: facebookName,
          mobileNumber: phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      if (data.success) {
        setCountdown(600); // Reset to 10 minutes
        toast({
          title: "OTP resent",
          description: "A new verification code has been sent to your phone",
        });
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to resend OTP";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleEditPhone = () => {
    router.back();
  };

  const isValid = otp.length === 6;
  const canResend = countdown === 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="relative h-[30vh] w-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl">🧽</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-8 pb-8">
        <div className="flex flex-col items-center mb-8">
          <div className="text-3xl font-bold mb-2">
            <span className="text-yellow">GET</span>
            <span className="text-teal">KLEAN</span>
          </div>
          <p className="text-sm text-gray-600">The Cleaning Experts</p>
        </div>

        <div className="border-t border-gray-200 mb-8" />

        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Enter your OTP
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              We sent a 6-digit OTP to your
              <br />
              registered mobile number.
            </p>
          </div>

          {phoneNumber && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-900">{phoneNumber}</span>
              <button
                onClick={handleEditPhone}
                className="text-teal hover:underline font-medium"
                data-testid="button-edit-phone"
              >
                [Edit]
              </button>
            </div>
          )}

          {error && (
            <div
              className="bg-red-50 border border-red-200 rounded-md p-3"
              data-testid="error-message"
            >
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex justify-center gap-2">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              data-testid="input-otp"
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot
                  index={0}
                  className="w-12 h-14 text-2xl font-bold"
                />
                <InputOTPSlot
                  index={1}
                  className="w-12 h-14 text-2xl font-bold"
                />
                <InputOTPSlot
                  index={2}
                  className="w-12 h-14 text-2xl font-bold"
                />
                <InputOTPSlot
                  index={3}
                  className="w-12 h-14 text-2xl font-bold"
                />
                <InputOTPSlot
                  index={4}
                  className="w-12 h-14 text-2xl font-bold"
                />
                <InputOTPSlot
                  index={5}
                  className="w-12 h-14 text-2xl font-bold"
                />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="text-center text-xs text-gray-600">
            {countdown > 0 ? (
              <p>
                Didn't get the code? Resend in {Math.floor(countdown / 60)}:
                {String(countdown % 60).padStart(2, "0")}
              </p>
            ) : (
              <p>
                Didn't get the code?{" "}
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-blue-600 hover:underline font-medium disabled:opacity-50"
                  data-testid="button-resend"
                >
                  {isResending ? "Sending..." : "Resend OTP"}
                </button>
              </p>
            )}
          </div>

          <Button
            onClick={handleVerify}
            disabled={!isValid || isLoading}
            className="w-full h-14 bg-teal hover:bg-teal-hover text-white font-semibold text-base disabled:bg-gray-300"
            data-testid="button-verify"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </div>

        <div className="mt-auto pt-8">
          <div className="border-t border-gray-200 pt-6">
            <p className="text-xs text-center text-gray-500 mb-3">
              © 2024 GetKlean PH. All rights reserved.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs">
              <button
                onClick={() => console.log("Terms clicked")}
                className="text-teal hover:underline"
                data-testid="link-terms"
              >
                Terms and Conditions
              </button>
              <span className="text-gray-400">•</span>
              <button
                onClick={() => console.log("Privacy clicked")}
                className="text-teal hover:underline"
                data-testid="link-privacy"
              >
                Data Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
