import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["/admin", "/en/cart", "/ur/cart", "/en/checkout", "/ur/checkout", "/en/order/", "/ur/order/", "/dl/", "/hooks/", "/*?*sort=", "/*/search"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: privatePaths },
      // AI answer engines may read public catalogue pages (GEO), never private ones.
      { userAgent: ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended"], allow: "/", disallow: privatePaths },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
