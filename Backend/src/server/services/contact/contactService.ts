import { insertContactMessage } from "../../database/repositories/contact/contactRepository.js";
import { type ContactMessageInput, type ContactMessageRecord } from "../../../types/contact.js";

export async function createContactMessage(
  input: ContactMessageInput,
): Promise<ContactMessageRecord> {
  return insertContactMessage(input);
}
