"use client";

import { useEffect } from "react";

export function HomeHeaderScroll() {
  useEffect(() => {
    const header = document.getElementById("site-header");

    if (header === null) {
      return;
    }

    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
