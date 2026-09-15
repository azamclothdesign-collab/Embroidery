"use client";

import { formatShopPrice } from "@/constants/shopCatalog";
import { ProductAddButton } from "@/features/product/ProductAddButton";
import { useProductBuy } from "@/features/product/ProductBuyProvider";

export function ProductFinalCtaActions() {
  const { product, addState, onAdd } = useProductBuy();
  const priceLabel = formatShopPrice(product.priceCents);

  return <ProductAddButton state={addState} priceLabel={priceLabel} onClick={onAdd} />;
}
