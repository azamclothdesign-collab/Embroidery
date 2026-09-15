import { PageEnter } from "@/components/PageEnter";
import { CartBody } from "@/features/cart/CartBody";
import { CartExplore } from "@/features/cart/CartExplore";
import { CartHero } from "@/features/cart/CartHero";
import { CartScrollMotion } from "@/features/cart/CartScrollMotion";
import { CartSiteHeader } from "@/features/cart/CartSiteHeader";
import { CartTrust } from "@/features/cart/CartTrust";

type CartPageProps = {
  locale: string;
};

export function CartPage({ locale }: CartPageProps) {
  return (
    <>
      <CartSiteHeader />
      <PageEnter>
        <CartScrollMotion>
          <CartBody
            locale={locale}
            hero={<CartHero />}
            explore={<CartExplore locale={locale} />}
            trust={<CartTrust />}
          />
        </CartScrollMotion>
      </PageEnter>
    </>
  );
}
