"use server";

import { ApiClientError } from "@/lib/api/apiClient";
import { submitContactMessage } from "@/lib/api/contactApi";
import { type ContactMessageInput } from "@/types/api/contact";

export async function submitContactAction(
  input: ContactMessageInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await submitContactMessage(input);
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, error: error.code };
    }

    return { ok: false, error: "failed" };
  }
}
