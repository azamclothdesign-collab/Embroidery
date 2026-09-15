import { handleServiceError } from "../../../../utils/serviceError.js";
import {
  readHeader,
  type ApiHandler,
  type HandlerModule,
} from "../../../middleware/handlerTypes.js";
import { logoutAdmin } from "../../../services/auth/authService.js";

const handle: ApiHandler = async (context) => {
  const sessionToken = readHeader(context.req, "x-admin-session");

  if (sessionToken === null) {
    context.sendError(401, "unauthenticated", "Unauthorized");
    return;
  }

  try {
    const result = await logoutAdmin(sessionToken);
    context.sendJson(200, result);
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
