import { registerBodySchema } from "../../../schemas/authSchema.js";
import { parseZodBody } from "../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { registerCustomer } from "../../services/auth/authService.js";

const handle: ApiHandler = async (context) => {
  const parsed = parseZodBody(context, registerBodySchema);

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const result = await registerCustomer({
      email: parsed.data.email,
      password: parsed.data.password,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      guestToken: context.guestToken,
    });
    context.sendJson(201, result);
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
