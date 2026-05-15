"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReportPageSkeleton from "@/components/skeletons/ReportPageSkeleton";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import VerificationReportDocument from "@/components/report/VerificationReportDocument";

export default function VerificationReportPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getVerification>> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [printed, setPrinted] = useState(false);

  const fromHistory = searchParams.get("from") === "history";
  const autoPrint = searchParams.get("print") === "1";
  const backHref = fromHistory ? "/history" : `/verify/${id}`;

  useEffect(() => {
    const load = async () => {
      try {
        const result = await api.getVerification(id);
        if (result.status !== "complete" || !result.verdict) {
          router.replace(fromHistory ? `/verify/${id}?from=history` : `/verify/${id}`);
          return;
        }
        setData(result);
      } catch (err) {
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
          router.push("/history");
          return;
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) load();
  }, [id, router, fromHistory]);

  useEffect(() => {
    if (!autoPrint || isLoading || !data || printed) return;
    const t = setTimeout(() => {
      window.print();
      setPrinted(true);
    }, 400);
    return () => clearTimeout(t);
  }, [autoPrint, isLoading, data, printed]);

  if (isLoading) {
    return <ReportPageSkeleton />;
  }

  if (!data) return null;

  return (
    <div className="vd-pdf-page">
      <div className="vd-pdf-toolbar" style={{ marginBottom: 16 }}>
        <Link href={backHref} className="vd-btn-pill vd-btn-pill-light">
          <ArrowLeft size={16} />
          {fromHistory ? "Back to history" : "Back to report"}
        </Link>
      </div>
      <VerificationReportDocument
        data={data}
        user={user ? { name: user.name, organisation: user.organisation } : null}
      />
    </div>
  );
}
