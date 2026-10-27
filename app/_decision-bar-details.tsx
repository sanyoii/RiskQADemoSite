"use client";

import type { ReactNode } from "react";

export function DecisionBarDetails({ children }: { children: ReactNode }) {
  return (
    <details
      className="decision-bar-compact"
      onToggle={(event) => {
        const details = event.currentTarget;
        details.querySelector("summary")?.setAttribute("aria-expanded", details.open ? "true" : "false");
      }}
    >
      {children}
    </details>
  );
}
