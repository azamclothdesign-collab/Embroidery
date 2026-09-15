import { adminLoginBodySchema } from "../../../../schemas/adminAuthSchema.js";
import { parseZodBody } from "../../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../../middleware/handlerTypes.js";
import { loginAdmin } from "../../../services/auth/authService.js";

const handle: ApiHandler = async (context) => {
  const parsed = parseZodBody(context, adminLoginBodySchema);

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const result = await loginAdmin(parsed.data);
    context.sendJson(200, result);
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
