import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { getCategories } from "../../services/categories/categoryService.js";

export const requireOrigin = false;

const handle: ApiHandler = async (context) => {
  try {
    const categories = await getCategories();
    context.sendJson(200, { categories });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle, requireOrigin } satisfies HandlerModule;
