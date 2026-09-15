export class ServiceError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
    this.code = code;
  }
}

export function handleServiceError(
  sendError: (status: number, code: string, message: string) => void,
  error: unknown,
): void {
  if (error instanceof ServiceError) {
    sendError(error.status, error.code, error.message);
    return;
  }

  throw error;
}
