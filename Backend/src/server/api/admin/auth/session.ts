import { handleServiceError } from "../../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../../middleware/handlerTypes.js";
import { getAdminSession } from "../../../services/auth/authService.js";

export const requireOrigin = false;

const handle: ApiHandler = async (context) => {
  if (context.adminUserId === undefined) {
    context.sendJson(200, { session: null });
    return;
  }

  try {
    const session = await getAdminSession(context.adminUserId);
    context.sendJson(200, { session });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle, requireOrigin } satisfies HandlerModule;
