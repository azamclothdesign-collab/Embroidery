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
