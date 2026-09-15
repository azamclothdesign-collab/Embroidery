import { categoryIdParamSchema } from "../../../schemas/categorySchema.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { deleteCategoryById } from "../../services/categories/categoryService.js";

const handle: ApiHandler = async (context) => {
  if (context.adminUserId === undefined) {
    context.sendError(403, "forbidden", "Forbidden");
    return;
  }

  const parsed = categoryIdParamSchema.safeParse(context.params);

  if (!parsed.success) {
    context.sendError(400, "validation_error", "Invalid category id");
    return;
  }

  try {
    const result = await deleteCategoryById(parsed.data.id);
    context.sendJson(200, result);
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
