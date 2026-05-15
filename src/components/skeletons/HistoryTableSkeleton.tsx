import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";

export default function HistoryTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="vd-history-table-wrap">
      <div className="vd-table-scroll">
        <div className="vd-history-table">
          <div className="vd-history-table-head" aria-hidden>
            <span>Document</span>
            <span>Date</span>
            <span>Verdict</span>
            <span>Score</span>
            <span />
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="vd-history-row" style={{ pointerEvents: "none" }}>
              <div>
                <Skeleton className="vd-skeleton-line" style={{ width: "min(280px, 70%)", marginBottom: 8 }} />
                <Skeleton className="vd-skeleton-line xs" style={{ width: 72 }} />
              </div>
              <Skeleton className="vd-skeleton-line sm" style={{ width: 120 }} />
              <SkeletonBlock style={{ width: 72, height: 22, borderRadius: 6 }} />
              <Skeleton className="vd-skeleton-line lg" style={{ width: 36 }} />
              <Skeleton className="vd-skeleton-line sm" style={{ width: 48 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
