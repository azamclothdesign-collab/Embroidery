import { orderIdParamSchema } from "../../../schemas/orderSchema.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { getAdminOrCustomerOrder } from "../../services/orders/orderService.js";

export const requireOrigin = false;

const handle: ApiHandler = async (context) => {
  const parsed = orderIdParamSchema.safeParse(context.params);

  if (!parsed.success) {
    context.sendError(400, "validation_error", "Invalid order id");
    return;
  }

  try {
    const order = await getAdminOrCustomerOrder({
      adminUserId: context.adminUserId,
      customerId: context.customerId,
      orderId: parsed.data.orderId,
    });
    context.sendJson(200, { order });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle, requireOrigin } satisfies HandlerModule;
