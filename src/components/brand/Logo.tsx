import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
};

export default function Logo({ href = "/", className }: LogoProps) {
  const mark = (
    <span className={`vd-logo${className ? ` ${className}` : ""}`}>
      Vera<em>Doc</em>
    </span>
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
