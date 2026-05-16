"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import { api, type VerificationListItem } from "@/lib/api";
import {
  formatVerdict,
  trustScoreClass,
  verdictPillClass,
} from "@/lib/verdict";
import { cn } from "@/lib/cn";
import HistoryTableSkeleton from "@/components/skeletons/HistoryTableSkeleton";

const PAGE_SIZE = 10;
const FILTERS = ["All", "AUTHENTIC", "NEEDS REVIEW", "FAKE"] as const;

function HistoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get("search") || "";
  const initialFilter = searchParams.get("verdict") || "All";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [search, setSearch] = useState(initialSearch);
  const [filter, setFilter] = useState(initialFilter);
  const [page, setPage] = useState(initialPage);
  const [verifications, setVerifications] = useState<VerificationListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const updateUrl = useCallback(
    (newSearch: string, newFilter: string, newPage: number) => {
      const params = new URLSearchParams();
      if (newSearch) params.set("search", newSearch);
      if (newFilter !== "All") params.set("verdict", newFilter);
      if (newPage > 1) params.set("page", String(newPage));
      router.push(`/history?${params.toString()}`);
    },
    [router]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== initialSearch) {
        setPage(1);
        updateUrl(search, filter, 1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, initialSearch, filter, updateUrl]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await api.listVerifications({
          page,
          limit: PAGE_SIZE,
          verdict: filter !== "All" ? filter : undefined,
          search: search || undefined,
        });
        setVerifications(data.data);
        setTotalPages(Math.max(1, Math.ceil(data.total / data.limit)));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [page, filter, search]);

  return (
    <div className="vd-history">
      <p className="vd-dash-meta">Archive</p>
      <h1 className="vd-serif" style={{ fontSize: "clamp(28px, 4vw, 36px)", marginBottom: 8 }}>
        Verification <em>history.</em>
      </h1>
      <p className="vd-verify-lead" style={{ marginBottom: 32 }}>
        Every document you&apos;ve submitted. Filter, search, export.
      </p>

      <div className="vd-history-toolbar">
        <div className="vd-history-search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="vd-input"
          />
        </div>
        <div className="vd-history-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f);
                setPage(1);
                updateUrl(search, f, 1);
              }}
              className={cn(filter === f && "is-active")}
            >
              {f === "All" ? "All" : formatVerdict(f)}
            </button>
          ))}
        </div>
        <button type="button" className="vd-btn-pill vd-btn-pill-light">
          <Download size={16} />
          Export
        </button>
      </div>

      {isLoading ? (
        <HistoryTableSkeleton />
      ) : (
        <div className="vd-history-table-wrap">
          {verifications.length === 0 ? (
            <div className="vd-history-empty">
              <p>No verifications found.</p>
              <Link href="/verify" className="vd-btn-pill vd-btn-pill-dark">
                Start a verification
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="vd-table-scroll">
              <div className="vd-history-table">
                <div className="vd-history-table-head" aria-hidden>
                  <span>Document</span>
                  <span>Date</span>
                  <span>Verdict</span>
                  <span>Score</span>
                  <span />
                </div>
                {verifications.map((v) => (
                  <Link
                    key={v.id}
                    href={`/verify/${v.id}?from=history`}
                    className="vd-history-row"
                  >
                    <div>
                      <p className="name">{v.documentName}</p>
                      <p className="ref">VD-{v.id.slice(0, 4).toUpperCase()}</p>
                    </div>
                    <p className="date">
                      {new Date(v.createdAt).toLocaleString("en-NG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <span className={verdictPillClass(v.verdict)}>
                      {formatVerdict(v.verdict).toUpperCase()}
                    </span>
                    <span className={cn("score", trustScoreClass(v.trustScore))}>
                      {v.trustScore ?? "—"}
                    </span>
                    <span className="view">
                      View <ArrowRight size={12} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="vd-history-pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => {
              setPage(page - 1);
              updateUrl(search, filter, page - 1);
            }}
            className="vd-btn-pill vd-btn-pill-light"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => {
              setPage(page + 1);
              updateUrl(search, filter, page + 1);
            }}
            className="vd-btn-pill vd-btn-pill-light"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function HistoryPageSkeleton() {
  return (
    <div className="vd-history">
      <p className="vd-dash-meta">Archive</p>
      <h1 className="vd-serif" style={{ fontSize: "clamp(28px, 4vw, 36px)", marginBottom: 8 }}>
        Verification <em>history.</em>
      </h1>
      <p className="vd-verify-lead" style={{ marginBottom: 32 }}>
        Every document you&apos;ve submitted. Filter, search, export.
      </p>
      <HistoryTableSkeleton />
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<HistoryPageSkeleton />}>
      <HistoryContent />
    </Suspense>
  );
}
