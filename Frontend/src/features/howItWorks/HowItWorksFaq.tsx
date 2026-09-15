import Link from "next/link";

import { NativeDisclosure } from "@/components/NativeDisclosure";
import {
  howItWorksFaqItems,
  howItWorksPageCopy,
} from "@/constants/howItWorksPageCopy";
import { contactHref, refundPolicyHref } from "@/constants/siteNavigation";

type HowItWorksFaqProps = {
  locale: string;
};

export function HowItWorksFaq({ locale }: HowItWorksFaqProps) {
  return (
    <section
      className="hiwReveal border-y border-line bg-surface"
      aria-labelledby="hiw-faq-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <h2
          id="hiw-faq-heading"
          className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {howItWorksPageCopy.faqHeading}
        </h2>
        <div className="mt-12 border-b border-line">
          {howItWorksFaqItems.map((item) => {
            const isRefund = item.question.includes("refund");
            const isContact = item.question.includes("can't find");

            return (
              <NativeDisclosure key={item.question} title={item.question}>
                <p className="max-w-2xl">
                  {item.answer}
                  {isRefund ? (
                    <>
                      {" "}
                      <Link
                        href={`/${locale}${refundPolicyHref}`}
                        className="underline underline-offset-4"
                      >
                        Refund Policy
                      </Link>
                      .
                    </>
                  ) : null}
                  {isContact ? (
                    <>
                      {" "}
                      <Link
                        href={`/${locale}${contactHref}`}
                        className="underline underline-offset-4"
                      >
                        Contact support
                      </Link>
                      .
                    </>
                  ) : null}
                </p>
              </NativeDisclosure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
