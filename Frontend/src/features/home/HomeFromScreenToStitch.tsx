import { fromScreenToStitchCopy } from "@/constants/fromScreenToStitch";
import { HomeFromScreenMedia } from "@/features/home/HomeFromScreenMedia";
import { HomeFromScreenStats } from "@/features/home/HomeFromScreenStats";
import { fromScreenToStitchVideoFileExists } from "@/lib/fromScreenToStitchVideoFile";

export function HomeFromScreenToStitch() {
  const hasVideo = fromScreenToStitchVideoFileExists();

  return (
    <section
      className="bg-paper"
      aria-labelledby="from-screen-to-stitch-heading"
    >
      <div className="grid md:min-h-[44rem] md:grid-cols-2 lg:min-h-[52rem]">
        <HomeFromScreenMedia hasVideo={hasVideo} />
        <div className="flex flex-col justify-center px-6 py-16 md:px-12 md:py-24 lg:px-20">
          <div className="max-w-xl">
            <h2
              id="from-screen-to-stitch-heading"
              className="text-title-sm font-medium tracking-tight text-ink md:text-title-lg"
            >
              {fromScreenToStitchCopy.heading}
            </h2>
            <p className="mt-8 text-body leading-8 text-ink">
              {fromScreenToStitchCopy.lead}
            </p>
            <p className="mt-6 text-body leading-8 text-ink-soft">
              {fromScreenToStitchCopy.body}
            </p>
            <HomeFromScreenStats />
          </div>
        </div>
      </div>
    </section>
  );
}
