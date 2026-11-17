import { jsonLdString } from "@/lib/seo";

/** Structured data block. Content is escaped so it can never break out of the script tag. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
