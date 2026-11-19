"use client";

import { ImageOff } from "lucide-react";
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
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[var(--radius-card)] bg-sand p-3 sm:p-4">
        <Image
          key={current}
          src={current}
          alt={images.length > 1 ? `${alt} — ${active + 1}/${images.length}` : alt}
          width={1600}
          height={1600}
          sizes="(min-width: 1024px) 50vw, calc(100vw - 2rem)"
          className="h-auto max-h-full w-auto max-w-full object-contain object-center"
          style={{ objectFit: "contain", objectPosition: "center" }}
          {...(active === 0 ? { preload: true } : {})}
        />
      </div>
      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <li key={image} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`${alt} ${index + 1}`}
                aria-pressed={index === active}
                className={cn(
                  "relative flex size-20 items-center justify-center overflow-hidden rounded-xl border-2 bg-sand p-1 transition",
                  index === active ? "border-ink" : "border-transparent opacity-75 hover:opacity-100",
                )}
              >
                <Image
                  src={image}
                  alt=""
                  width={160}
                  height={160}
                  sizes="80px"
                  className="h-auto max-h-full w-auto max-w-full object-contain object-center"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                  loading="lazy"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
