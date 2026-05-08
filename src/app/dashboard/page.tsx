import { 
  FileSearch, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, University of Lagos</h1>
          <p className="text-zinc-500">Overview of your verification activity.</p>
        </div>
        <Link href="/dashboard/verify" className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
          New Verification
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Verifications", value: "1,284", icon: <FileSearch className="text-blue-400" />, trend: "+12%" },
          { label: "Verified Authentic", value: "1,240", icon: <CheckCircle2 className="text-emerald-400" />, trend: "96.5%" },
          { label: "Flagged Fake", value: "44", icon: <AlertCircle className="text-red-400" />, trend: "3.5%" },
          { label: "Verification Credits", value: "₦12,450", icon: <TrendingUp className="text-purple-400" />, trend: "Top up" },
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-black rounded-lg border border-white/5">
                {stat.icon}
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-zinc-400`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold">Recent Verifications</h3>
            <Link href="/dashboard/history" className="text-sm text-emerald-400 hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {[
              { name: "CHUKWUMA ADAOBI", doc: "B.Sc Computer Science", date: "2 mins ago", status: "Authentic" },
              { name: "IBRAHIM MUSA", doc: "M.Sc Economics", date: "1 hour ago", status: "Authentic" },
              { name: "AKPAN EKONG", doc: "B.Eng Mechanical", date: "3 hours ago", status: "Flagged" },
              { name: "OLOWO SEGUN", doc: "B.Sc Accounting", date: "Yesterday", status: "Authentic" },
            ].map((item, i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-zinc-500">{item.doc} • {item.date}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  item.status === "Authentic" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600/20 to-cyan-600/20 border border-emerald-500/10 rounded-3xl p-8 space-y-6">
          <div className="p-4 bg-emerald-500 rounded-2xl w-fit">
             <ShieldCheck className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-2xl font-bold">Secure Your Institution</h3>
          <p className="text-zinc-400 leading-relaxed">
            Our AI has processed over 1.2M documents with 99.9% accuracy. Ensure your hiring process is bulletproof.
          </p>
          <div className="pt-4">
            <button className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-emerald-400 transition-all">
              Upgrade Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
