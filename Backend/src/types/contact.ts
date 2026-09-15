export type ContactMessageInput = {
  name: string;
  email: string;
  topic: string;
  orderNumber?: string | undefined;
  message: string;
};

export type ContactMessageRecord = ContactMessageInput & {
  id: string;
  createdAt: string;
};
