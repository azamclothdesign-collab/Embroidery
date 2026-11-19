"use client";

import { Check, Plus, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useCart, type CartItem } from "./CartProvider";

type Labels = { add: string; added: string; inCart: string; buyNow?: string };

export function AddToCartButton({
  item,
  labels,
  variant = "icon",
  checkoutHref,
}: {
  item: CartItem;
  labels: Labels;
  variant?: "icon" | "full";
  checkoutHref?: string;
}) {
  const cart = useCart();
  const router = useRouter();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = cart.ready && cart.has(item.slug);

  const add = () => {
    if (!inCart) {
      cart.add(item);
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1400);
    }
    cart.setOpen(true);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={add}
        aria-label={inCart ? `${labels.inCart}: ${item.name}` : `${labels.add}: ${item.name}`}
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-full transition duration-200 active:scale-95",
          inCart ? "bg-teal text-white" : "bg-ink text-white hover:bg-saffron-strong",
        )}
      >
        {inCart ? <Check className="size-5" aria-hidden /> : <Plus className="size-5" aria-hidden />}
      </button>
    );
  }

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-3 sm:flex-row">
      <button type="button" onClick={add} className={cn("btn w-full min-w-0 flex-1", inCart ? "btn-outline" : "btn-primary")} aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={justAdded ? "added" : inCart ? "in" : "add"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="inline-flex max-w-full items-center justify-center gap-2 truncate"
          >
            {justAdded || inCart ? <Check className="size-5 shrink-0" aria-hidden /> : <ShoppingBag className="size-5 shrink-0" aria-hidden />}
            <span className="truncate">{justAdded ? labels.added : inCart ? labels.inCart : labels.add}</span>
          </motion.span>
        </AnimatePresence>
      </button>
      {labels.buyNow !== undefined && checkoutHref !== undefined && (
        <button
          type="button"
          className="btn btn-dark w-full min-w-0 flex-1"
          onClick={() => {
            if (!inCart) cart.add(item);
            router.push(checkoutHref);
          }}
        >
          {labels.buyNow}
        </button>
      )}
    </div>
  );
}
