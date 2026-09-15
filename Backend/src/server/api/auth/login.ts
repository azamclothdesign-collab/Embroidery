import { loginBodySchema } from "../../../schemas/authSchema.js";
import { parseZodBody } from "../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { loginCustomer } from "../../services/auth/authService.js";

const handle: ApiHandler = async (context) => {
  const parsed = parseZodBody(context, loginBodySchema);

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const result = await loginCustomer({
      email: parsed.data.email,
      password: parsed.data.password,
      guestToken: context.guestToken,
    });
    context.sendJson(200, result);
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
