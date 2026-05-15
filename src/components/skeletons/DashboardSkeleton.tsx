import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";

export default function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="vd-skeleton-line sm" style={{ width: 220, marginBottom: 8 }} />
      <div className="vd-dash-header" style={{ marginBottom: 28 }}>
        <div style={{ flex: 1 }}>
          <Skeleton className="vd-skeleton-line lg" style={{ width: "min(360px, 80%)", marginBottom: 10 }} />
          <Skeleton className="vd-skeleton-line" style={{ width: "min(420px, 90%)" }} />
        </div>
        <SkeletonBlock style={{ width: 168, height: 48, borderRadius: 999 }} />
      </div>

      <div className="vd-dash-stats" style={{ marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="vd-dash-stat">
            <Skeleton className="vd-skeleton-line xs" style={{ width: 100, marginBottom: 12 }} />
            <Skeleton className="vd-skeleton-line xl" style={{ width: 56, marginBottom: 8 }} />
            <Skeleton className="vd-skeleton-line sm" style={{ width: 72 }} />
          </div>
        ))}
      </div>

      <div className="vd-dash-grid">
        <div className="vd-dash-card">
          <div className="vd-dash-card-head">
            <Skeleton className="vd-skeleton-line md" style={{ width: 160 }} />
            <Skeleton className="vd-skeleton-line sm" style={{ width: 72 }} />
          </div>
          <div className="vd-table-scroll">
            <div className="vd-dash-table">
              <div className="vd-dash-table-head" aria-hidden>
                <span />
                <span>Document</span>
                <span>Time</span>
                <span>Verdict</span>
                <span>Score</span>
                <span />
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="vd-dash-table-row" style={{ pointerEvents: "none" }}>
                  <SkeletonBlock style={{ width: 18, height: 18, borderRadius: 4 }} />
                  <Skeleton className="vd-skeleton-line" style={{ width: "70%" }} />
                  <Skeleton className="vd-skeleton-line sm" style={{ width: 48 }} />
                  <SkeletonBlock style={{ width: 72, height: 24, borderRadius: 6 }} />
                  <Skeleton className="vd-skeleton-line sm" style={{ width: 32 }} />
                  <Skeleton className="vd-skeleton-line sm" style={{ width: 48 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="vd-dash-aside-col">
          <SkeletonBlock className="vd-dash-upload" style={{ minHeight: 200, borderRadius: "var(--r-lg)" }} />
          <div className="vd-dash-card vd-dash-mix" style={{ padding: 20 }}>
            <Skeleton className="vd-skeleton-line xs" style={{ width: 140, marginBottom: 16 }} />
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Skeleton className="vd-skeleton-line sm" style={{ width: 80 }} />
                  <Skeleton className="vd-skeleton-line sm" style={{ width: 24 }} />
                </div>
                <SkeletonBlock style={{ width: "100%", height: 6, borderRadius: 999 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
