import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { getCart } from "../../services/cart/cartService.js";

export const requireOrigin = false;

const handle: ApiHandler = async (context) => {
  try {
    const cart = await getCart({
      customerId: context.customerId,
      guestToken: context.guestToken,
    });
    context.sendJson(200, cart);
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle, requireOrigin } satisfies HandlerModule;
