"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import {
  formatFromScreenMetric,
  fromScreenToStitchMetrics,
} from "@/constants/fromScreenToStitch";
import { motionRefreshPriority } from "@/lib/motion/homeMotion";
import { registerGsapPlugins } from "@/lib/motion/registerGsapPlugins";

registerGsapPlugins();

export function HomeFromScreenStats() {
  const scopeRef = useRef<HTMLDListElement>(null);

  useGSAP(
    () => {
      const scope = scopeRef.current;

      if (scope === null) {
        return;
      }

      const values = scope.querySelectorAll<HTMLElement>("[data-metric-value]");
      const matchMedia = gsap.matchMedia();

      matchMedia.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          allowMotion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const reduceMotion = context.conditions?.reduceMotion === true;

          values.forEach((element, index) => {
            const target = Number(element.dataset.target);
            const decimals = Number(element.dataset.decimals);
            const suffix = element.dataset.suffix ?? "";
            const state = { value: 0 };

            if (reduceMotion || Number.isNaN(target) || Number.isNaN(decimals)) {
              element.textContent = formatFromScreenMetric(
                target,
                decimals,
                suffix,
              );
              return;
            }

            element.textContent = formatFromScreenMetric(0, decimals, suffix);

            gsap.to(state, {
              value: target,
              duration: 1.6,
              delay: index * 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: scope,
                start: "top 78%",
                toggleActions: "play none none none",
                once: true,
                refreshPriority: motionRefreshPriority.fromScreen,
              },
              onUpdate: () => {
                element.textContent = formatFromScreenMetric(
                  state.value,
                  decimals,
                  suffix,
                );
              },
            });
          });
        },
      );

      return () => {
        matchMedia.revert();
      };
    },
    { scope: scopeRef },
  );

  return (
    <dl
      ref={scopeRef}
      className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-line pt-10"
    >
      {fromScreenToStitchMetrics.map((metric) => {
        const formatted = formatFromScreenMetric(
          metric.value,
          metric.decimals,
          metric.suffix,
        );

        return (
          <div key={metric.id} className="flex flex-col-reverse">
            <dt className="mt-3 text-label uppercase tracking-[0.18em] text-ink-soft md:text-input">
              {metric.label}
            </dt>
            <dd className="text-title-md font-medium tracking-tight text-ink md:text-title-lg">
              <span className="sr-only">{formatted}</span>
              <span
                aria-hidden="true"
                data-metric-value=""
                data-target={metric.value}
                data-decimals={metric.decimals}
                data-suffix={metric.suffix}
              >
                {formatted}
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
