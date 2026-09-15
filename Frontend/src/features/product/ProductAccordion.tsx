import { type ReactNode } from "react";

import { NativeDisclosure } from "@/components/NativeDisclosure";

type ProductAccordionItem = {
  title: string;
  content: ReactNode;
};

type ProductAccordionProps = {
  items: readonly ProductAccordionItem[];
};

export function ProductAccordion({ items }: ProductAccordionProps) {
  return (
    <div className="mx-auto w-full max-w-[85rem] border-b border-line px-6">
      {items.map((item, index) => (
        <NativeDisclosure
          key={item.title}
          title={item.title}
          defaultOpen={index === 0}
        >
          {item.content}
        </NativeDisclosure>
      ))}
    </div>
  );
}
