import { CoverImage } from "@/components/CoverImage";
import { aboutPageCopy } from "@/constants/aboutPageCopy";

export function AboutStory() {
  return (
    <section
      className="aboutReveal border-y border-line bg-surface"
      aria-labelledby="about-story-heading"
    >
      <div className="mx-auto grid w-full max-w-[85rem] gap-12 px-6 py-16 md:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <div className="aboutStoryFrame overflow-hidden">
          <div className="aboutStoryImage relative aspect-[4/5] bg-line">
            <CoverImage
              src={aboutPageCopy.storyHeroImage.src}
              alt={aboutPageCopy.storyHeroImage.alt}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="absolute inset-0 size-full max-w-none object-cover"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-meta uppercase tracking-[0.22em] text-accent">
            {aboutPageCopy.storyEyebrow}
          </p>
          <h2
            id="about-story-heading"
            className="mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md"
          >
            {aboutPageCopy.storyHeading}
          </h2>
          <div className="mt-8 space-y-6">
            {aboutPageCopy.storyParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-body leading-8 text-ink-soft">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[85rem] gap-6 px-6 pb-16 md:grid-cols-3 md:pb-20">
        {aboutPageCopy.storyImages.map((image) => (
          <figure key={image.id} className="aboutStoryFrame">
            <div className="aboutStoryImage relative aspect-[4/3] overflow-hidden bg-line">
              <CoverImage
                src={image.src}
                alt={image.alt}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="absolute inset-0 size-full max-w-none object-cover"
              />
            </div>
            <figcaption className="mt-4 text-meta uppercase tracking-[0.16em] text-ink-soft">
              {image.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
