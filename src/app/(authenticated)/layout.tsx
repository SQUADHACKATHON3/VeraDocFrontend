"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AppSidebar from "@/components/layout/AppSidebar";
import AppShellSkeleton from "@/components/skeletons/AppShellSkeleton";
import MobileNav from "@/components/layout/MobileNav";
import BuyCreditsModal from "@/components/BuyCreditsModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [showBuyCredits, setShowBuyCredits] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    } else if (!isLoading && user && !user.emailVerified) {
      router.replace("/auth/verify-email");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <AppShellSkeleton />;
  }

  return (
    <div className="vd vd-shell">
      <Suspense fallback={null}>
        <AppSidebar
          userName={user.name}
          organisation={user.organisation}
          credits={user.credits}
          onTopUp={() => setShowBuyCredits(true)}
          onSignOut={logout}
        />
      </Suspense>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <main className="vd-main">{children}</main>
        <Suspense fallback={null}>
          <MobileNav />
        </Suspense>
      </div>
      <BuyCreditsModal
        open={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
        onPurchased={() => refreshUser()}
      />
    </div>
  );
}
