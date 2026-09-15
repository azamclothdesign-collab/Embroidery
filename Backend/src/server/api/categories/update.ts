import {
  categoryBodySchema,
  categoryIdParamSchema,
} from "../../../schemas/categorySchema.js";
import { parseZodBody } from "../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { updateCategoryById } from "../../services/categories/categoryService.js";

const handle: ApiHandler = async (context) => {
  if (context.adminUserId === undefined) {
    context.sendError(403, "forbidden", "Forbidden");
    return;
  }

  const params = categoryIdParamSchema.safeParse(context.params);

  if (!params.success) {
    context.sendError(400, "validation_error", "Invalid category id");
    return;
  }

  const parsed = parseZodBody(context, categoryBodySchema.omit({ id: true }));

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const category = await updateCategoryById(params.data.id, parsed.data);
    context.sendJson(200, { category });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
