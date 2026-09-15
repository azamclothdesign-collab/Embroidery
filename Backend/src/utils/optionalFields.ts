export function withOptionalField<TKey extends string, TValue>(
  key: TKey,
  value: TValue | undefined,
): Partial<Record<TKey, TValue>> {
  if (value === undefined) {
    return {};
  }

  return { [key]: value } as Partial<Record<TKey, TValue>>;
}

export function withOptionalFields<T extends Record<string, unknown>>(
  input: T,
): { [K in keyof T]?: T[K] } {
  const result: { [K in keyof T]?: T[K] } = {};

  for (const key of Object.keys(input) as (keyof T)[]) {
    const value = input[key];

    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
}
