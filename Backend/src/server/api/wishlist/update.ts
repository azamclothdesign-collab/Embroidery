import { wishlistUpdateBodySchema } from "../../../schemas/wishlistSchema.js";
import { parseZodBody } from "../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { updateWishlist } from "../../services/wishlist/wishlistService.js";

const handle: ApiHandler = async (context) => {
  const parsed = parseZodBody(context, wishlistUpdateBodySchema);

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const wishlist = await updateWishlist({
      customerId: context.customerId,
      slugs: parsed.data.slugs,
    });
    context.sendJson(200, wishlist);
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
