import type { NextConfig } from "next";

const isGitHubPagesExport = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isGitHubPagesExport ? "export" : undefined,
  assetPrefix: isGitHubPagesExport ? "/test-status" : undefined,
};

export default nextConfig;
