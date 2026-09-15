"use client";

import { type FormEvent, useId, useState } from "react";

import { TextButton } from "@/components/TextButton";
import {
  contactPageCopy,
  contactSupportTopics,
} from "@/constants/contactPageCopy";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/schemas/contactFormSchema";
import { submitContactAction } from "@/server/actions/contactActions";

type SubmitState = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const formId = useId();
  const [values, setValues] = useState<ContactFormValues>({
    name: "",
    email: "",
    topic: "",
    orderNumber: "",
    message: "",
  });
  const [touched, setTouched] = useState<
    Partial<Record<keyof ContactFormValues, boolean>>
  >({});
  const [attempted, setAttempted] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const showError = (field: keyof ContactFormValues): boolean =>
    attempted || touched[field] === true;

  const nameInvalid =
    showError("name") && !contactFormSchema.shape.name.safeParse(values.name).success;
  const emailInvalid =
    values.email.length > 0 &&
    !contactFormSchema.shape.email.safeParse(values.email).success;
  const emailRequiredInvalid =
    showError("email") && values.email.trim().length === 0;
  const topicInvalid =
    showError("topic") && values.topic.trim().length === 0;
  const messageInvalid =
    showError("message") &&
    !contactFormSchema.shape.message.safeParse(values.message).success;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    setTouched({
      name: true,
      email: true,
      topic: true,
      message: true,
      orderNumber: true,
    });

    const parsed = contactFormSchema.safeParse(values);
    if (!parsed.success) {
      return;
    }

    setSubmitState("sending");

    void submitContactAction({
      name: parsed.data.name,
      email: parsed.data.email,
      topic: parsed.data.topic,
      orderNumber:
        parsed.data.orderNumber !== undefined &&
        parsed.data.orderNumber.length > 0
          ? parsed.data.orderNumber
          : undefined,
      message: parsed.data.message,
    }).then((result) => {
      if (!result.ok) {
        setSubmitState("error");
        return;
      }

      setSubmitState("success");
    });
  };

  if (submitState === "success") {
    return (
      <div
        className="contactFormPanel border border-line bg-surface p-6 md:p-8"
        role="status"
        aria-live="polite"
      >
        <p className="text-meta uppercase tracking-[0.18em] text-accent">
          ✓ {contactPageCopy.successHeading}
        </p>
        <p className="mt-4 text-body leading-8 text-ink-soft">
          {contactPageCopy.successBody}
        </p>
        <p className="mt-4 text-meta leading-6 text-ink-soft">
          {contactPageCopy.successNote}
        </p>
        <div className="mt-8">
          <TextButton
            tone="ghostOnLight"
            onClick={() => {
              setSubmitState("idle");
              setAttempted(false);
              setValues({
                name: "",
                email: "",
                topic: "",
                orderNumber: "",
                message: "",
              });
              setTouched({});
            }}
          >
            {contactPageCopy.sendMessage}
          </TextButton>
        </div>
      </div>
    );
  }

  if (submitState === "error") {
    return (
      <div
        className="contactFormPanel border border-line bg-surface p-6 md:p-8"
        role="alert"
      >
        <p className="text-h3 font-medium text-ink">{contactPageCopy.errorHeading}</p>
        <p className="mt-3 text-body text-ink-soft">{contactPageCopy.errorBody}</p>
        <div className="mt-8">
          <TextButton
            onClick={() => {
              setSubmitState("idle");
            }}
          >
            {contactPageCopy.tryAgain}
          </TextButton>
        </div>
      </div>
    );
  }

  return (
    <form
      className="contactFormPanel border border-line bg-surface p-6 md:p-8"
      noValidate
      onSubmit={onSubmit}
    >
      <h2
        id="contact-form-heading"
        className="text-title-sm font-medium tracking-tight text-ink"
      >
        {contactPageCopy.formHeading}
      </h2>
      <p className="mt-3 text-body leading-8 text-ink-soft">{contactPageCopy.formBody}</p>

      <div className="mt-8 space-y-6">
        <div>
          <label
            htmlFor={`${formId}-name`}
            className="text-meta uppercase tracking-[0.14em] text-ink-soft"
          >
            {contactPageCopy.nameLabel}
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            autoComplete="name"
            maxLength={120}
            value={values.name}
            aria-invalid={nameInvalid}
            className="mt-2 min-h-12 w-full border border-line bg-paper px-4 text-body text-ink outline-none focus-visible:border-ink"
            onBlur={() => {
              setTouched((current) => ({ ...current, name: true }));
            }}
            onChange={(event) => {
              setValues((current) => ({ ...current, name: event.target.value }));
            }}
          />
          {nameInvalid ? (
            <p className="mt-2 text-meta text-ink">{contactPageCopy.nameRequired}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={`${formId}-email`}
            className="text-meta uppercase tracking-[0.14em] text-ink-soft"
          >
            {contactPageCopy.emailLabel}
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            name="email"
            autoComplete="email"
            maxLength={254}
            value={values.email}
            aria-invalid={emailInvalid || emailRequiredInvalid}
            className="mt-2 min-h-12 w-full border border-line bg-paper px-4 text-body text-ink outline-none focus-visible:border-ink"
            onBlur={() => {
              setTouched((current) => ({ ...current, email: true }));
            }}
            onChange={(event) => {
              setValues((current) => ({ ...current, email: event.target.value }));
            }}
          />
          {emailInvalid || emailRequiredInvalid ? (
            <p className="mt-2 text-meta text-ink">{contactPageCopy.emailInvalid}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={`${formId}-topic`}
            className="text-meta uppercase tracking-[0.14em] text-ink-soft"
          >
            {contactPageCopy.topicLabel}
          </label>
          <select
            id={`${formId}-topic`}
            name="topic"
            value={values.topic}
            aria-invalid={topicInvalid}
            className="mt-2 min-h-12 w-full appearance-none border border-line bg-paper px-4 text-body text-ink outline-none focus-visible:border-ink"
            onBlur={() => {
              setTouched((current) => ({ ...current, topic: true }));
            }}
            onChange={(event) => {
              setValues((current) => ({ ...current, topic: event.target.value }));
            }}
          >
            {contactSupportTopics.map((topic) => (
              <option key={topic.id || "placeholder"} value={topic.id}>
                {topic.label}
              </option>
            ))}
          </select>
          {topicInvalid ? (
            <p className="mt-2 text-meta text-ink">{contactPageCopy.topicRequired}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={`${formId}-order`}
            className="text-meta uppercase tracking-[0.14em] text-ink-soft"
          >
            {contactPageCopy.orderLabel}
          </label>
          <input
            id={`${formId}-order`}
            name="orderNumber"
            maxLength={40}
            value={values.orderNumber ?? ""}
            placeholder={contactPageCopy.orderPlaceholder}
            className="mt-2 min-h-12 w-full border border-line bg-paper px-4 text-body text-ink outline-none focus-visible:border-ink"
            onChange={(event) => {
              setValues((current) => ({
                ...current,
                orderNumber: event.target.value,
              }));
            }}
          />
        </div>

        <div>
          <label
            htmlFor={`${formId}-message`}
            className="text-meta uppercase tracking-[0.14em] text-ink-soft"
          >
            {contactPageCopy.messageLabel}
          </label>
          <textarea
            id={`${formId}-message`}
            name="message"
            rows={6}
            maxLength={4000}
            value={values.message}
            placeholder={contactPageCopy.messagePlaceholder}
            aria-invalid={messageInvalid}
            className="mt-2 w-full border border-line bg-paper px-4 py-3 text-body text-ink outline-none focus-visible:border-ink"
            onBlur={() => {
              setTouched((current) => ({ ...current, message: true }));
            }}
            onChange={(event) => {
              setValues((current) => ({ ...current, message: event.target.value }));
            }}
          />
          {messageInvalid ? (
            <p className="mt-2 text-meta text-ink">{contactPageCopy.messageRequired}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-8">
        <TextButton type="submit" disabled={submitState === "sending"}>
          {submitState === "sending"
            ? contactPageCopy.sending
            : contactPageCopy.sendMessage}
        </TextButton>
      </div>
    </form>
  );
}
