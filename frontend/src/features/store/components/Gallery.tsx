"use client";

import { ImageOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function Gallery({ images, alt, emptyLabel }: { images: string[]; alt: string; emptyLabel: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? null;

  if (current === null) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] bg-sand text-muted">
        <ImageOff className="size-8" aria-hidden />
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-sand">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div key={current} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Image
              src={current}
              alt={images.length > 1 ? `${alt} — ${active + 1}/${images.length}` : alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              {...(active === 0 ? { preload: true } : {})}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <li key={image}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`${alt} ${index + 1}`}
                aria-pressed={index === active}
                className={cn(
                  "relative size-20 overflow-hidden rounded-xl border-2 bg-sand transition",
                  index === active ? "border-ink" : "border-transparent opacity-75 hover:opacity-100",
                )}
              >
                <Image src={image} alt="" fill sizes="80px" className="object-cover" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
