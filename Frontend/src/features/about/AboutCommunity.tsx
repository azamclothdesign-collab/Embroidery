import { CoverImage } from "@/components/CoverImage";
import { TextLink } from "@/components/TextLink";
import { aboutPageCopy } from "@/constants/aboutPageCopy";
import { communityCopy, communityPosts } from "@/constants/communityPosts";
import { contactHref } from "@/constants/siteNavigation";

type AboutCommunityProps = {
  locale: string;
};

export function AboutCommunity({ locale }: AboutCommunityProps) {
  const posts = communityPosts.slice(0, 6);

  return (
    <section
      className="aboutReveal mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="about-community-heading"
    >
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        {aboutPageCopy.communityEyebrow}
      </p>
      <h2
        id="about-community-heading"
        className="mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {aboutPageCopy.communityHeading}
      </h2>
      <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
        {aboutPageCopy.communityBody}
      </p>
      <ul className="mt-12 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-3 md:gap-6">
        {posts.map((post) => (
          <li key={`${post.username}-${post.imageSrc}`}>
            <article className="group relative aspect-square overflow-hidden bg-line">
              <CoverImage
                src={post.imageSrc}
                alt={post.imageAlt}
                sizes="(max-width: 768px) 50vw, 33vw"
                className="absolute inset-0 size-full max-w-none object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-ink/75 px-4 py-3 text-paper opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                <p className="text-meta uppercase tracking-[0.12em]">
                  {communityCopy.designLabel}: {post.designName}
                </p>
                <p className="mt-1 text-meta">@{post.username}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <TextLink href={`/${locale}${contactHref}`}>
          {aboutPageCopy.shareProject}
        </TextLink>
      </div>
    </section>
  );
}
