import { handleServiceError } from "../../../../../utils/serviceError.js";
import { type SitePagesSettings } from "../../../../../types/siteSettings.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../../../middleware/handlerTypes.js";
import { getSiteSettings } from "../../../../services/site/siteSettingsService.js";

export const requireOrigin = false;

const handle: ApiHandler = async (context) => {
  try {
    const settings = await getSiteSettings<SitePagesSettings>("pages");
    context.sendJson(200, { settings });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle, requireOrigin } satisfies HandlerModule;
