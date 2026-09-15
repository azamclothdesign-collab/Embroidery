import { existsSync } from "node:fs";
import path from "node:path";

export function fromScreenToStitchVideoFileExists(): boolean {
  return existsSync(
    path.join(process.cwd(), "public", "assets", "fromScreenToStitch.mp4"),
  );
}
