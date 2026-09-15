import { type ZodType } from "zod";

import { type HandlerContext } from "../server/middleware/handlerTypes.js";

export type ParsedBodyResult<TData> =
  | { ok: true; data: TData }
  | { ok: false; message: string };

export function parseJsonBody(body: string): unknown {
  if (body.trim().length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return undefined;
  }
}

export function parseZodBody<TData>(
  context: HandlerContext,
  schema: ZodType<TData>,
): ParsedBodyResult<TData> {
  const parsed = schema.safeParse(context.parsedBody);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const detail =
      firstIssue === undefined
        ? "Invalid request body"
        : firstIssue.path.length > 0
          ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
          : firstIssue.message;

    return { ok: false, message: detail };
  }

  return { ok: true, data: parsed.data };
}
