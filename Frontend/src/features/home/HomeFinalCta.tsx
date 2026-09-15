import { HomeFinalCtaStage } from "@/features/home/HomeFinalCtaStage";
import { finalCtaVideoFileExists } from "@/lib/finalCtaVideoFile";

type HomeFinalCtaProps = {
  locale: string;
};

export function HomeFinalCta({ locale }: HomeFinalCtaProps) {
  return (
    <HomeFinalCtaStage
      locale={locale}
      hasVideo={finalCtaVideoFileExists()}
    />
  );
}
