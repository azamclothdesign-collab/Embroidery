import { orderPackageDownloadBodySchema } from "../../../schemas/mediaSchema.js";
import { parseZodBody } from "../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { downloadPurchasedPackage } from "../../services/orders/orderService.js";

const handle: ApiHandler = async (context) => {
  const parsed = parseZodBody(context, orderPackageDownloadBodySchema);

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const file = await downloadPurchasedPackage({
      customerId: context.customerId,
      orderId: parsed.data.orderId,
      productSlug: parsed.data.productSlug,
    });
    context.sendJson(200, { file });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
