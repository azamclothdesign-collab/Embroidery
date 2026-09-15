export const machineFormats = [
  { machine: "Brother", format: "PES" },
  { machine: "Janome", format: "JEF" },
  { machine: "Tajima", format: "DST" },
  { machine: "Bernina", format: "EXP" },
] as const;

export type MachineName = (typeof machineFormats)[number]["machine"];

export const defaultMachineName: MachineName = "Brother";

export const machineCompatibilityCopy = {
  eyebrow: "Made for your machine",
  heading: "Not Sure Which Format You Need?",
  body: "Find the embroidery format compatible with your machine before you buy.",
  selectLabel: "Select your machine",
  formatLabel: "Compatible format",
  cta: "Find My Format",
} as const;

export function formatForMachine(machine: string): string | undefined {
  return machineFormats.find((item) => item.machine === machine)?.format;
}
