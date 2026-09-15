import { type ReactNode } from "react";

type PageEnterProps = {
  children: ReactNode;
};

export function PageEnter({ children }: PageEnterProps) {
  return <div className="page-enter">{children}</div>;
}
