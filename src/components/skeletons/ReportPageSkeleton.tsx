import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";

export default function ReportPageSkeleton() {
  return (
    <div className="vd-pdf-page" aria-busy aria-label="Loading report">
      <SkeletonBlock style={{ width: 160, height: 40, borderRadius: 999, marginBottom: 24 }} />
      <div className="vd-pdf-report" style={{ padding: 32 }}>
        <Skeleton className="vd-skeleton-line sm" style={{ width: 140, marginBottom: 16 }} />
        <Skeleton className="vd-skeleton-line lg" style={{ width: "80%", marginBottom: 24 }} />
        <SkeletonBlock style={{ width: "100%", height: 120, marginBottom: 24 }} />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="vd-skeleton-line" style={{ width: "100%", marginBottom: 12 }} />
        ))}
      </div>
    </div>
  );
}
