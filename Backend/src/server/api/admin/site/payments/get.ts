import { type SitePaymentsSettings } from "../../../../../types/siteSettings.js";
import { handleServiceError } from "../../../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../../../middleware/handlerTypes.js";
import {
  getSiteSettings,
  toAdminPaymentsView,
} from "../../../../services/site/siteSettingsService.js";
import { ServiceError } from "../../../../../utils/serviceError.js";

const handle: ApiHandler = async (context) => {
  try {
    if (context.adminUserId === undefined) {
      throw new ServiceError(403, "forbidden", "Forbidden");
    }

    const settings = await getSiteSettings<SitePaymentsSettings>("payments");
    context.sendJson(200, toAdminPaymentsView(settings));
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
