import { CoverImage } from "@/components/CoverImage";
import { TextLink } from "@/components/TextLink";
import { fromScreenToStitchPosterSrc } from "@/constants/assetPaths";
import { contactPageCopy } from "@/constants/contactPageCopy";
import { helpCenterHref } from "@/constants/siteNavigation";

type ContactHeroProps = {
  locale: string;
};

export function ContactHero({ locale }: ContactHeroProps) {
  return (
    <section className="relative isolate min-h-[58vh] overflow-hidden md:min-h-[64vh]">
      <div className="absolute inset-0">
        <CoverImage
          src={fromScreenToStitchPosterSrc}
          alt="Close-up of embroidery thread stitched into cream linen"
          sizes="100vw"
          priority
          className="absolute inset-0 size-full max-w-none object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-[var(--hero-overlay)]" />
      <div className="relative mx-auto flex min-h-[58vh] w-full max-w-[85rem] flex-col justify-end px-6 py-14 text-paper md:min-h-[64vh] md:py-20">
        <p className="contactHeroCopy text-meta uppercase tracking-[0.22em] text-accent">
          {contactPageCopy.eyebrow}
        </p>
        <h1 className="contactHeroCopy mt-4 max-w-3xl text-title-sm font-medium tracking-tight md:text-title-md lg:text-title-lg">
          {contactPageCopy.heading}
        </h1>
        <p className="contactHeroCopy mt-6 max-w-2xl text-body leading-8 text-paper/85">
          {contactPageCopy.body}
        </p>
        <div className="contactHeroCopy mt-8 flex flex-col gap-3 sm:flex-row">
          <TextLink href="#contact-form" tone="paper">
            {contactPageCopy.contactSupport}
          </TextLink>
          <TextLink href={`/${locale}${helpCenterHref}`} tone="ghostOnDark">
            {contactPageCopy.browseHelp}
          </TextLink>
        </div>
        <p className="mt-8 text-meta uppercase tracking-[0.16em] text-paper/70">
          Design → Machine → Stitch
        </p>
      </div>
    </section>
  );
}
