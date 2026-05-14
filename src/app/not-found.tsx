import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-bg text-foreground font-sans flex items-center justify-center px-6">
      <div className="relative z-10 text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-card border border-card-border flex items-center justify-center mx-auto mb-8">
          <FileQuestion className="w-8 h-8 text-primary-light" />
        </div>

        <h1 className="text-7xl md:text-8xl font-heading font-black text-card tracking-tighter mb-4">
          404
        </h1>
        <h2 className="text-2xl font-heading font-bold mb-3">Page not found</h2>
        <p className="text-foreground/60 leading-relaxed mb-10">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full font-bold transition-all hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
