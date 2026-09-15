export type MachineBrandId =
  | "brother"
  | "janome"
  | "bernina"
  | "juki"
  | "singer"
  | "pfaff"
  | "husqvarna-viking"
  | "melco"
  | "tajima"
  | "baby-lock";

export type MachineBrand = {
  id: MachineBrandId;
  name: string;
  format: string;
  summary: string;
};

export type MachineModel = {
  id: string;
  brandId: MachineBrandId;
  brand: string;
  model: string;
  label: string;
  format: string;
  searchTerms: readonly string[];
};

export type MachineSelection = {
  id: string;
  label: string;
  brand: string;
  format: string;
  kind: "brand" | "model";
};

export const machineCompatibilityBrands: readonly MachineBrand[] = [
  {
    id: "brother",
    name: "Brother",
    format: "PES",
    summary: "Brother embroidery machines commonly use PES files.",
  },
  {
    id: "janome",
    name: "Janome",
    format: "JEF",
    summary: "Janome embroidery machines are commonly associated with JEF files.",
  },
  {
    id: "bernina",
    name: "Bernina",
    format: "EXP",
    summary: "Bernina workflows commonly involve EXP embroidery files.",
  },
  {
    id: "juki",
    name: "Juki",
    format: "DST",
    summary: "Many Juki embroidery workflows commonly use DST files.",
  },
  {
    id: "singer",
    name: "Singer",
    format: "PES",
    summary: "Many Singer embroidery machines commonly use PES files.",
  },
  {
    id: "pfaff",
    name: "Pfaff",
    format: "VP3",
    summary: "Pfaff embroidery machines commonly use VP3 files.",
  },
  {
    id: "husqvarna-viking",
    name: "Husqvarna Viking",
    format: "VP3",
    summary: "Husqvarna Viking machines commonly use VP3 files.",
  },
  {
    id: "melco",
    name: "Melco",
    format: "EXP",
    summary: "Melco-compatible workflows commonly use EXP files.",
  },
  {
    id: "tajima",
    name: "Tajima",
    format: "DST",
    summary: "Tajima embroidery machines commonly use DST files.",
  },
  {
    id: "baby-lock",
    name: "Baby Lock",
    format: "PES",
    summary: "Baby Lock embroidery machines commonly use PES files.",
  },
] as const;

/** Models named in the page brief only — no invented catalog beyond these. */
export const machineCompatibilityModels: readonly MachineModel[] = [
  {
    id: "brother-pe800",
    brandId: "brother",
    brand: "Brother",
    model: "PE800",
    label: "Brother PE800",
    format: "PES",
    searchTerms: ["brother pe800", "pe800", "brother pe 800"],
  },
  {
    id: "brother-pe535",
    brandId: "brother",
    brand: "Brother",
    model: "PE535",
    label: "Brother PE535",
    format: "PES",
    searchTerms: ["brother pe535", "pe535"],
  },
  {
    id: "brother-se600",
    brandId: "brother",
    brand: "Brother",
    model: "SE600",
    label: "Brother SE600",
    format: "PES",
    searchTerms: ["brother se600", "se600"],
  },
  {
    id: "brother-se1900",
    brandId: "brother",
    brand: "Brother",
    model: "SE1900",
    label: "Brother SE1900",
    format: "PES",
    searchTerms: ["brother se1900", "se1900"],
  },
  {
    id: "janome-mc550e",
    brandId: "janome",
    brand: "Janome",
    model: "MC550E",
    label: "Janome MC550E",
    format: "JEF",
    searchTerms: ["janome mc550e", "mc550e", "janome memory craft", "memory craft"],
  },
  {
    id: "bernina-790",
    brandId: "bernina",
    brand: "Bernina",
    model: "790",
    label: "Bernina 790",
    format: "EXP",
    searchTerms: ["bernina 790", "790"],
  },
] as const;

export const machineCompatibilityPopularBrandIds = [
  "brother",
  "janome",
  "bernina",
  "juki",
  "singer",
] as const satisfies readonly MachineBrandId[];

export function brandSelection(brand: MachineBrand): MachineSelection {
  return {
    id: `brand-${brand.id}`,
    label: brand.name,
    brand: brand.name,
    format: brand.format,
    kind: "brand",
  };
}

export function modelSelection(model: MachineModel): MachineSelection {
  return {
    id: model.id,
    label: model.label,
    brand: model.brand,
    format: model.format,
    kind: "model",
  };
}

export function modelsForBrand(brandId: MachineBrandId): MachineModel[] {
  return machineCompatibilityModels.filter((item) => item.brandId === brandId);
}

export function searchMachineCatalog(query: string): MachineSelection[] {
  const normalized = query.trim().toLowerCase().replaceAll(/\s+/g, " ");

  if (normalized.length === 0) {
    return [];
  }

  const modelHits = machineCompatibilityModels
    .filter((item) => {
      return (
        item.label.toLowerCase().includes(normalized) ||
        item.model.toLowerCase().includes(normalized) ||
        item.searchTerms.some((term) => term.includes(normalized) || normalized.includes(term))
      );
    })
    .map(modelSelection);

  const brandHits = machineCompatibilityBrands
    .filter((item) => {
      const name = item.name.toLowerCase();

      if (name.includes(normalized) || normalized.includes(name)) {
        return true;
      }

      if (normalized.includes("juki") && normalized.includes("tajima")) {
        return item.id === "juki" || item.id === "tajima";
      }

      return false;
    })
    .map(brandSelection);

  const seen = new Set<string>();
  const combined = [...modelHits, ...brandHits].filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });

  return combined.slice(0, 8);
}

export function findBrandById(id: MachineBrandId): MachineBrand | undefined {
  return machineCompatibilityBrands.find((item) => item.id === id);
}
