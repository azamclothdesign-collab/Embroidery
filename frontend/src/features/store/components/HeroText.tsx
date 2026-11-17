"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight, Download, Layers, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { EmbroideryMachine } from "./EmbroideryMachine";
import { StitchLine } from "./StitchLine";

gsap.registerPlugin(useGSAP);

type Props = {
  heading: string;
  text: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
  trust: { instant: string; secure: string; formats: string };
};

/**
 * Compact hero so the first category row fits in the first viewport.
 * GSAP staggers the words in once; reduced-motion users see it static.
 */
export function HeroText({ heading, text, primary, secondary, trust }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from("[data-word]", { yPercent: 110, opacity: 0, duration: 0.7, stagger: 0.05 })
          .from("[data-fade]", { y: 12, opacity: 0, duration: 0.5, stagger: 0.06 }, "-=0.4");
      });
      return () => media.revert();
    },
    { scope: root },
  );

  const words = heading.split(/\s+/).filter(Boolean);

  return (
    <section ref={root} className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_0%,var(--color-saffron-soft),transparent_70%)]" />
      <div className="container-page relative flex flex-col items-center py-4 text-center sm:py-5 lg:py-6">
        <div data-fade className="mb-2.5 flex w-full items-center justify-center sm:mb-3">
          <EmbroideryMachine className="h-auto w-36 sm:w-44 lg:w-48" />
        </div>
        <h1 className="max-w-3xl text-[1.7rem] leading-[1.12] sm:text-[2.15rem] lg:text-[2.5rem]" aria-label={heading}>
          {words.map((word, index) => (
            <span key={`${word}-${index}`} className="inline-block overflow-hidden pb-0.5 align-bottom" aria-hidden>
              <span data-word className="inline-block">
                {word}
                {index < words.length - 1 ? " " : ""}
              </span>
            </span>
          ))}
        </h1>
        <div data-fade className="mt-1.5">
          <StitchLine className="h-3 w-36 sm:w-44" />
        </div>
        <p data-fade className="mt-2 max-w-xl text-sm text-ink-soft sm:text-[0.95rem]">
          {text}
        </p>
        <div data-fade className="mt-3.5 flex w-full flex-row flex-wrap justify-center gap-2.5 sm:mt-4">
          <Link href={primary.href} data-magnetic className="btn btn-primary px-5">
            {primary.label}
            <ArrowRight className="flip-rtl size-4" aria-hidden />
          </Link>
          <Link href={secondary.href} data-magnetic className="btn btn-outline px-5">
            {secondary.label}
          </Link>
        </div>
        <ul data-fade className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs font-semibold text-ink-soft sm:mt-3.5">
          <li className="flex items-center gap-1.5">
            <Download className="size-3.5 text-teal" aria-hidden />
            {trust.instant}
          </li>
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-teal" aria-hidden />
            {trust.secure}
          </li>
          <li className="flex items-center gap-1.5">
            <Layers className="size-3.5 text-teal" aria-hidden />
            {trust.formats}
          </li>
        </ul>
      </div>
    </section>
  );
}
