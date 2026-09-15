import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { getProducts } from "../../services/products/productService.js";

export const requireOrigin = false;

const handle: ApiHandler = async (context) => {
  try {
    const products = await getProducts();
    const visibleOnly =
      context.adminUserId === undefined
        ? products.filter((product) => product.isVisible !== false)
        : products;
    context.sendJson(200, { products: visibleOnly });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle, requireOrigin } satisfies HandlerModule;
