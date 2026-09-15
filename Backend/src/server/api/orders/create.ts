import { orderCreateBodySchema } from "../../../schemas/orderSchema.js";
import { parseZodBody } from "../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { createOrder } from "../../services/orders/orderService.js";

const handle: ApiHandler = async (context) => {
  const parsed = parseZodBody(context, orderCreateBodySchema);

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const order = await createOrder({
      customerId: context.customerId,
      email: parsed.data.email,
      totalCents: parsed.data.totalCents,
      discountCents: parsed.data.discountCents,
      lines: parsed.data.lines,
    });
    context.sendJson(201, { order });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
