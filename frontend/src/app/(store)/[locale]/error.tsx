"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex flex-col items-center py-24 text-center" role="alert">
      <h1 className="text-3xl">Something went wrong · کچھ غلط ہو گیا</h1>
      <p className="mt-3 max-w-md text-ink-soft">Please try again in a moment. If it keeps happening, contact us.</p>
      {error.digest !== undefined && <p className="mt-2 text-xs text-muted">Ref: {error.digest}</p>}
      <button type="button" onClick={reset} className="btn btn-primary mt-8">
        <RotateCcw className="size-4" aria-hidden />
        Try again
      </button>
    </div>
  );
}
