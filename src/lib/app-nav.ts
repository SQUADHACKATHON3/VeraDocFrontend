/** True for `/verify/[id]` detail and report routes (not `/verify` upload). */
export function isVerifyDetailPath(pathname: string): boolean {
  return /^\/verify\/[^/]+(\/report)?$/.test(pathname);
}

export function isNavItemActive(
  href: string,
  pathname: string,
  searchParams?: Pick<URLSearchParams, "get"> | null
): boolean {
  const fromHistory = searchParams?.get("from") === "history";

  if (href === "/verify") {
    return pathname === "/verify";
  }

  if (href === "/history") {
    return (
      pathname === "/history" ||
      pathname.startsWith("/history/") ||
      (isVerifyDetailPath(pathname) && fromHistory)
    );
  }

  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return (
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(`${href}/`))
  );
}
