import { payfastConfirmBodySchema } from "../../../../schemas/paymentSchema.js";
import { parseZodBody } from "../../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../../middleware/handlerTypes.js";
import { confirmPayFastPayment } from "../../../services/payments/payfastService.js";

const handle: ApiHandler = async (context) => {
  const parsed = parseZodBody(context, payfastConfirmBodySchema);

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const order = await confirmPayFastPayment({
      orderId: parsed.data.orderId,
      ...(parsed.data.signature !== undefined
        ? { signature: parsed.data.signature }
        : {}),
      ...(parsed.data.paymentReference !== undefined
        ? { paymentReference: parsed.data.paymentReference }
        : {}),
      ...(parsed.data.markFailed !== undefined
        ? { markFailed: parsed.data.markFailed }
        : {}),
    });

    context.sendJson(200, { order });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
