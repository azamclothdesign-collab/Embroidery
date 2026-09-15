import type { ApiHandler, HandlerModule } from "../../middleware/handlerTypes.js";

export const requireHmac = false;
export const requireOrigin = false;

const handle: ApiHandler = async ({ sendJson }) => {
  sendJson(200, { status: "ok" });
};

export { handle };
export default { handle, requireHmac, requireOrigin } satisfies HandlerModule;
