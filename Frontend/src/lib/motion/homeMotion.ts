import gsap from "gsap";

export const motionQueries = {
  reduceMotion: "(prefers-reduced-motion: reduce)",
  allowMotion: "(prefers-reduced-motion: no-preference)",
} as const;

export const revealStart = "top 80%";
export const simpleFadeDuration = 0.45;

export const motionRefreshPriority = {
  hero: 10,
  categories: 20,
  products: 30,
  fromScreen: 40,
  howItWorks: 50,
  collection: 60,
  finalCta: 80,
} as const;

type ClipImageRevealOptions = {
  frames: ArrayLike<Element>;
  trigger: Element;
  refreshPriority: number;
};

export function playClipImageReveal({
  frames,
  trigger,
  refreshPriority,
}: ClipImageRevealOptions): void {
  const frameList = gsap.utils.toArray<Element>(frames);

  if (frameList.length === 0) {
    return;
  }

  gsap.set(frameList, { clipPath: "inset(100% 0% 0% 0%)" });
  gsap.to(frameList, {
    clipPath: "inset(0% 0% 0% 0%)",
    duration: 1.15,
    ease: "power3.out",
    stagger: 0.14,
    scrollTrigger: {
      trigger,
      start: revealStart,
      once: true,
      refreshPriority,
    },
  });
}

export function playParallax(options: {
  media: Element;
  trigger: Element;
  refreshPriority: number;
}): void {
  gsap.set(options.media, { scale: 1.12, transformOrigin: "50% 50%" });
  gsap.fromTo(
    options.media,
    { yPercent: -8 },
    {
      yPercent: 8,
      ease: "none",
      scrollTrigger: {
        trigger: options.trigger,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.75,
        refreshPriority: options.refreshPriority,
      },
    },
  );
}

export function playHorizontalEnter(options: {
  items: ArrayLike<Element>;
  trigger: Element;
  refreshPriority: number;
}): void {
  if (options.items.length === 0) {
    return;
  }

  gsap.from(options.items, {
    x: 48,
    duration: 1,
    ease: "power3.out",
    stagger: 0.1,
    scrollTrigger: {
      trigger: options.trigger,
      start: revealStart,
      once: true,
      refreshPriority: options.refreshPriority,
    },
  });
}

export function playSimpleFade(
  options:
    | { items: ArrayLike<Element> }
    | {
        items: ArrayLike<Element>;
        trigger: Element;
        refreshPriority: number;
      },
): void {
  const itemList = gsap.utils.toArray<Element>(options.items);

  if (itemList.length === 0) {
    return;
  }

  if (!("trigger" in options)) {
    gsap.from(itemList, {
      autoAlpha: 0,
      duration: simpleFadeDuration,
      ease: "power1.out",
      stagger: 0.06,
    });
    return;
  }

  gsap.from(itemList, {
    autoAlpha: 0,
    duration: simpleFadeDuration,
    ease: "power1.out",
    stagger: 0.06,
    scrollTrigger: {
      trigger: options.trigger,
      start: revealStart,
      once: true,
      refreshPriority: options.refreshPriority,
    },
  });
}
