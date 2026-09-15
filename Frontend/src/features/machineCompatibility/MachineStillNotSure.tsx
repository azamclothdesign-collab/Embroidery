import { TextLink } from "@/components/TextLink";
import { machineCompatibilityPageCopy } from "@/constants/machineCompatibilityPageCopy";
import { contactHref } from "@/constants/siteNavigation";

type MachineStillNotSureProps = {
  locale: string;
};

export function MachineStillNotSure({ locale }: MachineStillNotSureProps) {
  return (
    <section
      className="machineReveal border-y border-line bg-ink text-paper"
      aria-labelledby="still-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <h2
          id="still-heading"
          className="text-title-sm font-medium tracking-tight text-paper md:text-title-md"
        >
          {machineCompatibilityPageCopy.stillHeading}
        </h2>
        <p className="mt-4 max-w-2xl text-body leading-8 text-paper/80">
          {machineCompatibilityPageCopy.stillBody}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <TextLink href={`/${locale}${contactHref}`} tone="paper">
            {machineCompatibilityPageCopy.contactUs}
          </TextLink>
          <TextLink href={`/${locale}${contactHref}`} tone="ghostOnDark">
            {machineCompatibilityPageCopy.sendModel}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
