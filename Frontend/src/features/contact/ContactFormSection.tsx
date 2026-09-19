import { TextLink } from "@/components/TextLink";
import {
  businessContact,
  businessWhatsAppHref,
} from "@/constants/businessContact";
import {
  contactDownloadScenarios,
  contactPageCopy,
  contactSupportFlow,
} from "@/constants/contactPageCopy";
import {
  accountHref,
  downloadsHref,
  privacyHref,
} from "@/constants/siteNavigation";
import { ContactForm } from "@/features/contact/ContactForm";

type ContactFormSectionProps = {
  locale: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
};

export function ContactFormSection({
  locale,
  contactEmail = businessContact.email,
  contactPhone = businessContact.phone,
  contactAddress = "",
}: ContactFormSectionProps) {
  const email =
    contactEmail.trim().length > 0 ? contactEmail.trim() : businessContact.email;
  const phone =
    contactPhone.trim().length > 0 ? contactPhone.trim() : businessContact.phone;
  const address = contactAddress.trim();

  return (
    <section
      id="contact-form"
      className="contactFormSection scroll-mt-header-compact border-y border-line bg-paper"
      aria-labelledby="contact-form-heading"
    >
      <div className="mx-auto grid w-full max-w-[85rem] gap-10 px-6 py-16 md:py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-14">
        <ContactForm />
        <aside className="contactFormAside space-y-10">
          <div>
            <h2 className="text-title-sm font-medium tracking-tight text-ink">
              {contactPageCopy.preferEmailHeading}
            </h2>
            <ul className="mt-4 flex list-none flex-col gap-2 p-0 text-body leading-8 text-ink-soft">
              <li>
                <a
                  href={`mailto:${email}`}
                  className="text-ink underline-offset-4 hover:underline"
                >
                  {email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="text-ink underline-offset-4 hover:underline"
                >
                  {phone}
                </a>
              </li>
              {address.length > 0 ? (
                <li className="whitespace-pre-line">{address}</li>
              ) : null}
            </ul>
            <p className="mt-4 text-body leading-8 text-ink-soft">
              {contactPageCopy.preferEmailBody}
            </p>
          </div>

          <div>
            <h2 className="text-title-sm font-medium tracking-tight text-ink">
              {contactPageCopy.whatsappLabel}
            </h2>
            <p className="mt-4 text-body leading-8 text-ink-soft">
              {contactPageCopy.whatsappBody}
            </p>
            <a
              href={businessWhatsAppHref(
                "Hi — I need help with an embroidery order.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center text-body text-ink underline-offset-4 hover:underline"
            >
              {businessContact.phoneDisplay}
            </a>
          </div>

          <div>
            <h2 className="text-title-sm font-medium tracking-tight text-ink">
              {contactPageCopy.orderSupportHeading}
            </h2>
            <p className="mt-4 text-body leading-8 text-ink-soft">
              {contactPageCopy.orderSupportBody}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <TextLink href={`/${locale}${accountHref}`}>
                {contactPageCopy.viewMyOrders}
              </TextLink>
              <TextLink href="#contact-form" tone="ghostOnLight">
                {contactPageCopy.contactSupport}
              </TextLink>
            </div>
          </div>

          <div>
            <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
              {contactPageCopy.supportFlowLabel}
            </p>
            <ol className="mt-4 flex list-none flex-col gap-2 p-0">
              {contactSupportFlow.map((step, index) => (
                <li key={step} className="text-meta uppercase tracking-[0.12em] text-ink">
                  {step}
                  {index < contactSupportFlow.length - 1 ? (
                    <span className="mt-1 block text-ink-soft" aria-hidden="true">
                      ↓
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="text-h3 font-medium tracking-tight text-ink">
              {contactPageCopy.privacyHeading}
            </h2>
            <p className="mt-3 text-body leading-8 text-ink-soft">
              {contactPageCopy.privacyBody}
            </p>
            <div className="mt-4">
              <TextLink href={`/${locale}${privacyHref}`} tone="ghostOnLight">
                {contactPageCopy.privacyCta}
              </TextLink>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

type ContactHelpBandsProps = {
  locale: string;
};

export function ContactDownloadHelp({ locale }: ContactHelpBandsProps) {
  return (
    <section
      className="contactReveal mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="contact-download-heading"
    >
      <h2
        id="contact-download-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {contactPageCopy.downloadHelpHeading}
      </h2>
      <ul className="mt-10 grid list-none gap-8 p-0 md:grid-cols-3">
        {contactDownloadScenarios.map((item) => (
          <li key={item.title} className="border-t border-line pt-6">
            <h3 className="text-h3 font-medium tracking-tight text-ink">
              {item.title}
            </h3>
            <p className="mt-3 text-body leading-8 text-ink-soft">{item.body}</p>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <TextLink href={`/${locale}${downloadsHref}`}>
          {contactPageCopy.downloadGuide}
        </TextLink>
      </div>
    </section>
  );
}

