export type ApiErrorBody = {
  code: string;
  message: string;
};

export type ApiSuccessEnvelope<TData> = {
  data: TData;
};

export type ApiFailureEnvelope = {
  error: ApiErrorBody;
};

export type ApiEnvelope<TData> = ApiSuccessEnvelope<TData> | ApiFailureEnvelope;

export function isApiFailureEnvelope(
  value: unknown,
): value is ApiFailureEnvelope {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("error" in value)) {
    return false;
  }

  const error = value.error;

  if (typeof error !== "object" || error === null) {
    return false;
  }

  return (
    "code" in error &&
    "message" in error &&
    typeof error.code === "string" &&
    typeof error.message === "string"
  );
}
