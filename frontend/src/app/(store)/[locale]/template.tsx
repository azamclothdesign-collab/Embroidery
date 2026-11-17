import type { ReactNode } from "react";
import { PageTransition } from "@/features/motion/PageTransition";

/** template.tsx re-mounts on every navigation, so each page gets the enter transition. */
export default function StoreTemplate({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
