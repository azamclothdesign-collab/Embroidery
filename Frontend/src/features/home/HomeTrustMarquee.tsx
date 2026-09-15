"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { trustStripItems } from "@/constants/trustStripItems";
import { registerGsapPlugins } from "@/lib/motion/registerGsapPlugins";

registerGsapPlugins();

type TrustItemListProps = {
  hiddenFromAssistiveTech: boolean;
};

function TrustItemList({ hiddenFromAssistiveTech }: TrustItemListProps) {
  return (
    <ul
      className="flex shrink-0 items-center gap-10 px-10"
      aria-hidden={hiddenFromAssistiveTech ? true : undefined}
    >
      {trustStripItems.map((item) => (
        <li
          key={item}
          className="flex items-center gap-10 text-meta uppercase tracking-[0.22em] text-paper"
        >
          <span>{item}</span>
          <span aria-hidden="true" className="text-accent">
            •
          </span>
        </li>
      ))}
    </ul>
  );
}

export function HomeTrustMarquee() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const media = gsap.matchMedia();

      media.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          allowMotion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const reduceMotion = context.conditions?.reduceMotion === true;
          const track = trackRef.current;
          const scope = scopeRef.current;

          if (reduceMotion || track === null || scope === null) {
            return;
          }

          const tween = gsap.to(track, {
            xPercent: -50,
            duration: 48,
            ease: "none",
            repeat: -1,
          });

          if (contextSafe === undefined) {
            return;
          }

          const pause = contextSafe(() => {
            tween.pause();
          });
          const resume = contextSafe(() => {
            tween.play();
          });

          scope.addEventListener("mouseenter", pause);
          scope.addEventListener("mouseleave", resume);
          scope.addEventListener("focusin", pause);
          scope.addEventListener("focusout", resume);

          return () => {
            scope.removeEventListener("mouseenter", pause);
            scope.removeEventListener("mouseleave", resume);
            scope.removeEventListener("focusin", pause);
            scope.removeEventListener("focusout", resume);
          };
        },
      );

      return () => {
        media.revert();
      };
    },
    { scope: scopeRef },
  );

  return (
    <div ref={scopeRef} className="relative flex items-center">
      <div className="overflow-hidden motion-reduce:overflow-visible">
        <div
          ref={trackRef}
          className="flex w-max motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center"
        >
          <TrustItemList hiddenFromAssistiveTech={false} />
          <div className="motion-reduce:hidden">
            <TrustItemList hiddenFromAssistiveTech />
          </div>
        </div>
      </div>
    </div>
  );
}
