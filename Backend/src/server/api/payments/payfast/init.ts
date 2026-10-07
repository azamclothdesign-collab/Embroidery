import { payfastInitBodySchema } from "../../../../schemas/paymentSchema.js";
import { parseZodBody } from "../../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../../middleware/handlerTypes.js";
import { initPayFastCheckout } from "../../../services/payments/payfastService.js";

const handle: ApiHandler = async (context) => {
  const parsed = parseZodBody(context, payfastInitBodySchema);

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const checkout = await initPayFastCheckout({
      orderId: parsed.data.orderId,
      customerIp: context.clientIp,
      ...(parsed.data.locale !== undefined
        ? { locale: parsed.data.locale }
        : {}),
    });

    context.sendJson(200, checkout);
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
