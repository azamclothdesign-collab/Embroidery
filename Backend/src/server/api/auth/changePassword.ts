import { changePasswordBodySchema } from "../../../schemas/authSchema.js";
import { parseZodBody } from "../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { changeCustomerPassword } from "../../services/auth/authService.js";

const handle: ApiHandler = async (context) => {
  if (context.customerId === undefined) {
    context.sendError(401, "unauthenticated", "Unauthorized");
    return;
  }

  const parsed = parseZodBody(context, changePasswordBodySchema);

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const result = await changeCustomerPassword({
      customerId: context.customerId,
      currentPassword: parsed.data.currentPassword,
      nextPassword: parsed.data.nextPassword,
    });
    context.sendJson(200, result);
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
