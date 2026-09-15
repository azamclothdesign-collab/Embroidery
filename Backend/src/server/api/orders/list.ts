import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import {
  listAdminOrders,
  listCustomerOrders,
} from "../../services/orders/orderService.js";

export const requireOrigin = false;

const handle: ApiHandler = async (context) => {
  try {
    const orders =
      context.adminUserId !== undefined
        ? await listAdminOrders(context.adminUserId)
        : await listCustomerOrders(context.customerId);
    context.sendJson(200, { orders });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle, requireOrigin } satisfies HandlerModule;
