import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SkipLink } from "@/components/SkipLink";

export default async function NotFound() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main-content" className="flex flex-1 flex-col" tabIndex={-1}>
        <section className="mx-auto w-full max-w-3xl px-6 py-16">
          <h1 className="text-2xl font-medium text-ink">Page not found</h1>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
