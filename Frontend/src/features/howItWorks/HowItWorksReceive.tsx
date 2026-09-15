import {
  howItWorksFormatBadges,
  howItWorksPageCopy,
  howItWorksReceiveItems,
} from "@/constants/howItWorksPageCopy";

export function HowItWorksReceive() {
  return (
    <section
      className="hiwReveal border-y border-line bg-surface"
      aria-labelledby="hiw-receive-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <h2
          id="hiw-receive-heading"
          className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {howItWorksPageCopy.receiveHeading}
        </h2>
        <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
          {howItWorksPageCopy.receiveBody}
        </p>
        <ul className="mt-12 grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorksReceiveItems.map((item) => (
            <li key={item.title} className="border-t border-line pt-6">
              <h3 className="text-h3 font-medium tracking-tight text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-body leading-8 text-ink-soft">{item.body}</p>
            </li>
          ))}
        </ul>
        <div className="hiwFormatBadges mt-14">
          <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
            {howItWorksPageCopy.formatSectionHeading}
          </p>
          <ul className="mt-6 flex list-none flex-wrap gap-3 p-0">
            {howItWorksFormatBadges.map((format) => (
              <li
                key={format}
                className="hiwFormatBadge border border-line bg-paper px-6 py-4 text-h3 font-medium tracking-tight text-ink"
              >
                {format}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
