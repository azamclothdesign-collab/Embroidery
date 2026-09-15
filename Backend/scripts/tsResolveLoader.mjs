/**
 * Remaps ESM `.js` imports to sibling `.ts` sources for Node type-stripping.
 */
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (typeof specifier === "string" && specifier.endsWith(".js") && context.parentURL) {
    try {
      const candidateUrl = new URL(specifier, context.parentURL);
      const tsPath = fileURLToPath(candidateUrl).replace(/\.js$/u, ".ts");

      if (existsSync(tsPath)) {
        return nextResolve(pathToFileURL(tsPath).href, context);
      }
    } catch {
      // Fall through to default resolution.
    }
  }

  return nextResolve(specifier, context);
}
