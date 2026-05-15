import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";

export default function AppShellSkeleton() {
  return (
    <div className="vd vd-shell-skeleton" aria-busy aria-label="Loading">
      <aside className="vd-sidebar" aria-hidden>
        <SkeletonBlock style={{ width: 120, height: 28, marginBottom: 32, borderRadius: 8 }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="vd-skeleton-line" style={{ width: i === 1 ? "90%" : "75%", marginBottom: 12 }} />
        ))}
        <div style={{ marginTop: "auto", paddingTop: 24 }}>
          <SkeletonBlock style={{ width: "100%", height: 56, borderRadius: 12 }} />
        </div>
      </aside>
      <div className="vd-shell-skeleton-main">
        <Skeleton className="vd-skeleton-line sm" style={{ width: 200, marginBottom: 24 }} />
        <Skeleton className="vd-skeleton-line lg" style={{ width: "min(320px, 60%)", marginBottom: 12 }} />
        <Skeleton className="vd-skeleton-line" style={{ width: "min(400px, 80%)", marginBottom: 32 }} />
        <SkeletonBlock style={{ width: "100%", height: 280, borderRadius: "var(--r-lg)" }} />
      </div>
    </div>
  );
}
