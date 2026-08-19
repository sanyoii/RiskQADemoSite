const deploymentBasePath = process.env.GITHUB_PAGES === "true" ? "/test-status" : "";

export function siteHref(path: string) {
  if (!path.startsWith("/")) return path;
  const hashIndex = path.indexOf("#");
  const pathname = hashIndex === -1 ? path : path.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : path.slice(hashIndex);
  const directoryPath = pathname === "/" || pathname.endsWith("/") ? pathname : `${pathname}/`;
  return `${deploymentBasePath}${directoryPath}${hash}`;
}
