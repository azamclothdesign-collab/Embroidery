import { accountSettingsBodySchema } from "../../../../schemas/accountSchema.js";
import { parseZodBody } from "../../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../../middleware/handlerTypes.js";
import { putAccountSettings } from "../../../services/account/accountService.js";

const handle: ApiHandler = async (context) => {
  const parsed = parseZodBody(context, accountSettingsBodySchema);

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const settings = await putAccountSettings({
      customerId: context.customerId,
      settings: parsed.data,
    });
    context.sendJson(200, { settings });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
