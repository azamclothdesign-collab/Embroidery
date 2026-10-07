import { sitePaymentsSettingsSchema } from "../../../../../schemas/siteSettingsSchema.js";
import { parseZodBody } from "../../../../../utils/parseHandlerBody.js";
import { handleServiceError } from "../../../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../../../middleware/handlerTypes.js";
import {
  putSiteSettings,
  toAdminPaymentsView,
} from "../../../../services/site/siteSettingsService.js";
import { type SitePaymentsSettings } from "../../../../../types/siteSettings.js";

const handle: ApiHandler = async (context) => {
  const parsed = parseZodBody(context, sitePaymentsSettingsSchema);

  if (!parsed.ok) {
    context.sendError(400, "validation_error", parsed.message);
    return;
  }

  try {
    const settings = await putSiteSettings<SitePaymentsSettings>({
      adminUserId: context.adminUserId,
      key: "payments",
      value: parsed.data,
    });
    context.sendJson(200, toAdminPaymentsView(settings));
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
