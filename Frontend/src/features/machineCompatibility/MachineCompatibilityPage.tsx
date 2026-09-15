import { type ShopProduct } from "@/constants/shopCatalog";
import { MachineBeginnerGuide } from "@/features/machineCompatibility/MachineBeginnerGuide";
import { MachineCompatFaq } from "@/features/machineCompatibility/MachineCompatFaq";
import { MachineCompatScrollMotion } from "@/features/machineCompatibility/MachineCompatScrollMotion";
import { MachineFinderController } from "@/features/machineCompatibility/MachineFinderController";
import { MachineFindModelGuide } from "@/features/machineCompatibility/MachineFindModelGuide";
import { MachineFormatExplainer } from "@/features/machineCompatibility/MachineFormatExplainer";
import { MachineSeoContent } from "@/features/machineCompatibility/MachineSeoContent";
import { MachineStillNotSure } from "@/features/machineCompatibility/MachineStillNotSure";

type MachineCompatibilityPageProps = {
  locale: string;
  products: readonly ShopProduct[];
};

export function MachineCompatibilityPage({
  locale,
  products,
}: MachineCompatibilityPageProps) {
  return (
    <MachineCompatScrollMotion>
      <MachineFinderController
        locale={locale}
        products={products}
        afterHero={<MachineFormatExplainer />}
        mid={
          <>
            <MachineFindModelGuide />
            <MachineBeginnerGuide locale={locale} />
            <MachineStillNotSure locale={locale} />
            <MachineCompatFaq />
            <MachineSeoContent />
          </>
        }
      />
    </MachineCompatScrollMotion>
  );
}
