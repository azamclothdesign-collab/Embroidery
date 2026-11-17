import Link from "next/link";
import { StitchLine } from "@/features/store/components/StitchLine";

/** Rendered inside the locale layout; text is bilingual because params are not available here. */
export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="text-7xl font-semibold text-saffron-strong">404</p>
      <StitchLine className="mt-2" />
      <h1 className="mt-6 text-3xl">Page not found · صفحہ نہیں ملا</h1>
      <p className="mt-3 max-w-md text-ink-soft">The page you are looking for does not exist or has moved.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/en" className="btn btn-primary">
          Home
        </Link>
        <Link href="/ur" className="btn btn-outline" lang="ur">
          ہوم
        </Link>
      </div>
    </div>
  );
}
