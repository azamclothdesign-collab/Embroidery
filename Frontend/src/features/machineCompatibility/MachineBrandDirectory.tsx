"use client";

import { useId, useMemo, useState } from "react";

import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import {
  brandSelection,
  type MachineBrandId,
  machineCompatibilityBrands,
  type MachineSelection,
  modelsForBrand,
} from "@/constants/machineCompatibilityCatalog";
import { machineCompatibilityPageCopy } from "@/constants/machineCompatibilityPageCopy";

type MachineBrandDirectoryProps = {
  onSelect: (selection: MachineSelection) => void;
};

export function MachineBrandDirectory({ onSelect }: MachineBrandDirectoryProps) {
  const baseId = useId();
  const [openId, setOpenId] = useState<MachineBrandId | null>(null);
  const [tableQuery, setTableQuery] = useState("");

  const filteredRows = useMemo(() => {
    const normalized = tableQuery.trim().toLowerCase();
    const rows = machineCompatibilityBrands.flatMap((brand) => {
      const models = modelsForBrand(brand.id);

      if (models.length === 0) {
        return [
          {
            id: `brand-row-${brand.id}`,
            label: brand.name,
            format: brand.format,
            selection: brandSelection(brand),
          },
        ];
      }

      return models.map((model) => ({
        id: model.id,
        label: model.label,
        format: model.format,
        selection: {
          id: model.id,
          label: model.label,
          brand: model.brand,
          format: model.format,
          kind: "model" as const,
        },
      }));
    });

    if (normalized.length === 0) {
      return rows;
    }

    return rows.filter(
      (row) =>
        row.label.toLowerCase().includes(normalized) ||
        row.format.toLowerCase().includes(normalized),
    );
  }, [tableQuery]);

  return (
    <section
      className="machineBrandSection mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="machine-brands-heading"
    >
      <h2
        id="machine-brands-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {machineCompatibilityPageCopy.brandsHeading}
      </h2>

      <label className="mt-8 block max-w-xl">
        <span className="sr-only">
          {machineCompatibilityPageCopy.tableSearchPlaceholder}
        </span>
        <input
          type="search"
          value={tableQuery}
          placeholder={machineCompatibilityPageCopy.tableSearchPlaceholder}
          className="min-h-12 w-full border border-line bg-paper px-4 text-body text-ink outline-none focus-visible:border-ink"
          onChange={(event) => {
            setTableQuery(event.target.value);
          }}
        />
      </label>

      <div className="mt-8 hidden overflow-x-auto border border-line md:block">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <thead className="border-b border-line bg-surface">
            <tr>
              <th className="px-4 py-4 text-meta font-normal uppercase tracking-[0.14em] text-ink-soft">
                {machineCompatibilityPageCopy.tableMachine}
              </th>
              <th className="px-4 py-4 text-meta font-normal uppercase tracking-[0.14em] text-ink-soft">
                {machineCompatibilityPageCopy.tableFormat}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-b-0">
                <td className="px-4 py-4">
                  <button
                    type="button"
                    className="min-h-11 text-left text-body text-ink underline-offset-4 hover:underline"
                    onClick={() => {
                      onSelect(row.selection);
                    }}
                  >
                    {row.label}
                  </button>
                </td>
                <td className="px-4 py-4 text-body text-ink">{row.format}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-8 list-none space-y-0 border-y border-line p-0 md:mt-12 md:hidden">
        {machineCompatibilityBrands.map((brand) => {
          const isOpen = openId === brand.id;
          const panelId = `${baseId}-${brand.id}-panel`;
          const buttonId = `${baseId}-${brand.id}-button`;
          const models = modelsForBrand(brand.id);

          return (
            <li key={brand.id} className="machineBrandItem border-b border-line last:border-b-0">
              <h3>
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-body text-ink"
                  onClick={() => {
                    setOpenId(isOpen ? null : brand.id);
                  }}
                >
                  <span>{brand.name}</span>
                  <span
                    aria-hidden="true"
                    className={`collapse-chevron text-ink${isOpen ? " is-open" : ""}`}
                  >
                    <ChevronDownIcon />
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                aria-hidden={!isOpen}
                inert={!isOpen}
                className={`collapse-panel${isOpen ? " is-open" : ""}`}
              >
                <div className="collapse-panel-inner">
                  <div className="pb-5">
                    <p className="text-meta leading-6 text-ink-soft">{brand.summary}</p>
                    <button
                      type="button"
                      className="mt-4 min-h-11 text-meta uppercase tracking-[0.14em] text-ink underline-offset-4 hover:underline"
                      onClick={() => {
                        onSelect(brandSelection(brand));
                      }}
                    >
                      {brand.format}
                    </button>
                    {models.length === 0 ? (
                      <p className="mt-4 text-meta leading-6 text-ink-soft">
                        {machineCompatibilityPageCopy.brandEmptyModels}
                      </p>
                    ) : (
                      <ul className="mt-4 list-none space-y-3 p-0">
                        {models.map((model) => (
                          <li
                            key={model.id}
                            className="flex items-center justify-between gap-4 border-t border-line pt-3"
                          >
                            <button
                              type="button"
                              className="min-h-11 text-left text-body text-ink"
                              onClick={() => {
                                onSelect({
                                  id: model.id,
                                  label: model.label,
                                  brand: model.brand,
                                  format: model.format,
                                  kind: "model",
                                });
                              }}
                            >
                              {model.model}
                            </button>
                            <span className="text-meta text-ink-soft">{model.format}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <ul className="mt-10 hidden list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid lg:grid-cols-5">
        {machineCompatibilityBrands.map((brand) => (
          <li key={brand.id} className="machineBrandItem">
            <button
              type="button"
              className="flex min-h-14 w-full items-center justify-center border border-line bg-paper px-3 text-meta uppercase tracking-[0.12em] text-ink hover:border-ink"
              onClick={() => {
                onSelect(brandSelection(brand));
              }}
            >
              {brand.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
