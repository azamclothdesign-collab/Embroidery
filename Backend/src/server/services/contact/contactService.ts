import { insertContactMessage } from "../../database/repositories/contact/contactRepository.js";
import { sendContactFormEmail } from "../mail/mailService.js";
import { type ContactMessageInput, type ContactMessageRecord } from "../../../types/contact.js";

export async function createContactMessage(
  input: ContactMessageInput,
): Promise<ContactMessageRecord> {
  const message = await insertContactMessage(input);
  await sendContactFormEmail(input);
  return message;
}
