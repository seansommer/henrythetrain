import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the existing Site build unchanged. Pages gets only static public files.
  ...(process.env.GITHUB_PAGES_BUILD === "1" ? {
    output: "export",
    basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "/henrythetrain",
    trailingSlash: true,
    images: { unoptimized: true },
    typescript: { tsconfigPath: "tsconfig.pages.json" },
  } : {}),
};

export default nextConfig;
