import { redirect } from "next/navigation";

type MachineCompatibilityRouteProps = {
  params: Promise<{ locale: string }>;
};

export default async function MachineCompatibilityRoute({
  params,
}: MachineCompatibilityRouteProps) {
  const { locale } = await params;
  redirect(`/${locale}/designs`);
}
