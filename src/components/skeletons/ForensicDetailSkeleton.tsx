import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";

export default function ForensicDetailSkeleton() {
  return (
    <div className="vd-forensic-skeleton" aria-busy aria-label="Loading report">
      <SkeletonBlock className="vd-forensic-skeleton-block vd-skeleton-block" />
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <SkeletonBlock
          className="vd-skeleton-block"
          style={{ width: 120, height: 120, borderRadius: "50%", flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 200 }}>
          <Skeleton className="vd-skeleton-line lg" style={{ width: "70%", marginBottom: 12 }} />
          <Skeleton className="vd-skeleton-line" style={{ width: "50%", marginBottom: 8 }} />
          <Skeleton className="vd-skeleton-line sm" style={{ width: "40%" }} />
        </div>
      </div>
      <SkeletonBlock className="vd-forensic-skeleton-block tall vd-skeleton-block" />
      <SkeletonBlock className="vd-forensic-skeleton-block tall vd-skeleton-block" />
    </div>
  );
}
