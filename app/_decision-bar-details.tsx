"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { bindDetailsExpanded } from "../lib/details-expanded.mjs";

export function DecisionBarDetails({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = ref.current;
    if (!details) return undefined;
    return bindDetailsExpanded(details);
  }, []);

  return (
    <details ref={ref} className="decision-bar-compact">
      {children}
    </details>
  );
}
