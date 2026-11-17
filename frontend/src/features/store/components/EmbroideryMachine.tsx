"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

const PETAL = "M0 0 C -22 -26, -15 -54, 0 -58 C 15 -54, 22 -26, 0 0";
const LEAF_L = "M0 34 C -26 28, -44 44, -50 60 C -30 62, -10 52, 0 34";
const LEAF_R = "M0 50 C 22 42, 40 54, 46 70 C 26 74, 8 64, 0 50";
const THREADS = ["#0F5257", "#C9A227", "#E85D2A", "#5DCAA5"] as const;

/**
 * Decorative multi-needle embroidery machine: needle bar runs, hoop shifts,
 * flower motif stitches out, then the cycle repeats. Static under reduced motion.
 */
export function EmbroideryMachine({ className }: { className?: string }) {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = root.current;
      if (svg === null) return;
      const stitches = gsap.utils.toArray<SVGPathElement>("[data-stitch]", svg);
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(stitches, { strokeDashoffset: 0 });
      });

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(stitches, { strokeDasharray: 1, strokeDashoffset: 1 });
        const needle = gsap.to("[data-needle]", { y: 8, duration: 0.07, repeat: -1, yoyo: true, ease: "sine.inOut" });
        // Keep the hoop centered under the needle; only a tiny vertical pantograph nudge.
        const hoop = gsap.to("[data-hoop]", {
          y: "random(-2, 2)",
          duration: 0.35,
          repeat: -1,
          repeatRefresh: true,
          ease: "sine.inOut",
        });
        const sew = gsap.timeline({ repeat: -1, repeatDelay: 0.4, delay: 0.5 });
        stitches.forEach((path) => sew.to(path, { strokeDashoffset: 0, duration: 0.8, ease: "none" }));
        sew
          .to("[data-glow]", { opacity: 1, duration: 0.28 })
          .to({}, { duration: 1 })
          .to("[data-motif]", { opacity: 0, duration: 0.4 })
          .set(stitches, { strokeDashoffset: 1 })
          .set("[data-glow]", { opacity: 0 })
          .set("[data-motif]", { opacity: 1 });

        const all = [needle, hoop, sew];
        const observer = new IntersectionObserver(([entry]) => all.forEach((t) => (entry?.isIntersecting ? t.play() : t.pause())));
        observer.observe(svg);
        return () => observer.disconnect();
      });

      return () => media.revert();
    },
    { scope: root },
  );

  // Optical center sits on x=160. Tight viewBox so the art fills the frame evenly.
  return (
    <svg
      ref={root}
      viewBox="0 0 320 210"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      className={`mx-auto block ${className ?? ""}`}
    >
      <defs>
        <clipPath id="emb-fabric">
          <ellipse cx="0" cy="0" rx="70" ry="48" />
        </clipPath>
        <pattern id="emb-weave" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 3 H6 M3 0 V6" stroke="#E5DDD0" strokeWidth="0.55" />
        </pattern>
      </defs>

      {/* Thread stand + cones — centered on the head */}
      <rect x="88" y="18" width="144" height="6" rx="3" fill="#3F3F48" />
      {THREADS.map((color, i) => {
        const x = 112 + i * 32;
        return (
          <g key={color + i} transform={`translate(${x} 0)`}>
            <path d="M-7 18 L-4.5 4 H4.5 L7 18 Z" fill={color} />
            <rect x="-1.75" y="1.5" width="3.5" height="4" rx="1" fill="#17171C" />
            <path d={`M0 5 C 0 ${2 - i}, ${48 - i * 16} 24, ${48 - i * 16} 42`} stroke={color} strokeWidth="0.75" opacity="0.65" />
          </g>
        );
      })}

      {/* Machine head — centered */}
      <rect x="56" y="28" width="208" height="56" rx="14" fill="#17171C" />
      <rect x="72" y="40" width="58" height="7" rx="3.5" fill="#3F3F48" />
      <circle cx="228" cy="48" r="5" fill="#5DCAA5" />
      <circle cx="212" cy="48" r="2.75" fill="#E85D2A" />

      {/* Needle housing under the head */}
      <rect x="144" y="78" width="32" height="28" rx="7" fill="#2A2A31" />

      {/* Circular hoop first so the needle can sit on top of it */}
      <g transform="translate(160 148)">
        <g data-hoop>
          <ellipse cx="0" cy="3" rx="82" ry="56" fill="#17171C" opacity="0.08" />
          <ellipse cx="0" cy="0" rx="80" ry="54" fill="#FFFFFF" stroke="#3F3F48" strokeWidth="5" />
          <ellipse cx="0" cy="0" rx="68" ry="46" fill="url(#emb-weave)" stroke="#9A8F80" strokeWidth="1.35" />
          <rect x="72" y="-7" width="14" height="14" rx="3" fill="#3F3F48" />
          <rect x="-86" y="-7" width="14" height="14" rx="3" fill="#3F3F48" />

          <g clipPath="url(#emb-fabric)">
            <g data-motif transform="scale(1 0.55)">
              <ellipse data-glow cx="0" cy="0" rx="66" ry="66" fill="#FBE5DA" opacity="0" />
              <path data-stitch d="M0 0 V68" pathLength={1} stroke="#0F5257" strokeWidth="3" strokeLinecap="round" />
              <path data-stitch d={LEAF_L} pathLength={1} stroke="#1D9E75" strokeWidth="2.6" strokeLinejoin="round" />
              <path data-stitch d={LEAF_R} pathLength={1} stroke="#1D9E75" strokeWidth="2.6" strokeLinejoin="round" />
              {[0, 72, 144, 216, 288].map((angle) => (
                <path key={angle} data-stitch d={PETAL} transform={`rotate(${angle})`} pathLength={1} stroke="#E85D2A" strokeWidth="3" strokeLinejoin="round" />
              ))}
              <path data-stitch d="M0 -9 A9 9 0 1 1 -0.1 -9" pathLength={1} stroke="#C9A227" strokeWidth="4.2" />
            </g>
          </g>
        </g>
      </g>

      {/* Needle drawn last — stays visible on top of the hoop */}
      <g transform="translate(160 0)">
        <g data-needle>
          <rect x="-5" y="94" width="10" height="22" rx="2" fill="#C9C9CF" />
          <path d="M0 116 V148" stroke="#5A5A63" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="0" cy="148" r="2.4" fill="#17171C" />
        </g>
        <path d="M-12 126 H12" stroke="#3F3F48" strokeWidth="2.75" strokeLinecap="round" />
      </g>
    </svg>
  );
}
