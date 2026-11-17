import { buildApp } from "./app.ts";
import { config } from "./platform/config.ts";
import { pool } from "./platform/db.ts";
import { ensureStorage } from "./platform/storage.ts";
import { bootstrapAdmin } from "./features/admin/bootstrapAdmin.ts";

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function main(): Promise<void> {
  await ensureStorage();
  await pool.query("SELECT 1");
  await bootstrapAdmin();

  const app = await buildApp();
  await app.listen({ host: config.HOST, port: config.PORT });

  let stopping = false;
  const shutdown = (signal: string) => {
    if (stopping) return;
    stopping = true;
    app.log.info({ signal }, "shutting down");
    const timer = setTimeout(() => {
      app.log.error("forced exit after shutdown timeout");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    timer.unref();
    app
      .close()
      .then(() => pool.end())
      .then(() => process.exit(0))
      .catch((error: unknown) => {
        app.log.error({ err: error }, "shutdown failed");
        process.exit(1);
      });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

process.on("unhandledRejection", (reason) => {
  console.error(JSON.stringify({ level: "fatal", msg: "unhandled rejection", error: String(reason) }));
  process.exit(1);
});

main().catch((error: unknown) => {
  console.error(JSON.stringify({ level: "fatal", msg: "startup failed", error: (error as Error).message }));
  process.exit(1);
});
