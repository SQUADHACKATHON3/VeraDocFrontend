/**
 * History Page — /history
 * A list of all past verification requests and their results.
 * Auth required: Yes
 */
"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FileText,
  Search,
  ArrowRight,
  Shield,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { api, type VerificationListItem } from "@/lib/api";

const PAGE_SIZE = 10;

type PaginationData = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

function HistoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL-synced states
  const initialSearch = searchParams.get("search") || "";
  const initialFilter = searchParams.get("verdict") || "All";
  const initialPage = parseInt(searchParams.get("page") || "1");

  const [search, setSearch] = useState(initialSearch);
  const [filter, setFilter] = useState(initialFilter);
  const [page, setPage] = useState(initialPage);
  
  const [verifications, setVerifications] = useState<VerificationListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Sync URL when states change
  const updateUrl = useCallback((newSearch: string, newFilter: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newFilter !== "All") params.set("verdict", newFilter);
    if (newPage > 1) params.set("page", newPage.toString());
    
    router.push(`/history?${params.toString()}`);
  }, [router]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== initialSearch) {
        setPage(1);
        updateUrl(search, filter, 1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, initialSearch, filter, updateUrl]);

  // Fetch data
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
        setPagination({
          currentPage: data.page,
          totalPages: Math.max(1, Math.ceil(data.total / data.limit)),
          totalItems: data.total,
        });
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, filter, initialSearch, search]); // Re-fetch on state changes

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPage(1);
    updateUrl(search, newFilter, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl(search, filter, newPage);
  };

  const getVerdictStyles = (verdict: string) => {
    switch (verdict) {
      case "AUTHENTIC": return "bg-[#052e16] text-[#16A34A] border-[#16A34A]";
      case "SUSPICIOUS": return "bg-[#431407] text-[#D97706] border-[#D97706]";
      case "FAKE": return "bg-[#450a0a] text-[#DC2626] border-[#DC2626]";
      default: return "bg-white/5 text-foreground/40 border-white/10";
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 74) return "bg-green-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 reveal active">
        <div>
          <h1 className="text-4xl font-heading font-black mb-2">Verification History</h1>
          <p className="text-foreground/50 font-medium">All documents you have submitted for verification.</p>
        </div>
        <Link href="/verify" className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-[1.02] w-full md:w-auto justify-center">
          New Verification <ArrowRight className="w-5 h-5" />
        </Link>
      </header>

      {/* Filter + Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 reveal active" style={{ transitionDelay: "100ms" }}>
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search by document name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-card-border focus:border-primary rounded-2xl pl-12 pr-6 py-4 outline-none transition-all font-medium text-white placeholder:text-white/10"
          />
        </div>
        <div className="flex items-center gap-2 p-1.5 glass rounded-2xl overflow-x-auto">
          {["All", "AUTHENTIC", "SUSPICIOUS", "FAKE"].map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all whitespace-nowrap ${
                filter === f
                  ? "bg-primary text-white"
                  : "text-foreground/40 hover:text-white hover:bg-white/5"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6 reveal active" style={{ transitionDelay: "200ms" }}>
        <div className="glass rounded-[2.5rem] overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-6 animate-pulse">
                  <div className="h-16 w-full bg-white/5 rounded-2xl"></div>
                </div>
              ))}
            </div>
          ) : verifications.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Document Name</th>
                      <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Date</th>
                      <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Verdict</th>
                      <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Trust Score</th>
                      <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {verifications.map((v) => (
                      <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-foreground/40">
                              <FileText className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-white text-sm">{v.documentName}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-white text-xs font-bold">{new Date(v.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">{new Date(v.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black border tracking-wider ${getVerdictStyles(v.verdict ?? "")}`}>
                            {v.verdict ?? v.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-8 py-6 min-w-[140px]">
                          <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                              <span className={`text-sm font-black font-heading ${v.trustScore != null ? getScoreColor(v.trustScore).replace('bg-', 'text-') : "text-foreground/30"}`}>
                                {v.trustScore != null ? `${v.trustScore}%` : "—"}
                              </span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full ${v.trustScore != null ? getScoreColor(v.trustScore) : "bg-white/10"} transition-all duration-1000`} style={{ width: `${v.trustScore ?? 0}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Link href={`/verify/${v.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground/30 group-hover:text-primary transition-all">
                            View <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-white/5">
                {verifications.map((v) => (
                  <div key={v.id} className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-foreground/40" />
                        <span className="font-bold text-white text-sm">{v.documentName}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black border tracking-wider ${getVerdictStyles(v.verdict ?? "")}`}>
                        {v.verdict ?? v.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{new Date(v.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm font-black font-heading text-white">{v.trustScore != null ? `${v.trustScore}% Trust` : "Pending"}</p>
                      </div>
                      <Link href={`/verify/${v.id}`} className="text-xs font-bold text-primary flex items-center gap-1">
                        View Report <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-20 text-center flex flex-col items-center justify-center space-y-6">
              <div className="w-20 h-20 rounded-[2rem] bg-card flex items-center justify-center border border-card-border">
                <Shield className="w-10 h-10 text-foreground/20" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-heading font-bold">
                  {search || filter !== "All" ? "No results found for your search." : "No verifications yet."}
                </p>
                <p className="text-foreground/40 font-medium">
                  {search || filter !== "All" ? "Try adjusting your filters or search terms." : "Your verification history will appear here."}
                </p>
              </div>
              {search || filter !== "All" ? (
                <button 
                  onClick={() => { setSearch(""); setFilter("All"); setPage(1); updateUrl("", "All", 1); }}
                  className="text-primary font-bold hover:underline underline-offset-8"
                >
                  Clear all filters
                </button>
              ) : (
                <Link href="/verify" className="bg-white text-dark-bg px-8 py-3 rounded-full font-bold transition-all hover:scale-105">
                  Run your first verification →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-2 pt-4 reveal active">
            <button 
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className="flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-white disabled:opacity-20 disabled:hover:text-foreground/40 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Previous
            </button>
            <span className="text-xs font-bold text-foreground/30 uppercase tracking-[0.2em]">
              Page <span className="text-white">{pagination.currentPage}</span> of {pagination.totalPages}
            </span>
            <button 
              disabled={page === pagination.totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-white disabled:opacity-20 disabled:hover:text-foreground/40 transition-colors"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <HistoryContent />
    </Suspense>
  );
}
