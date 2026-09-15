import { HomeTrustMarquee } from "@/features/home/HomeTrustMarquee";

export function HomeTrustStrip() {
  return (
    <section
      id="after-hero"
      aria-label="Trust"
      className="bg-ink py-8"
    >
      <HomeTrustMarquee />
    </section>
  );
}
