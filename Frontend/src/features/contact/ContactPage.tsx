import { ContactFaq } from "@/features/contact/ContactFaq";
import { ContactFinalCta } from "@/features/contact/ContactFinalCta";
import {
  ContactDownloadHelp,
  ContactFormSection,
} from "@/features/contact/ContactFormSection";
import { ContactHero } from "@/features/contact/ContactHero";
import { ContactQuickHelp } from "@/features/contact/ContactQuickHelp";
import { ContactScrollMotion } from "@/features/contact/ContactScrollMotion";
import { businessContact } from "@/constants/businessContact";
import { fetchSiteGlobal } from "@/lib/api/siteSettingsApi";

type ContactPageProps = {
  locale: string;
};

export async function ContactPage({ locale }: ContactPageProps) {
  let contactEmail = businessContact.email;
  let contactPhone = businessContact.phone;
  let contactAddress = "";

  try {
    const global = await fetchSiteGlobal();
    contactEmail = global.contactEmail.trim() || businessContact.email;
    contactPhone = global.contactPhone.trim() || businessContact.phone;
    contactAddress = global.contactAddress.trim();
  } catch {
    // Keep business contact defaults when CMS is unavailable.
  }

  return (
    <ContactScrollMotion>
      <ContactHero locale={locale} />
      <ContactQuickHelp locale={locale} />
      <ContactFormSection
        locale={locale}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
        contactAddress={contactAddress}
      />
      <ContactDownloadHelp locale={locale} />
      <ContactFaq />
      <ContactFinalCta locale={locale} />
    </ContactScrollMotion>
  );
}
