import type { NextConfig } from "next";

// GitHub Pages serves the site under /dev-ledger/. Locally, `pnpm dev` runs at the
// root, so http://localhost:3000/ is the home page.
const basePath = process.env.NODE_ENV === "production" ? "/dev-ledger" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
