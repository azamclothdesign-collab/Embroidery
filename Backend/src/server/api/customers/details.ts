import { customerIdParamSchema } from "../../../schemas/accountSchema.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { getCustomerById } from "../../services/customers/customerService.js";

export const requireOrigin = false;

const handle: ApiHandler = async (context) => {
  if (context.adminUserId === undefined) {
    context.sendError(403, "forbidden", "Forbidden");
    return;
  }

  const parsed = customerIdParamSchema.safeParse(context.params);

  if (!parsed.success) {
    context.sendError(400, "validation_error", "Invalid customer id");
    return;
  }

  try {
    const customer = await getCustomerById(parsed.data.id);
    context.sendJson(200, { customer });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle, requireOrigin } satisfies HandlerModule;
