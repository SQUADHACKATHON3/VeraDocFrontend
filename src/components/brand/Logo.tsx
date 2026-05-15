import Link from "next/link";
import Image from "next/image";

type LogoProps = {
  href?: string;
  className?: string;
  height?: number;
  center?: boolean;
};

export default function Logo({ href = "/", className, height = 28, center }: LogoProps) {
  const mark = (
    <div className={`vd-logo-container${className ? ` ${className}` : ""}`} style={{ display: 'flex', alignItems: 'center', justifyContent: center ? 'center' : 'flex-start', gap: '8px' }}>
      <Image
        src="/assets/veradoc_logo.png"
        alt="VeraDoc"
        width={height}
        height={height}
        style={{ 
          height: `${height}px`, 
          width: 'auto',
          filter: className?.includes('vd-logo-light') ? 'brightness(0) invert(1)' : undefined
        }}
        priority
      />
      <span className="vd-logo" style={{ fontSize: `${height * 0.8}px` }}>
        Vera<em>Doc</em>
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none" }}>
        {mark}
      </Link>
    );
  }

  return mark;
}
