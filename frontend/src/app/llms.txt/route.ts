import { api } from "@/lib/api.server";
import { absoluteUrl } from "@/lib/site";
import type { Category, Storefront } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * /llms.txt — a plain-language map of the store for AI assistants (GEO).
 * Built from live CMS data so it never goes stale.
 */
export async function GET() {
  const [storefront, categories] = await Promise.all([
    api<Storefront>("/v1/storefront"),
    api<{ items: Category[] }>("/v1/categories"),
  ]);
  const { store, faq } = storefront;
  const lines = [
    `# ${store.name.en}`,
    "",
    `> ${store.tagline.en}. Digital machine-embroidery design files sold in Pakistani Rupees (PKR). After payment the customer downloads a ZIP containing the listed formats (for example DST, PES, JEF). No physical shipping. Site languages: English (/en) and Urdu (/ur).`,
    "",
    "## Categories",
    ...categories.items.map((c) => `- [${c.name.en}](${absoluteUrl(`/en/c/${c.slug}`)}): ${c.productCount} designs${c.intro.en ? ` — ${c.intro.en}` : ""}`),
    "",
    "## How buying works",
    "- Add designs to the cart, enter name, email and phone at checkout (no account needed).",
    "- Pay with the methods shown at checkout (cards, JazzCash, Easypaisa, bank transfer).",
    "- Download links appear on the order page and are emailed; lost links can be re-sent from Track Order.",
    "",
    "## FAQ",
    ...faq.items.flatMap((item) => [`### ${item.q.en}`, item.a.en, ""]),
    "## Key pages",
    `- [All designs](${absoluteUrl("/en/designs")})`,
    `- [Track order](${absoluteUrl("/en/track")})`,
    `- [Contact](${absoluteUrl("/en/contact")})`,
    ...storefront.pages.map((p) => `- [${p.title.en}](${absoluteUrl(`/en/p/${p.slug}`)})`),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
