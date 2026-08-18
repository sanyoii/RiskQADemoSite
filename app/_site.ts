const deploymentBasePath = process.env.GITHUB_PAGES === "true" ? "/test-status" : "";

export function siteHref(path: string) {
  if (!path.startsWith("/")) return path;
  return `${deploymentBasePath}${path}`;
}
