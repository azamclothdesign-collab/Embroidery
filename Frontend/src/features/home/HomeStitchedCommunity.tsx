import { communityCopy, communityPosts } from "@/constants/communityPosts";
import { HomeCommunityCard } from "@/features/home/HomeCommunityCard";

export function HomeStitchedCommunity() {
  return (
    <section
      className="bg-paper"
      aria-labelledby="stitched-community-heading"
    >
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <p className="text-meta uppercase tracking-[0.22em] text-ink-soft">
          {communityCopy.eyebrow}
        </p>
        <h2
          id="stitched-community-heading"
          className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-lg"
        >
          {communityCopy.heading}
        </h2>
        <ul className="mt-12 list-none columns-1 gap-4 p-0 sm:columns-2 lg:columns-3">
          {communityPosts.map((post) => (
            <li key={post.username} className="mb-4 break-inside-avoid">
              <HomeCommunityCard post={post} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
