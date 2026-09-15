import {
  type CategoryPageContent,
  categoryPageCopy,
} from "@/constants/categoryPageCopy";

type CategoryIntroProps = {
  content: CategoryPageContent;
};

export function CategoryIntro({ content }: CategoryIntroProps) {
  return (
    <section
      className="categoryReveal border-y border-line bg-surface"
      aria-labelledby="category-intro-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <p className="text-meta uppercase tracking-[0.22em] text-accent">
          {categoryPageCopy.collectionEyebrow}
        </p>
        <h2
          id="category-intro-heading"
          className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {content.introHeading}
        </h2>
        <p className="mt-6 max-w-2xl text-body leading-8 text-ink-soft">
          {content.introBody}
        </p>
        <ul className="mt-12 grid list-none gap-8 p-0 md:grid-cols-3">
          {categoryPageCopy.highlights.map((item) => (
            <li key={item.title} className="border-t border-line pt-6">
              <h3 className="text-h3 font-medium tracking-tight text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-body leading-8 text-ink-soft">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
