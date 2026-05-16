"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { useAuth } from "@/context/AuthContext";
import { api, type VerificationListItem } from "@/lib/api";
import { formatVerdict, verdictPillClass } from "@/lib/verdict";
import OnboardingModal from "@/components/OnboardingModal";

export default function DashboardPage() {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<VerificationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    authentic: 0,
    suspicious: 0,
    fake: 0,
  });

  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && !user.organisation && !isLoading) {
      setShowOnboarding(true);
    }
  }, [user, isLoading]);

  useEffect(() => {
    setCurrentTime(new Date());
    const fetchData = async () => {
      try {
        const [all, authentic, suspicious, fake, recent] = await Promise.all([
          api.listVerifications({ limit: 1 }),
          api.listVerifications({ limit: 1, verdict: "authentic" }),
          api.listVerifications({ limit: 1, verdict: "suspicious" }),
          api.listVerifications({ limit: 1, verdict: "fake" }),
          api.listVerifications({ limit: 5 }),
        ]);
        setStats({
          total: all.total,
          authentic: authentic.total,
          suspicious: suspicious.total,
          fake: fake.total,
        });
        setVerifications(recent.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const hour = currentTime?.getHours() ?? 12;
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const dateStr = currentTime
    ? currentTime
        .toLocaleString("en-GB", {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Africa/Lagos",
          timeZoneName: "short",
        })
        .replace(",", " ·")
    : "";


  const flagged = stats.suspicious + stats.fake;
  const authenticPct =
    stats.total > 0 ? Math.round((stats.authentic / stats.total) * 100) : 0;
  const mixMax = Math.max(stats.authentic, stats.suspicious, stats.fake, 1);

  const summary =
    flagged > 0
      ? `${stats.total} documents verified this period. ${flagged} flagged for review.`
      : stats.total > 0
        ? `${stats.total} documents verified. All clear for review.`
        : "Your verification overview at a glance.";

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <p className="vd-dash-meta">{dateStr}</p>

      <header className="vd-dash-header">
        <div>
          <h1 className="vd-serif">
            {greeting}, <em>{firstName}</em>.
          </h1>
          <p>{summary}</p>
        </div>
        <Link href="/verify" className="vd-btn-pill vd-btn-pill-dark">
          New verification
          <ArrowRight size={16} />
        </Link>
      </header>

      <div className="vd-dash-stats">
        <div className="vd-dash-stat">
          <p className="vd-eyebrow">Verified this month</p>
          <p className="value">{stats.total}</p>
          <p className="sub">all time</p>
        </div>
        <div className="vd-dash-stat">
          <p className="vd-eyebrow">Authentic</p>
          <p className="value">{stats.authentic}</p>
          <p className="sub">{stats.total ? `${authenticPct}%` : "—"}</p>
        </div>
        <div className="vd-dash-stat">
          <p className="vd-eyebrow">Flagged</p>
          <p className="value">{flagged}</p>
          <p className="sub">Needs review</p>
        </div>
        <div className="vd-dash-stat">
          <p className="vd-eyebrow">Credits remaining</p>
          <p className="value">{user?.credits ?? 0}</p>
          <p className="sub">~{user?.credits ?? 0} verifications</p>
        </div>
      </div>

      <div className="vd-dash-grid">
        <div className="vd-dash-card">
          <div className="vd-dash-card-head">
            <h2>Recent verifications</h2>
            <Link href="/history">View all →</Link>
          </div>

          {verifications.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <p style={{ color: "var(--ink-2)", marginBottom: 16 }}>Nothing verified yet.</p>
              <Link href="/verify" className="vd-btn-pill vd-btn-pill-dark">
                Verify your first document
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
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
                {verifications.map((v) => (
                  <Link key={v.id} href={`/verify/${v.id}`} className="vd-dash-table-row">
                    <FileText size={18} style={{ color: "var(--ink-3)" }} />
                    <span className="name">{v.documentName}</span>
                    <span className="time">
                      {new Date(v.createdAt).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {v.verdict ? (
                      <span className={verdictPillClass(v.verdict)}>
                        {formatVerdict(v.verdict).toUpperCase()}
                      </span>
                    ) : (
                      <span className="vd-pill">Pending</span>
                    )}
                    <span className="score">{v.trustScore ?? "—"}</span>
                    <span className="view">View →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="vd-dash-aside-col">
          <div className="vd-dash-upload">
            <p className="vd-eyebrow">Ready when you are</p>
            <h3>
              Verify a new
              <br />
              document.
            </h3>
            <p>Average analysis takes 8 seconds. 1 credit per verification.</p>
            <Link href="/verify" className="vd-btn-pill vd-btn-pill-light">
              Upload document
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="vd-dash-card vd-dash-mix">
            <p className="vd-eyebrow">Verdict mix · 30 days</p>
            {[
              { key: "authentic", label: "Authentic", count: stats.authentic },
              { key: "suspicious", label: "Suspicious", count: stats.suspicious },
              { key: "fake", label: "Fake", count: stats.fake },
            ].map((row) => (
              <div key={row.key} className="vd-dash-mix-row">
                <header>
                  <span>{row.label}</span>
                  <span className="count">{row.count}</span>
                </header>
                <div className="vd-dash-mix-bar">
                  <span
                    className={row.key}
                    style={{
                      width: `${Math.round((row.count / mixMax) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <OnboardingModal
        open={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </>
  );
}
