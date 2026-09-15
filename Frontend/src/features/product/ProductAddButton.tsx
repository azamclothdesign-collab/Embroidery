"use client";

import { CheckIcon } from "@/components/icons/CheckIcon";
import { TextButton } from "@/components/TextButton";
import { productCopy } from "@/constants/productCopy";

export type ProductAddState = "idle" | "adding" | "added";

type ProductAddButtonProps = {
  state: ProductAddState;
  priceLabel: string;
  onClick: () => void;
};

export function ProductAddButton({
  state,
  priceLabel,
  onClick,
}: ProductAddButtonProps) {
  const label =
    state === "adding"
      ? productCopy.adding
      : state === "added"
        ? productCopy.added
        : `${productCopy.addToCart} — ${priceLabel}`;

  return (
    <TextButton
      className="h-14 w-full min-h-14"
      disabled={state !== "idle"}
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-2">
        {state === "added" ? <CheckIcon /> : null}
        {label}
      </span>
    </TextButton>
  );
}
