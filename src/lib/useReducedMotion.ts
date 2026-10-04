"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

// prefers-reduced-motion for JS, matching the `reduced:` CSS variant. A
// MotionOverride provider forces it either way (with a matching data-motion
// attribute on an element for the CSS), so /dev/reveal can simulate it.

const QUERY = "(prefers-reduced-motion: reduce)";

export const MotionOverride = createContext<boolean | null>(null);

const subscribe = (onChange: () => void) => {
  const list = matchMedia(QUERY);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
};

export function useReducedMotion() {
  const override = useContext(MotionOverride);
  const system = useSyncExternalStore(
    subscribe,
    () => matchMedia(QUERY).matches,
    () => false,
  );
  return override ?? system;
}
