import { productSlugParamSchema } from "../../../schemas/productSchema.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { getProductBySlug } from "../../services/products/productService.js";

export const requireOrigin = false;

const handle: ApiHandler = async (context) => {
  const parsed = productSlugParamSchema.safeParse(context.params);

  if (!parsed.success) {
    context.sendError(400, "validation_error", "Invalid product slug");
    return;
  }

  try {
    const product = await getProductBySlug(parsed.data.slug);
    context.sendJson(200, { product });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle, requireOrigin } satisfies HandlerModule;
