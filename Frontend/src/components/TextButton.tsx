import { type ButtonHTMLAttributes } from "react";

import { actionClassName } from "@/components/actionClassName";

type TextButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "ink" | "paper" | "ghostOnDark" | "ghostOnLight";
};

export function TextButton({
  className,
  tone = "ink",
  type = "button",
  ...props
}: TextButtonProps) {
  return (
    <button
      {...props}
      className={actionClassName({ tone, className: className ?? null })}
      type={type}
    />
  );
}
