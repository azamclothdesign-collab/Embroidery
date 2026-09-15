import { mediaUploadBodySchema } from "../../../../schemas/mediaSchema.js";
import { parseZodBody } from "../../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../../middleware/handlerTypes.js";
import { storeAdminImage } from "../../../services/media/mediaService.js";

const handle: ApiHandler = async (context) => {
  if (context.adminUserId === undefined) {
    context.sendError(403, "forbidden", "Forbidden");
    return;
  }

  const parsed = parseZodBody(context, mediaUploadBodySchema);

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const media = await storeAdminImage(parsed.data);
    context.sendJson(201, { media });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
