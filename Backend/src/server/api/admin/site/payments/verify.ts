import { handleServiceError, ServiceError } from "../../../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../../../middleware/handlerTypes.js";
import { verifyPayFastCredentials } from "../../../../services/payments/payfastService.js";

const handle: ApiHandler = async (context) => {
  try {
    if (context.adminUserId === undefined) {
      throw new ServiceError(403, "forbidden", "Forbidden");
    }

    const result = await verifyPayFastCredentials();
    context.sendJson(200, result);
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
