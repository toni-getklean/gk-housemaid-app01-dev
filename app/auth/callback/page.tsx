"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("Facebook authentication was cancelled or failed.");
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    if (!code) {
      setError("No authorization code received from Facebook.");
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    handleFacebookCallback(code, state || "login");
  }, [searchParams, router]);

  const handleFacebookCallback = async (code: string, state: string) => {
    try {
      console.log("Fetching Facebook callback...");
      const response = await fetch(
        `/api/auth/facebook/callback?code=${code}&state=${state}`
      );
      const data = await response.json();

      console.log("Facebook callback data:", data);

      if (!response.ok) {
        if (response.status === 401) {
          if (data.facebook_name && data.facebook_id) {
            localStorage.setItem("facebook_name", data.facebook_name);
            localStorage.setItem("facebook_id", data.facebook_id);
            localStorage.setItem("facebook_access_token", data.facebook_access_token);
            localStorage.setItem("token_expires_at", data.token_expires_at);
          }
          setError(
            data.message ||
            "Not a registered housemaid. Please verify your phone number."
          );
          setTimeout(() => router.push("/phone-verification"), 2000);
          return;
        }

        if (response.status === 403 && data.locked) {
          setError(data.message || "Account locked");
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        throw new Error(data.message || "Authentication failed");
      }

      // For "verify" state, store Facebook session data and redirect to phone verification
      if (state === "verify" && data.facebook_id && data.facebook_name) {
        // We still use localStorage for the registration flow temporarily until verified
        localStorage.setItem("facebook_id", data.facebook_id);
        localStorage.setItem("facebook_name", data.facebook_name);
        if (data.facebook_access_token) {
          localStorage.setItem(
            "facebook_access_token",
            data.facebook_access_token
          );
        }
        if (data.token_expires_at) {
          localStorage.setItem("token_expires_at", data.token_expires_at);
        }

        console.log("Setting localStorage in auth callback:", {
          facebook_id: data.facebook_id,
          facebook_name: data.facebook_name,
          facebook_access_token: data.facebook_access_token ? "Yes (Hidden)" : "No",
          token_expires_at: data.token_expires_at
        });

        console.log("Verification successful - routing to phone verification");
        router.push("/phone-verification");
        return;
      }

      // For "login" state, cookie is set by server
      if (data.success) {
        console.log("Login successful - routing to dashboard");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Facebook callback error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
      setTimeout(() => router.push("/login"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-6">
        <div className="text-3xl font-bold mb-4">
          <span className="text-yellow">GET</span>
          <span className="text-teal">KLEAN</span>
        </div>

        {error ? (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900">
              Authentication Error
            </h2>
            <p className="text-base text-gray-700 max-w-md">{error}</p>
            <p className="text-sm text-gray-600">Redirecting...</p>
          </>
        ) : (
          <>
            <Loader2
              className="h-12 w-12 animate-spin text-teal mx-auto"
              data-testid="loading-spinner"
            />
            <h2 className="text-xl font-semibold text-gray-900">
              Authenticating...
            </h2>
            <p className="text-base text-gray-700">
              Please wait while we verify your Facebook account
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <Loader2 className="h-12 w-12 animate-spin text-teal mx-auto" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
