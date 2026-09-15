"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";

import { type ShopProduct } from "@/constants/shopCatalog";
import { type ProductAddState } from "@/features/product/ProductAddButton";
import { notifyCartAdded, notifyCartUpdated } from "@/lib/session/cartSession";
import { addCartLineAction } from "@/server/actions/cartActions";

type ProductBuyContextValue = {
  locale: string;
  product: ShopProduct;
  addState: ProductAddState;
  onAdd: () => void;
  onWishlist: () => void;
};

const ProductBuyContext = createContext<ProductBuyContextValue | null>(null);

export function useProductBuy(): ProductBuyContextValue {
  const value = useContext(ProductBuyContext);

  if (value === null) {
    throw new Error("useProductBuy must be used within ProductBuyProvider");
  }

  return value;
}

type ProductBuyProviderProps = {
  locale: string;
  product: ShopProduct;
  children: ReactNode;
};

export function ProductBuyProvider({
  locale,
  product,
  children,
}: ProductBuyProviderProps) {
  const [addState, setAddState] = useState<ProductAddState>("idle");

  const onAdd = () => {
    if (addState !== "idle") {
      return;
    }

    setAddState("adding");
    window.setTimeout(() => {
      void addCartLineAction({
        slug: product.slug,
        pdpSlug: product.pdpSlug,
        name: product.name,
        priceCents: product.priceCents,
        imageSrc: product.imageSrc,
        imageAlt: product.imageAlt,
      })
        .then(() => {
          notifyCartUpdated();
          notifyCartAdded();
          setAddState("added");
          window.setTimeout(() => {
            setAddState("idle");
          }, 1400);
        })
        .catch(() => {
          setAddState("idle");
        });
    }, 420);
  };

  return (
    <ProductBuyContext.Provider
      value={{
        locale,
        product,
        addState,
        onAdd,
        onWishlist: () => undefined,
      }}
    >
      {children}
    </ProductBuyContext.Provider>
  );
}
