import { CoverImage } from "@/components/CoverImage";
import {
  communityCopy,
  type communityPosts,
} from "@/constants/communityPosts";

const frameClassName = {
  portrait: "aspect-3/4",
  square: "aspect-square",
  wide: "aspect-4/3",
} as const;

type CommunityPost = (typeof communityPosts)[number];

type HomeCommunityCardProps = {
  post: CommunityPost;
};

export function HomeCommunityCard({ post }: HomeCommunityCardProps) {
  return (
    <figure>
      <div
        className={`group relative overflow-hidden bg-line ${frameClassName[post.frame]}`}
      >
        <CoverImage
          src={post.imageSrc}
          alt={post.imageAlt}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="absolute inset-0 size-full max-w-none object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-[var(--category-overlay)] transition-colors duration-500 group-hover:bg-[var(--category-overlay-hover)] motion-reduce:transition-none" />
        <figcaption className="absolute inset-x-0 bottom-0 p-5 text-paper">
          <p className="text-meta tracking-wide">@{post.username}</p>
          <p className="mt-2 text-meta text-paper/80">
            {communityCopy.designLabel}: {post.designName}
          </p>
        </figcaption>
      </div>
    </figure>
  );
}
