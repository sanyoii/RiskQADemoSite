function resolveDeploymentBasePath(): string {
  if (typeof process !== "undefined" && process.env?.GITHUB_PAGES === "true") {
    return "/test-status";
  }
  if (
    typeof window !== "undefined" &&
    (window.location.pathname === "/test-status" ||
      window.location.pathname.startsWith("/test-status/"))
  ) {
    return "/test-status";
  }
  return "";
}

export function siteHref(path: string) {
  if (!path.startsWith("/")) return path;
  const deploymentBasePath = resolveDeploymentBasePath();
  const hashIndex = path.indexOf("#");
  const rawPathname = hashIndex === -1 ? path : path.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : path.slice(hashIndex);
  const pathname =
    deploymentBasePath &&
    (rawPathname === deploymentBasePath || rawPathname.startsWith(`${deploymentBasePath}/`))
      ? rawPathname.slice(deploymentBasePath.length) || "/"
      : rawPathname;
  const directoryPath = pathname === "/" || pathname.endsWith("/") ? pathname : `${pathname}/`;
  return `${deploymentBasePath}${directoryPath}${hash}`;
}
