import { apiRoutes } from "@/constants/apiRoutes";
import { requestApiJsonWithContext } from "@/lib/api/apiClient";
import {
  type ContactMessageInput,
  type ContactMessageRecord,
} from "@/types/api/contact";

import "server-only";

type ContactCreateResponse = {
  message: ContactMessageRecord;
};

export async function submitContactMessage(
  input: ContactMessageInput,
): Promise<ContactMessageRecord> {
  const data = await requestApiJsonWithContext<ContactCreateResponse>({
    method: "POST",
    path: apiRoutes.contact.create,
    body: input,
    cacheStrategy: { cache: "no-store" },
  });

  return data.message;
}
