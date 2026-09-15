import {
  formatSavedDesignCount,
  wishlistCopy,
} from "@/constants/wishlistCopy";

type WishlistHeroProps = {
  count: number;
};

export function WishlistHero({ count }: WishlistHeroProps) {
  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-[85rem] px-6 pt-14 pb-10 md:pt-20 md:pb-12">
        <h1 className="wishlistHeroCopy text-title-sm font-medium tracking-tight text-ink md:text-title-md">
          {wishlistCopy.heading}
        </h1>
        <p className="wishlistHeroCopy mt-4 max-w-xl text-body leading-8 text-ink-soft">
          {wishlistCopy.body}
        </p>
        <p className="wishlistHeroCopy mt-3 max-w-xl text-body leading-8 text-ink-soft">
          {wishlistCopy.support}
        </p>
        <p className="wishlistHeroCopy mt-8 text-meta uppercase tracking-[0.22em] text-accent">
          {formatSavedDesignCount(count)}
        </p>
      </div>
    </section>
  );
}
