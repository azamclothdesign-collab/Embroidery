import { type Metadata } from "next";

import { PageEnter } from "@/components/PageEnter";
import { SiteHeader } from "@/components/SiteHeader";
import { contactPageCopy } from "@/constants/contactPageCopy";
import { ContactPage } from "@/features/contact/ContactPage";

type ContactRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: contactPageCopy.metaTitle,
  description: contactPageCopy.metaDescription,
};

export default async function ContactRoute({ params }: ContactRouteProps) {
  const { locale } = await params;

  return (
    <>
      <SiteHeader />
      <PageEnter>
        <ContactPage locale={locale} />
      </PageEnter>
    </>
  );
}
