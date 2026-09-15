import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { getWishlist } from "../../services/wishlist/wishlistService.js";

export const requireOrigin = false;

const handle: ApiHandler = async (context) => {
  try {
    const wishlist = await getWishlist(context.customerId);
    context.sendJson(200, wishlist);
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle, requireOrigin } satisfies HandlerModule;
