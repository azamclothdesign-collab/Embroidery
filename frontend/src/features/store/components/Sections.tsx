import { ArrowRight, ChevronDown, CreditCard, Download, MousePointerClick } from "lucide-react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { mediaUrl } from "@/lib/mediaLoader";
import { pick, type Category, type Locale, type Storefront } from "@/lib/types";

export function SectionHeader({ title, text, href, linkLabel }: { title: string; text?: string; href?: string; linkLabel?: string }) {
  return (
    <div data-reveal className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="section-title">{title}</h2>
        {text !== undefined && <p className="mt-2 max-w-xl text-ink-soft">{text}</p>}
      </div>
      {href !== undefined && linkLabel !== undefined && (
        <Link href={href} className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-teal hover:text-ink">
          {linkLabel}
          <ArrowRight className="flip-rtl size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}

export function CategoryGrid({ categories, locale, t }: { categories: Category[]; locale: Locale; t: Dictionary }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
      {categories.map((category, index) => (
        <li key={category.id} data-reveal-item>
          <Link
            href={`/${locale}/c/${category.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
          >
            <div className="flex aspect-[4/3] items-center justify-center bg-sand p-2">
              {category.image !== null ? (
                // eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP; contain keeps full design
                <img
                  src={mediaUrl(category.image, 800)}
                  alt=""
                  decoding="async"
                  {...(index < 4 ? {} : { loading: "lazy" as const })}
                  className="max-h-full max-w-full object-contain object-center transition duration-500 group-hover:scale-[1.04]"
                  srcSet={`${mediaUrl(category.image, 400)} 400w, ${mediaUrl(category.image, 800)} 800w, ${mediaUrl(category.image, 1600)} 1600w`}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                />
              ) : (
                <div aria-hidden className="flex h-full items-center justify-center text-5xl font-semibold text-line">
                  {pick(category.name, locale).charAt(0)}
                </div>
              )}
            </div>
            <div className="flex flex-1 items-center justify-between gap-2 p-4">
              <div className="min-w-0">
                <h3 className="text-[0.98rem] leading-snug font-semibold">{pick(category.name, locale)}</h3>
                <p className="text-xs text-muted">
                  {category.productCount} {t.product.designs}
                </p>
              </div>
              <ArrowRight className="flip-rtl size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-saffron-strong rtl:group-hover:-translate-x-0.5" aria-hidden />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HowItWorks({ t }: { t: Dictionary }) {
  const icons = [MousePointerClick, CreditCard, Download];
  return (
    <section className="section bg-paper" aria-labelledby="how-title">
      <div className="container-page">
        <h2 id="how-title" data-reveal className="section-title mb-10 text-center">
          {t.home.howTitle}
        </h2>
        <ol className="grid gap-5 md:grid-cols-3">
          {t.home.how.map((step, index) => {
            const Icon = icons[index] ?? Download;
            return (
              <li key={step.title} data-reveal-item className="relative rounded-[var(--radius-card)] border border-dashed border-ink/20 p-7">
                <span className="absolute end-6 top-5 text-5xl font-semibold text-sand" aria-hidden>
                  {index + 1}
                </span>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-teal-soft text-teal">
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="mt-5 text-xl">{step.title}</h3>
                <p className="mt-1.5 text-ink-soft">{step.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

const MACHINES: Array<[string, string]> = [
  ["DST", "Tajima / Barudan / Ricoma"],
  ["EMB", "Wilcom / design software"],
];

export function FormatsStrip({ t }: { t: Dictionary }) {
  return (
    <section className="section">
      <div className="container-page">
        <SectionHeader title={t.home.formatsTitle} text={t.home.formatsText} />
        <ul className="grid grid-cols-2 gap-3 sm:max-w-xl">
          {MACHINES.map(([format, brands]) => (
            <li key={format} data-reveal-item className="card p-4">
              <p className="text-2xl font-semibold text-saffron-strong" dir="ltr">.{format.toLowerCase()}</p>
              <p className="mt-1 text-sm text-ink-soft" dir="ltr">{brands}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FaqList({ items, locale }: { items: Storefront["faq"]["items"]; locale: Locale }) {
  return (
    <ul data-reveal className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-paper">
      {items.map((item, index) => (
        <li key={index}>
          <details className="group" {...(index === 0 ? { open: true } : {})}>
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-start font-semibold [&::-webkit-details-marker]:hidden">
              {pick(item.q, locale)}
              <ChevronDown className="size-5 shrink-0 transition group-open:rotate-180" aria-hidden />
            </summary>
            <p className="px-5 pb-5 text-ink-soft">{pick(item.a, locale)}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ href?: string; label: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && <span aria-hidden>/</span>}
            {item.href !== undefined ? (
              <Link href={item.href} className="hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
