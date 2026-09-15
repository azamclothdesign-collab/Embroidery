import {
  productBodySchema,
  productSlugParamSchema,
} from "../../../schemas/productSchema.js";
import { parseZodBody } from "../../../utils/parseHandlerBody.js";
import { withOptionalFields } from "../../../utils/optionalFields.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import { updateProductBySlug } from "../../services/products/productService.js";

const handle: ApiHandler = async (context) => {
  if (context.adminUserId === undefined) {
    context.sendError(403, "forbidden", "Forbidden");
    return;
  }

  const params = productSlugParamSchema.safeParse(context.params);

  if (!params.success) {
    context.sendError(400, "validation_error", "Invalid product slug");
    return;
  }

  const parsed = parseZodBody(context, productBodySchema.omit({ slug: true }));

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const product = await updateProductBySlug(params.data.slug, {
      ...parsed.data,
      ...withOptionalFields({
        stitchedImageSrc: parsed.data.stitchedImageSrc,
        stitchedImageAlt: parsed.data.stitchedImageAlt,
        description: parsed.data.description,
        packagePath: parsed.data.packagePath,
        packageFileName: parsed.data.packageFileName,
        isVisible: parsed.data.isVisible,
      }),
    });
    context.sendJson(200, { product });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
