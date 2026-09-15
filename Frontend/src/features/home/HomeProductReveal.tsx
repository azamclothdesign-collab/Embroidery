"use client";

import { type ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import {
  motionQueries,
  motionRefreshPriority,
  playClipImageReveal,
  playSimpleFade,
} from "@/lib/motion/homeMotion";
import { registerGsapPlugins } from "@/lib/motion/registerGsapPlugins";

registerGsapPlugins();

type HomeProductRevealProps = {
  children: ReactNode;
};

export function HomeProductReveal({ children }: HomeProductRevealProps) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = scopeRef.current;

      if (scope === null) {
        return;
      }

      const media = gsap.matchMedia();

      media.add(motionQueries, (context) => {
        if (context.conditions?.reduceMotion === true) {
          playSimpleFade({
            items: scope.querySelectorAll("[data-motion-frame]"),
            trigger: scope,
            refreshPriority: motionRefreshPriority.products,
          });
          return;
        }

        playClipImageReveal({
          frames: scope.querySelectorAll("[data-motion-frame]"),
          trigger: scope,
          refreshPriority: motionRefreshPriority.products,
        });
      });

      return () => {
        media.revert();
      };
    },
    { scope: scopeRef },
  );

  return <div ref={scopeRef}>{children}</div>;
}
