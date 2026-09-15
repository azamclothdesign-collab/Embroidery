import { NativeDisclosure } from "@/components/NativeDisclosure";
import {
  machineCompatibilityFaqItems,
  machineCompatibilityPageCopy,
} from "@/constants/machineCompatibilityPageCopy";

export function MachineCompatFaq() {
  return (
    <section
      className="machineReveal mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="machine-faq-heading"
    >
      <h2
        id="machine-faq-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {machineCompatibilityPageCopy.faqHeading}
      </h2>
      <div className="mt-12 border-b border-line">
        {machineCompatibilityFaqItems.map((item) => (
          <NativeDisclosure key={item.question} title={item.question}>
            <p className="max-w-2xl">{item.answer}</p>
          </NativeDisclosure>
        ))}
      </div>
    </section>
  );
}
