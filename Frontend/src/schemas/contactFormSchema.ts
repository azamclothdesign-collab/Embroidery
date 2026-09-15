const topicIds = [
  "file-format",
  "machine-compatibility",
  "download-issue",
  "order-question",
  "payment-question",
  "embroidery-guide",
  "licensing",
  "technical-issue",
  "other",
] as const;

export type ContactTopicId = (typeof topicIds)[number];

export type ContactFormValues = {
  name: string;
  email: string;
  topic: string;
  orderNumber?: string;
  message: string;
};

type SafeParseSuccess<T> = { success: true; data: T };
type SafeParseFailure = { success: false };
type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseFailure;

function trim(value: string): string {
  return value.trim();
}

function isValidEmail(value: string): boolean {
  const email = trim(value);
  return (
    email.length > 0 &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function isTopicId(value: string): value is ContactTopicId {
  return (topicIds as readonly string[]).includes(value);
}

export const contactFormSchema = {
  shape: {
    name: {
      safeParse(value: string): SafeParseResult<string> {
        const name = trim(value);
        return name.length >= 1 && name.length <= 120
          ? { success: true, data: name }
          : { success: false };
      },
    },
    email: {
      safeParse(value: string): SafeParseResult<string> {
        const email = trim(value);
        return isValidEmail(email)
          ? { success: true, data: email }
          : { success: false };
      },
    },
    message: {
      safeParse(value: string): SafeParseResult<string> {
        const message = trim(value);
        return message.length >= 1 && message.length <= 4000
          ? { success: true, data: message }
          : { success: false };
      },
    },
  },
  safeParse(values: ContactFormValues): SafeParseResult<{
    name: string;
    email: string;
    topic: ContactTopicId;
    orderNumber?: string;
    message: string;
  }> {
    const name = contactFormSchema.shape.name.safeParse(values.name);
    const email = contactFormSchema.shape.email.safeParse(values.email);
    const message = contactFormSchema.shape.message.safeParse(values.message);
    const orderNumber =
      values.orderNumber === undefined
        ? undefined
        : trim(values.orderNumber);

    if (
      !name.success ||
      !email.success ||
      !message.success ||
      !isTopicId(values.topic) ||
      (orderNumber !== undefined && orderNumber.length > 40)
    ) {
      return { success: false };
    }

    return {
      success: true,
      data: {
        name: name.data,
        email: email.data,
        topic: values.topic,
        ...(orderNumber === undefined || orderNumber === ""
          ? {}
          : { orderNumber }),
        message: message.data,
      },
    };
  },
};
