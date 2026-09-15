"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function registerGsapPlugins(): void {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}
