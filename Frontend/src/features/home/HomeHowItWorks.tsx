"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { CoverImage } from "@/components/CoverImage";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { howItWorksCopy, howItWorksSteps } from "@/constants/howItWorksSteps";
import { motionRefreshPriority } from "@/lib/motion/homeMotion";
import { registerGsapPlugins } from "@/lib/motion/registerGsapPlugins";

registerGsapPlugins();

const desktopMotionQuery =
  "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function setActiveStep(section: HTMLElement, progress: number): void {
  const lastIndex = howItWorksSteps.length - 1;
  const index = Math.min(lastIndex, Math.round(progress * lastIndex));
  const markers = section.querySelectorAll<HTMLElement>("[data-step-marker]");

  markers.forEach((marker, markerIndex) => {
    if (markerIndex === index) {
      marker.setAttribute("data-active", "");
    } else {
      marker.removeAttribute("data-active");
    }
  });
}

export function HomeHowItWorks() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;

      if (section === null || track === null) {
        return;
      }

      const matchMedia = gsap.matchMedia();

      matchMedia.add(desktopMotionQuery, () => {
        section.setAttribute("data-horizontal-steps", "");
        void track.offsetWidth;
        setActiveStep(section, 0);

        const getTravel = (): number => {
          return Math.max(0, track.scrollWidth - section.clientWidth);
        };

        const tween = gsap.to(track, {
          x: () => -getTravel(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 4.5rem",
            end: () => `+=${Math.max(window.innerHeight * (howItWorksSteps.length - 1), 1)}`,
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            refreshPriority: motionRefreshPriority.howItWorks,
            onUpdate: (self) => {
              setActiveStep(section, self.progress);
            },
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          section.removeAttribute("data-horizontal-steps");
          gsap.set(track, { clearProps: "transform" });
        };
      });

      return () => {
        matchMedia.revert();
      };
    },
    { scope: scopeRef },
  );

  return (
    <div ref={scopeRef}>
      <section
        ref={sectionRef}
        className="flex flex-col bg-paper"
        aria-labelledby="how-it-works-heading"
      >
        <div className="mx-auto w-full max-w-7xl px-6 pt-16 md:pt-24">
          <p className="text-meta uppercase tracking-[0.22em] text-ink-soft">
            {howItWorksCopy.eyebrow}
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-lg"
          >
            {howItWorksCopy.heading}
          </h2>
          <ol
            aria-hidden="true"
            className="mt-10 hidden list-none flex-wrap items-center gap-x-4 gap-y-3 p-0 text-meta uppercase tracking-[0.16em] text-ink-soft [@media(min-width:768px)_and_(hover:hover)_and_(pointer:fine)]:flex motion-reduce:!hidden"
          >
            {howItWorksSteps.map((step, index) => (
              <li key={step.number} className="flex items-center gap-4">
                {index > 0 ? (
                  <ArrowRightIcon className="size-4 text-accent" />
                ) : null}
                <span
                  data-step-marker=""
                  {...(index === 0 ? { "data-active": "" } : {})}
                  className="transition-colors duration-300"
                >
                  {step.number} {step.title}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="howItWorksViewport mt-12 overflow-hidden md:mt-16">
          <ol
            ref={trackRef}
            className="howItWorksTrack flex w-full list-none flex-col gap-16 px-6 pb-16 md:pb-24"
          >
            {howItWorksSteps.map((step) => (
              <li key={step.number} className="howItWorksStep max-w-3xl">
                <div className="relative aspect-video overflow-hidden bg-ink rounded-2xl md:rounded-[2rem] shadow-2xl">
                  <CoverImage
                    src={step.imageSrc}
                    alt={step.imageAlt}
                    sizes="(min-width: 768px) 55vw, 100vw"
                    className="absolute inset-0 size-full max-w-none object-cover"
                  />
                </div>
                <div className="howItWorksCopy border-t border-line pt-8 mt-8 md:mt-0 md:border-t-0 md:pt-0">
                  <p className="text-meta uppercase tracking-[0.22em] text-accent">
                    {step.number}
                  </p>
                  <h3 className="mt-6 text-title-sm font-medium tracking-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-5 max-w-md text-body leading-8 text-ink-soft">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
