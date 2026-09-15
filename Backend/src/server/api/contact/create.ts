import { contactCreateBodySchema } from "../../../schemas/contactSchema.js";
import { parseZodBody } from "../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { createContactMessage } from "../../services/contact/contactService.js";

const handle: ApiHandler = async (context) => {
  const parsed = parseZodBody(context, contactCreateBodySchema);

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const message = await createContactMessage(parsed.data);
    context.sendJson(201, { message });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
