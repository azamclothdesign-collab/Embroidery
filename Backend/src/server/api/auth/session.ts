import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { getCustomerSession } from "../../services/auth/authService.js";

export const requireOrigin = false;

const handle: ApiHandler = async (context) => {
  if (context.customerId === undefined) {
    context.sendJson(200, { session: null });
    return;
  }

  try {
    const session = await getCustomerSession(context.customerId);
    context.sendJson(200, { session });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle, requireOrigin } satisfies HandlerModule;
