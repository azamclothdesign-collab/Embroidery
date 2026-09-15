import { SiteHeader } from "@/components/SiteHeader";
import { cartCopy } from "@/constants/cartCopy";

export function CartSiteHeader() {
  return <SiteHeader mutedNav secureNote={cartCopy.secureCheckout} />;
}
