import { sitePagesSettingsSchema } from "../../../../../schemas/siteSettingsSchema.js";
import { parseZodBody } from "../../../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../../../middleware/handlerTypes.js";
import { putSiteSettings } from "../../../../services/site/siteSettingsService.js";

const handle: ApiHandler = async (context) => {
  const parsed = parseZodBody(context, sitePagesSettingsSchema);

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const settings = await putSiteSettings({
      adminUserId: context.adminUserId,
      key: "pages",
      value: parsed.data,
    });
    context.sendJson(200, { settings });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
