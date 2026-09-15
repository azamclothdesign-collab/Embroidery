import { forgotPasswordBodySchema } from "../../../schemas/authSchema.js";
import { parseZodBody } from "../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { forgotCustomerPassword } from "../../services/auth/authService.js";

const handle: ApiHandler = async (context) => {
  const parsed = parseZodBody(context, forgotPasswordBodySchema);

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const password =
      "password" in parsed.data ? parsed.data.password : undefined;
    const result = await forgotCustomerPassword({
      email: parsed.data.email,
      password,
    });
    context.sendJson(200, result);
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
