type LogLevel = "info" | "warn" | "error";

type LogContext = {
  correlationId?: string;
  durationMs?: number;
  queryName?: string;
};

export function writeLog(
  level: LogLevel,
  message: string,
  context: LogContext = {},
): void {
  const line = JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  });

  process.stdout.write(`${line}\n`);
}
