"use client";

import { WishlistButton } from "@/components/WishlistButton";
import { formatShopPrice } from "@/constants/shopCatalog";
import { ProductAddButton } from "@/features/product/ProductAddButton";
import { useProductBuy } from "@/features/product/ProductBuyProvider";

export function ProductPurchaseActions() {
  const { product, addState, onAdd, onWishlist } = useProductBuy();
  const priceLabel = formatShopPrice(product.priceCents);

  return (
    <div id="product-purchase" className="productHeroCopy mt-10">
      <ProductAddButton state={addState} priceLabel={priceLabel} onClick={onAdd} />
      <WishlistButton
        name={product.name}
        slug={product.slug}
        onSaved={onWishlist}
        showLabel
        className="mt-3 inline-flex min-h-11 items-center gap-2 text-meta uppercase tracking-[0.14em] text-ink"
      />
    </div>
  );
}
