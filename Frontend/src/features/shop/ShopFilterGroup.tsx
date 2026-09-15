import { type ReactNode } from "react";

import { NativeDisclosure } from "@/components/NativeDisclosure";

type ShopFilterGroupProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function ShopFilterGroup({
  title,
  defaultOpen = false,
  children,
}: ShopFilterGroupProps) {
  return (
    <div className="border-b border-line">
      <NativeDisclosure title={title} defaultOpen={defaultOpen}>
        <div className="flex flex-col gap-3">{children}</div>
      </NativeDisclosure>
    </div>
  );
}
