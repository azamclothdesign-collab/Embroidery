"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

/** Other components (cart drawer, menus) pause smooth scrolling while they are open. */
export const SCROLL_LOCK = "emb:scroll-lock";
export const SCROLL_UNLOCK = "emb:scroll-unlock";
export function lockScroll(locked: boolean): void {
  window.dispatchEvent(new Event(locked ? SCROLL_LOCK : SCROLL_UNLOCK));
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * One client island for all page-level motion:
 *  - Lenis smooth scroll, driven by GSAP's ticker and synced with ScrollTrigger
 *  - scroll reveals: [data-reveal] blocks fade up, [data-reveal-item] children stagger in
 *  - a cursor follower ring + magnetic [data-magnetic] buttons (mouse/trackpad only)
 * Everything is skipped under prefers-reduced-motion; content is never hidden without JS.
 */
export function MotionLayer() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  // Smooth scroll (once per page load).
  useEffect(() => {
    if (reducedMotion()) return;
    const lenis = new Lenis({ duration: 1.05, anchors: { offset: -80 }, autoRaf: false });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const stop = () => lenis.stop();
    const start = () => lenis.start();
    window.addEventListener(SCROLL_LOCK, stop);
    window.addEventListener(SCROLL_UNLOCK, start);
    return () => {
      window.removeEventListener(SCROLL_LOCK, stop);
      window.removeEventListener(SCROLL_UNLOCK, start);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // New page → back to top, then wire up its reveals.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("main [data-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 32,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        });
      });
      const items = gsap.utils.toArray<HTMLElement>("main [data-reveal-item]");
      if (items.length > 0) {
        gsap.set(items, { y: 26, opacity: 0 });
        ScrollTrigger.batch(items, {
          start: "top 94%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.65, stagger: 0.07, ease: "power3.out", overwrite: true }),
        });
      }
    });
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
    };
  }, [pathname]);

  // Cursor follower + magnetic buttons.
  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (ring === null || dot === null || reducedMotion() || !finePointer()) return;

    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
    const dotX = gsap.quickTo(dot, "x", { duration: 0.08 });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08 });
    let visible = false;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (!visible) {
        visible = true;
        gsap.to([ring, dot], { opacity: 1, duration: 0.2 });
      }
      ringX(event.clientX);
      ringY(event.clientY);
      dotX(event.clientX);
      dotY(event.clientY);
      const target = event.target instanceof Element ? event.target : null;
      const interactive = target?.closest("a, button, [role='button'], summary, label, select, [data-cursor]") ?? null;
      const typing = target?.closest("input, textarea") ?? null;
      gsap.to(ring, { scale: typing ? 0 : interactive ? 1.7 : 1, duration: 0.25, overwrite: "auto" });
      ring.dataset.active = interactive ? "true" : "false";

      const magnetic = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (magnetic !== null) {
        const box = magnetic.getBoundingClientRect();
        gsap.to(magnetic, {
          x: (event.clientX - (box.left + box.width / 2)) * 0.25,
          y: (event.clientY - (box.top + box.height / 2)) * 0.35,
          duration: 0.35,
          ease: "power3.out",
        });
      }
    };
    const onOut = (event: PointerEvent) => {
      const from = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-magnetic]") : null;
      const to = event.relatedTarget instanceof Element ? event.relatedTarget.closest<HTMLElement>("[data-magnetic]") : null;
      if (from !== null && from !== to) gsap.to(from, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      if (event.relatedTarget === null) {
        visible = false;
        gsap.to([ring, dot], { opacity: 0, duration: 0.2 });
      }
    };
    const onDown = () => gsap.to(ring, { scale: 0.8, duration: 0.12 });
    const onUp = () => gsap.to(ring, { scale: 1, duration: 0.2 });

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[70] -mt-5 -ml-5 hidden size-10 rounded-full border-2 border-dashed border-saffron opacity-0 transition-colors data-[active=true]:border-solid data-[active=true]:bg-saffron/10 [@media(hover:hover)_and_(pointer:fine)]:block"
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[70] -mt-[3px] -ml-[3px] hidden size-1.5 rounded-full bg-ink opacity-0 [@media(hover:hover)_and_(pointer:fine)]:block"
      />
    </>
  );
}
