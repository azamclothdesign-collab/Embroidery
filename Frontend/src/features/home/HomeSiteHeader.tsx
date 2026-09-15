import { HomeHeaderScroll } from "@/components/HomeHeaderScroll";
import { SiteHeader } from "@/components/SiteHeader";

export function HomeSiteHeader() {
  return (
    <>
      <HomeHeaderScroll />
      <SiteHeader overlay />
    </>
  );
}
