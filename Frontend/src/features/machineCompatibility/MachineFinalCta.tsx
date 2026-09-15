import { TextLink } from "@/components/TextLink";
import { type MachineSelection } from "@/constants/machineCompatibilityCatalog";
import { machineCompatibilityPageCopy } from "@/constants/machineCompatibilityPageCopy";
import { shopDesignsHref } from "@/constants/siteNavigation";

type MachineFinalCtaProps = {
  locale: string;
  selection: MachineSelection | null;
};

export function MachineFinalCta({ locale, selection }: MachineFinalCtaProps) {
  const href =
    selection === null
      ? `/${locale}${shopDesignsHref}`
      : `/${locale}${shopDesignsHref}?q=${encodeURIComponent(selection.format)}`;

  const label =
    selection === null
      ? machineCompatibilityPageCopy.finalCta
      : `${machineCompatibilityPageCopy.browseFormatPrefix} ${selection.format} ${machineCompatibilityPageCopy.browseFormatSuffix}`;

  return (
    <section
      className="machineReveal border-t border-line bg-paper"
      aria-labelledby="machine-final-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 text-center md:py-24">
        <h2
          id="machine-final-heading"
          className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {machineCompatibilityPageCopy.finalHeading}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-body leading-8 text-ink-soft">
          {machineCompatibilityPageCopy.finalBody}
        </p>
        <div className="mt-10 flex justify-center">
          <TextLink href={href}>{label}</TextLink>
        </div>
      </div>
    </section>
  );
}
