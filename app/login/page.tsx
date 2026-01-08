"use client";

import { Button } from "@/components/ui/button";
import { SiFacebook } from "react-icons/si";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const handleFacebookLogin = () => {
    const facebookAppId =
      process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "YOUR_FACEBOOK_APP_ID";
    // const redirectUri = `${window.location.origin}/api/auth/facebook/callback`;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = "public_profile,email";

    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}&response_type=code&state=login`;

    console.log("Redirecting to Facebook OAuth for login...");
    window.location.href = facebookAuthUrl;
  };

  const handleVerifyAccount = () => {
    const facebookAppId =
      process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "YOUR_FACEBOOK_APP_ID";
    // const redirectUri = `${window.location.origin}/api/auth/facebook/callback`;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = "public_profile,email";

    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}&response_type=code&state=verify`;

    console.log("Redirecting to Facebook OAuth for verification...");
    window.location.href = facebookAuthUrl;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="relative h-[35vh] w-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              Professional Cleaning
            </h2>
          </div>
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
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Sign in
            </h1>
            <p className="text-base text-gray-700">
              Welcome to the Housemaid App!
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleFacebookLogin}
              className="w-full h-14 bg-[#1877F2] hover:bg-[#1565D8] text-white font-semibold text-base flex items-center justify-center gap-3"
              data-testid="button-facebook-login"
            >
              <SiFacebook className="h-5 w-5" />
              Continue with Facebook
            </Button>

            <p className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={handleVerifyAccount}
                className="text-blue font-medium hover:underline"
                data-testid="link-verify-account"
              >
                Verify your account →
              </button>
            </p>
          </div>

          <div className="flex-1 min-h-[100px]" />
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
