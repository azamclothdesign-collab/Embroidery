import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Product images are pre-sized WebP variants made by the backend at upload time.
    loader: "custom",
    loaderFile: "./src/lib/mediaLoader.ts",
    deviceSizes: [400, 800, 1600],
    imageSizes: [400],
  },
  experimental: {
    serverActions: { bodySizeLimit: "1mb" },
  },
  // nginx serves these paths in production; the rewrites make local development work the same way.
  async rewrites() {
    const backend = (process.env.BACKEND_URL ?? "http://127.0.0.1:4000").replace(/\/+$/, "");
    return [
      { source: "/media/:path*", destination: `${backend}/media/:path*` },
      { source: "/dl/:path*", destination: `${backend}/dl/:path*` },
      { source: "/hooks/:path*", destination: `${backend}/hooks/:path*` },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
