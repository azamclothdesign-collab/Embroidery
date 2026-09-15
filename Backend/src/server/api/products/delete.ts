import { productSlugParamSchema } from "../../../schemas/productSchema.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { deleteProductBySlug } from "../../services/products/productService.js";

const handle: ApiHandler = async (context) => {
  if (context.adminUserId === undefined) {
    context.sendError(403, "forbidden", "Forbidden");
    return;
  }

  const parsed = productSlugParamSchema.safeParse(context.params);

  if (!parsed.success) {
    context.sendError(400, "validation_error", "Invalid product slug");
    return;
  }

  try {
    const result = await deleteProductBySlug(parsed.data.slug);
    context.sendJson(200, result);
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
