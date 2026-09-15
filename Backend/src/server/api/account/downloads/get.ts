import { handleServiceError } from "../../../../utils/serviceError.js";
import {
  type ApiHandler,
  type HandlerModule,
} from "../../../middleware/handlerTypes.js";
import { getAccountDownloads } from "../../../services/account/accountService.js";

export const requireOrigin = false;

const handle: ApiHandler = async (context) => {
  try {
    const downloads = await getAccountDownloads(context.customerId);
    context.sendJson(200, downloads);
  } catch (error) {
    handleServiceError(context.sendError, error);
  }
};

export { handle };
export default { handle, requireOrigin } satisfies HandlerModule;
