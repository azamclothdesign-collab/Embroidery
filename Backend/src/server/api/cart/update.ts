import { cartUpdateBodySchema } from "../../../schemas/cartSchema.js";
import { parseZodBody } from "../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { updateCart } from "../../services/cart/cartService.js";

const handle: ApiHandler = async (context) => {
  const parsed = parseZodBody(context, cartUpdateBodySchema);

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const cart = await updateCart({
      customerId: context.customerId,
      guestToken: context.guestToken,
      lines: parsed.data.lines,
    });
    context.sendJson(200, cart);
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
