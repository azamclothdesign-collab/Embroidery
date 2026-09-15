import "./loadEnv.js";

import { createHttpServer } from "./server/createServer.js";
import { pool } from "./server/database/pool.js";
import { env } from "./schemas/envSchema.js";
import { writeLog } from "./utils/structuredLogger.js";

const server = createHttpServer();

server.listen(env.PORT, () => {
  writeLog("info", "server_started", { queryName: String(env.PORT) });
});

async function shutdown(signal: string): Promise<void> {
  writeLog("info", "server_shutdown", { queryName: signal });

  await new Promise<void>((resolve, reject) => {
    server.close((error?: Error) => {
      if (error !== undefined) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  await pool.end();
  process.exit(0);
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
