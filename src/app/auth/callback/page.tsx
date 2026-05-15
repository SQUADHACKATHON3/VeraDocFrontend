"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api, tokenStore } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      router.replace(`/auth/login?error=${encodeURIComponent(oauthError)}`);
      return;
    }

    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refresh_token");

    if (!token || !refreshToken) {
      router.replace("/auth/login?error=Sign-in%20failed.%20Please%20try%20again.");
      return;
    }

    (async () => {
      try {
        tokenStore.set({
          access_token: token,
          refresh_token: refreshToken,
          token_type: "bearer",
        });

        await refreshUser();
        const user = await api.me();

        router.replace(user.emailVerified ? "/dashboard" : "/auth/verify-email");
      } catch (err) {
        console.error("Auth callback error:", err);
        tokenStore.clear();
        router.replace("/auth/login?error=Sign-in%20failed.%20Please%20try%20again.");
      }
    })();
  }, [router, searchParams, refreshUser]);

  return (
    <div className="vd vd-auth" style={{ minHeight: "100vh", placeItems: "center" }}>
      <main className="vd-auth-main" style={{ width: "100%", maxWidth: 400 }}>
        <div className="vd-auth-form" style={{ textAlign: "center" }}>
          <Loader2 className="animate-spin" size={32} style={{ color: "var(--forest)", margin: "0 auto 16px" }} />
          <p className="vd-auth-kicker">One moment</p>
          <h1 className="vd-auth-title" style={{ fontSize: 28 }}>
            Signing you in…
          </h1>
        </div>
      </main>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="vd" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <Loader2 className="animate-spin" size={32} style={{ color: "var(--forest)" }} />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
