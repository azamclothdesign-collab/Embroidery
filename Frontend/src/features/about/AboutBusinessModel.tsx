import { aboutPageCopy } from "@/constants/aboutPageCopy";
import { businessContact } from "@/constants/businessContact";

export function AboutBusinessModel() {
  return (
    <section
      className="aboutReveal border-y border-line bg-paper"
      aria-labelledby="about-business-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <p className="text-meta uppercase tracking-[0.22em] text-accent">
          {aboutPageCopy.businessEyebrow}
        </p>
        <h2
          id="about-business-heading"
          className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {aboutPageCopy.businessHeading}
        </h2>
        <p className="mt-6 max-w-3xl text-body leading-8 text-ink-soft">
          {aboutPageCopy.businessBody}
        </p>

        <ul className="mt-12 grid list-none grid-cols-1 gap-8 p-0 md:grid-cols-2">
          {aboutPageCopy.businessPoints.map((point) => (
            <li key={point.title} className="border-t border-line pt-6">
              <h3 className="text-h3 font-medium tracking-tight text-ink">
                {point.title}
              </h3>
              <p className="mt-3 text-body leading-8 text-ink-soft">
                {point.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-14 border border-line bg-surface px-6 py-8">
          <h3 className="text-h3 font-medium tracking-tight text-ink">
            {aboutPageCopy.officeHeading}
          </h3>
          <ul className="mt-4 flex list-none flex-col gap-2 p-0 text-body leading-8 text-ink-soft">
            <li>{businessContact.brandLegalName}</li>
            <li className="whitespace-pre-line">{businessContact.address}</li>
            <li>
              <a
                href={`mailto:${businessContact.email}`}
                className="text-ink underline-offset-4 hover:underline"
              >
                {businessContact.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${businessContact.phone}`}
                className="text-ink underline-offset-4 hover:underline"
              >
                {businessContact.phoneDisplay}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
