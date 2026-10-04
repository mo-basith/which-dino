"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

// An in-page link (#how, #herd): scrolls there, smoothly unless reduced motion
// asks otherwise, without adding a history entry (the quiz owns history).
export function ScrollLink({ to, className = "", children }: { to: string; className?: string; children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(event) => {
        const target = document.getElementById(to);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
        // Keyboard users carry on from there.
        target.focus({ preventScroll: true });
      }}
    >
      {children}
    </a>
  );
}
