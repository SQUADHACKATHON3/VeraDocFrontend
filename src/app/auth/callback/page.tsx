"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, tokenStore } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refresh_token");

    if (!token || !refreshToken) {
      router.push("/auth/login");
      return;
    }

    (async () => {
      try {
        // Store tokens
        tokenStore.set({
          access_token: token,
          refresh_token: refreshToken,
          token_type: "bearer",
        });

        // Hydrate user
        await refreshUser();
        
        // Re-fetch user to check verification status
        const user = await api.me();
        
        if (!user.emailVerified) {
          router.push("/auth/verify-email");
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        router.push("/auth/login?error=callback_failed");
      }
    })();
  }, [router, searchParams, refreshUser]);

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-ink/50 font-medium animate-pulse">Authenticating...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
