import { handleServiceError } from "../../../utils/serviceError.js";
import {
  readHeader,
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { logoutCustomer } from "../../services/auth/authService.js";

const handle: ApiHandler = async (context) => {
  const sessionToken = readHeader(context.req, "x-customer-session");

  if (sessionToken === null) {
    context.sendError(401, "unauthenticated", "Unauthorized");
    return;
  }

  try {
    const result = await logoutCustomer(sessionToken);
    context.sendJson(200, result);
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
