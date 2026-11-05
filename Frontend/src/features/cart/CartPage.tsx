import { PageEnter } from "@/components/PageEnter";
import { CartBody } from "@/features/cart/CartBody";
import { CartSiteHeader } from "@/features/cart/CartSiteHeader";

type CartPageProps = {
  locale: string;
};

export function CartPage({ locale }: CartPageProps) {
  return (
    <>
      <CartSiteHeader />
      <PageEnter>
        <CartBody locale={locale} />
      </PageEnter>
    </>
  );
}
