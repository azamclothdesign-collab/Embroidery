import { existsSync } from "node:fs";
import path from "node:path";

export function finalCtaVideoFileExists(): boolean {
  return existsSync(path.join(process.cwd(), "public", "assets", "finalCta.mp4"));
}
