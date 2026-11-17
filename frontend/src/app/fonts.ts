import localFont from "next/font/local";
import { Noto_Nastaliq_Urdu } from "next/font/google";

/** Nourd — the house font (Latin). Regular for body, SemiBold for headings. */
export const nourd = localFont({
  src: [
    { path: "./fonts/nourd-regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/nourd-semibold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-nourd",
  display: "swap",
  fallback: ["Outfit", "Urbanist", "system-ui", "sans-serif"],
});

/** Urdu text (Nastaliq). Loaded only by the Urdu layout. */
export const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "600"],
  variable: "--font-urdu",
  display: "swap",
  preload: false,
});
