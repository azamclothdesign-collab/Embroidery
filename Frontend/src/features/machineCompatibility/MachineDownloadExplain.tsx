import { type MachineSelection } from "@/constants/machineCompatibilityCatalog";
import { machineCompatibilityPageCopy } from "@/constants/machineCompatibilityPageCopy";

type MachineDownloadExplainProps = {
  selection: MachineSelection | null;
};

export function MachineDownloadExplain({ selection }: MachineDownloadExplainProps) {
  const machineLabel = selection?.label ?? "Brother PE800";
  const formatLabel = selection?.format ?? "PES";
  const fileLabel =
    formatLabel === "PES"
      ? machineCompatibilityPageCopy.downloadExampleFile
      : `Floral-Butterfly.${formatLabel.toLowerCase()}`;

  return (
    <section
      className="machineReveal border-y border-line bg-surface"
      aria-labelledby="download-explain-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <h2
          id="download-explain-heading"
          className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {machineCompatibilityPageCopy.downloadHeading}
        </h2>
        <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
          {machineCompatibilityPageCopy.downloadBody}
        </p>
        <ol className="mt-12 flex list-none flex-col items-start gap-6 p-0 md:flex-row md:items-center md:gap-10">
          <li>
            <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
              {machineCompatibilityPageCopy.downloadMachine}
            </p>
            <p className="mt-2 text-h3 font-medium text-ink">{machineLabel}</p>
          </li>
          <li className="text-meta text-ink-soft" aria-hidden="true">
            ↓
          </li>
          <li>
            <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
              {machineCompatibilityPageCopy.downloadFormat}
            </p>
            <p className="mt-2 text-h3 font-medium text-ink">{formatLabel}</p>
          </li>
          <li className="text-meta text-ink-soft" aria-hidden="true">
            ↓
          </li>
          <li>
            <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
              {machineCompatibilityPageCopy.downloadFile}
            </p>
            <p className="mt-2 text-h3 font-medium text-ink">{fileLabel}</p>
          </li>
        </ol>
      </div>
    </section>
  );
}
