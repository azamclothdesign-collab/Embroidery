export function resolveSafeNextPath(path: string, fallback: string): string {
  if (path.startsWith("/") && !path.startsWith("//") && !path.includes("\\")) {
    return path;
  }

  return fallback;
}
