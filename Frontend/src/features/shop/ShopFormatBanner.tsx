import { TextLink } from "@/components/TextLink";
import { machineCompatibilityHref } from "@/constants/shopCatalog";
import { shopCopy } from "@/constants/shopCopy";

type ShopFormatBannerProps = {
  locale: string;
};

export function ShopFormatBanner({ locale }: ShopFormatBannerProps) {
  return (
    <section className="shopBanner mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
      <div className="border border-line bg-surface px-6 py-12 text-center md:px-16 md:py-16">
        <p className="text-meta uppercase tracking-[0.22em] text-accent">
          {shopCopy.formatBannerEyebrow}
        </p>
        <h2 className="mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md">
          {shopCopy.formatBannerHeading}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-body leading-8 text-ink-soft">
          {shopCopy.formatBannerBody}
        </p>
        <div className="mt-8 flex justify-center">
          <TextLink href={`/${locale}${machineCompatibilityHref}`}>
            {shopCopy.formatBannerCta}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
