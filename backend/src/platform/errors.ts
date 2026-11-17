export type FieldErrors = Record<string, string>;

/** A known, safe-to-show failure. Anything else becomes a 500 with no details. */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: FieldErrors | undefined;
  readonly retryAfterSeconds: number | undefined;

  constructor(
    status: number,
    code: string,
    message: string,
    extra: { fields?: FieldErrors; retryAfterSeconds?: number } = {},
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.fields = extra.fields;
    this.retryAfterSeconds = extra.retryAfterSeconds;
  }
}

export const notFound = (what = "Resource") => new AppError(404, "not_found", `${what} not found`);
export const badRequest = (code: string, message: string, fields?: FieldErrors) =>
  new AppError(400, code, message, fields === undefined ? {} : { fields });
export const conflict = (code: string, message: string) => new AppError(409, code, message);
export const unauthorized = () => new AppError(401, "unauthorized", "Please sign in again");
export const forbidden = () => new AppError(403, "forbidden", "Not allowed");
export const unavailable = (code: string, message: string) => new AppError(503, code, message);
