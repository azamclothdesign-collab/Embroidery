import { type SitePaymentsSettings } from "../../../types/siteSettings.js";
import { handleServiceError } from "../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../middleware/handlerTypes.js";
import {
  getSiteSettings,
  paymentsConfigured,
} from "../../services/site/siteSettingsService.js";

const handle: ApiHandler = async (context) => {
  try {
    const settings = await getSiteSettings<SitePaymentsSettings>("payments");
    const configured = paymentsConfigured(settings);

    context.sendJson(200, {
      enabled: settings.gatewayEnabled && configured,
      provider: settings.provider,
      mode: settings.mode,
      configured,
    });
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle } satisfies HandlerModule;
