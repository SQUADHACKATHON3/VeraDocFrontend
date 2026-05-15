import type { Verdict } from "@/lib/api";

export function formatVerdict(verdict: Verdict | string | null | undefined): string {
  if (!verdict) return "Pending";
  const v = verdict.toUpperCase();
  if (v === "AUTHENTIC") return "Authentic";
  if (v === "SUSPICIOUS") return "Suspicious";
  if (v === "FAKE") return "Fake";
  return verdict;
}

export function verdictPillClass(verdict: Verdict | string | null | undefined): string {
  const v = verdict?.toUpperCase();
  if (v === "AUTHENTIC") return "vd-pill vd-pill-authentic";
  if (v === "SUSPICIOUS") return "vd-pill vd-pill-suspicious";
  if (v === "FAKE") return "vd-pill vd-pill-fake";
  return "vd-pill";
}

/** @deprecated Use verdictPillClass with vd.css */
export function verdictBadgeClass(verdict: Verdict | string | null | undefined): string {
  return verdictPillClass(verdict);
}

export function trustScoreClass(score: number | null | undefined): string {
  if (score == null) return "vd-trust-score vd-trust-score--muted";
  if (score > 74) return "vd-trust-score vd-trust-score--high";
  if (score >= 40) return "vd-trust-score vd-trust-score--mid";
  return "vd-trust-score vd-trust-score--low";
}

export function verdictHeroClass(verdict: Verdict | string): string {
  const v = verdict.toUpperCase();
  if (v === "AUTHENTIC") return "bg-forest-light border-forest/30";
  if (v === "SUSPICIOUS") return "bg-warn-soft border-warn/30";
  return "bg-accent-soft border-accent/30";
}

export function verdictTextClass(verdict: Verdict | string): string {
  const v = verdict.toUpperCase();
  if (v === "AUTHENTIC") return "text-forest";
  if (v === "SUSPICIOUS") return "text-warn";
  return "text-accent";
}

export function forensicVerdictModifier(
  verdict: Verdict | string | null | undefined
): string {
  const v = verdict?.toUpperCase();
  if (v === "AUTHENTIC") return "authentic";
  if (v === "SUSPICIOUS") return "suspicious";
  if (v === "FAKE") return "fake";
  return "pending";
}
