"use client";

import { Mail, MessageCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteMessageAction, markMessageReadAction } from "@/actions/admin";
import { ConfirmAction } from "@/features/admin/ConfirmButtons";
import { useSave } from "@/features/admin/useSave";

type MessageActionsProps = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  isRead: boolean;
};

/** Builds https://wa.me/<digits> for Pakistan-style and international numbers. */
function whatsappUrl(phone: string, name: string, message: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return null;

  let international = digits;
  if (international.startsWith("00")) international = international.slice(2);
  else if (international.startsWith("0") && international.length === 11) {
    international = `92${international.slice(1)}`;
  }

  const preview = message.trim().slice(0, 120);
  const text = [
    `Hi ${name.trim() || "there"},`,
    "",
    "Thanks for your message on Chand Designer.",
    preview.length > 0 ? `Regarding: "${preview}${message.trim().length > 120 ? "…" : ""}"` : null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  return `https://wa.me/${international}?text=${encodeURIComponent(text)}`;
}

function emailUrl(email: string, name: string, message: string): string {
  const subject = `Re: your message to Chand Designer`;
  const body = [
    `Hi ${name.trim() || "there"},`,
    "",
    "Thanks for contacting Chand Designer.",
    "",
    "——— Your message ———",
    message.trim(),
    "———————————————",
    "",
  ].join("\n");

  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function MessageActions({
  id,
  name,
  email,
  phone,
  message,
  isRead,
}: MessageActionsProps) {
  const router = useRouter();
  const { save, pending } = useSave();
  const wa = whatsappUrl(phone, name, message);
  const mail = emailUrl(email, name, message);

  const markReadIfNeeded = () => {
    if (isRead || pending) return;
    void markMessageReadAction(id).then(() => router.refresh());
  };

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <a
        href={mail}
        className="btn btn-outline min-h-9 px-3"
        onClick={markReadIfNeeded}
      >
        <Mail className="size-4" aria-hidden />
        Email
      </a>
      {wa === null ? null : (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline min-h-9 px-3"
          onClick={markReadIfNeeded}
        >
          <MessageCircle className="size-4" aria-hidden />
          WhatsApp
        </a>
      )}
      <ConfirmAction
        label="Delete"
        confirmLabel="Delete forever?"
        icon={<Trash2 className="size-4" aria-hidden />}
        className="min-h-9 px-3 text-danger"
        successMessage="Message deleted"
        run={() => deleteMessageAction(id)}
        onDone={() => router.refresh()}
      />
    </div>
  );
}
