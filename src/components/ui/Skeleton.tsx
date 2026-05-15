import { cn } from "@/lib/cn";

type SkeletonProps = {
  className?: string;
  style?: React.CSSProperties;
};

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <span
      className={cn("vd-skeleton", className)}
      style={style}
      aria-hidden
    />
  );
}

export function SkeletonBlock({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn("vd-skeleton vd-skeleton-block", className)}
      style={style}
      aria-hidden
    />
  );
}
