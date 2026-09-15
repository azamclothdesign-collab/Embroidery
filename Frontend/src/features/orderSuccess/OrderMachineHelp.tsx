import { TextLink } from "@/components/TextLink";
import { orderSuccessCopy } from "@/constants/orderSuccessCopy";
import { machineCompatibilityHref } from "@/constants/shopCatalog";

type OrderMachineHelpProps = {
  locale: string;
};

export function OrderMachineHelp({ locale }: OrderMachineHelpProps) {
  return (
    <section
      className="mx-auto w-full max-w-[85rem] px-6 py-12 md:py-16"
      aria-labelledby="order-machine-heading"
    >
      <h2
        id="order-machine-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {orderSuccessCopy.machineHeading}
      </h2>
      <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
        {orderSuccessCopy.machineBody}
      </p>
      <div className="mt-8">
        <TextLink href={`/${locale}${machineCompatibilityHref}`}>
          {orderSuccessCopy.machineCta}
        </TextLink>
      </div>
    </section>
  );
}
