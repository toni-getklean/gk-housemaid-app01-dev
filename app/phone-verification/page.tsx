"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Phone, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function PhoneVerification() {
  const router = useRouter();
  const { toast } = useToast();
  const [facebookName, setFacebookName] = useState("");
  const [facebookId, setFacebookId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("facebook_name");
    const storedId = localStorage.getItem("facebook_id");
    if (!storedName) {
      toast({
        variant: "destructive",
        title: "Session expired",
        description: "Please log in again with Facebook.",
      });
      router.push("/login");
      return;
    }
    setFacebookName(storedName);
    setFacebookId(storedId ?? "");
  }, [router, toast]);

  const handleSendOTP = async () => {
    if (!facebookName) {
      setError("Facebook name not found. Please log in again.");
      return;
    }

    const fullNumber = `+63${phoneNumber.replace(/\s/g, "")}`;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facebookName: facebookName,
          mobileNumber: fullNumber,
          facebookId: facebookId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError(data.message || "Not a registered housemaid");
          toast({
            variant: "destructive",
            title: "Verification failed",
            description: data.message || "Phone number not registered",
          });
          return;
        }

        if (response.status === 403 && data.locked) {
          setError(data.message || "Account locked");
          toast({
            variant: "destructive",
            title: "Account locked",
            description: data.message,
          });
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        if (response.status === 429 && data.locked) {
          setError(data.message || "Too many OTP requests");
          toast({
            variant: "destructive",
            title: "Rate limit exceeded",
            description: data.message,
          });
          return;
        }

        throw new Error(data.message || "Failed to send OTP");
      }

      console.log("phone verification data:", data);

      if (data.success && data.data) {
        localStorage.setItem("mobile_number", fullNumber);
        localStorage.setItem("facebook_id", data.data.facebook_id);

        toast({
          title: "OTP sent successfully",
          description: `Check your phone ${fullNumber} for the verification code`,
        });

        router.push("/otp-verification");
      }
    } catch (err) {
      console.error("Phone verification error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send OTP";
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

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6)
      return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(
      6,
      10
    )}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const isValidPhone = phoneNumber.replace(/\s/g, "").length === 10;

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
          <p className="text-sm text-gray-600">Home Cleaning Services</p>
        </div>

        <div className="border-t border-gray-200 mb-8" />

        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Verify your account
            </h1>
            <p className="text-sm text-gray-600">
              Enter your registered mobile number
            </p>
          </div>

          {facebookName && (
            <div>
              <p className="text-lg font-semibold text-gray-900">
                Welcome, {facebookName}! 👋
              </p>
              <p className="text-xs text-gray-600 mt-1">(From Facebook)</p>
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

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-900"
            >
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <div className="absolute left-12 top-1/2 -translate-y-1/2 flex items-center">
                <span className="text-gray-900 font-medium">+63</span>
                <span className="text-gray-400 mx-2">|</span>
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="917 123 4567"
                value={phoneNumber}
                onChange={handlePhoneChange}
                maxLength={12}
                className="pl-24 h-14 text-base"
                data-testid="input-phone-number"
              />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              This number must be registered with GetKlean.
              <br />
              Contact admin if not listed.
            </p>
          </div>

          <Button
            onClick={handleSendOTP}
            disabled={!isValidPhone || isLoading}
            className="w-full h-14 bg-teal hover:bg-teal-hover text-white font-semibold text-base disabled:bg-gray-400"
            data-testid="button-send-otp"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Send OTP"
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
