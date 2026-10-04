"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

// A home page section that fades and rises in, once, as it scrolls into view.
// Whether it's already in view is decided once, at mount: anything visible on
// first paint (including after a refresh mid-page or a jump to #herd) never
// animates, and nothing is hidden in the server HTML, so nothing flashes. A
// section that has come in never hides again. Reduced motion: just there.

// After a reload or back/forward the browser may restore the scroll position
// after we mount, so we can't tell what was on screen: show everything.
const restoringScroll = () => {
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return nav?.type === "reload" || nav?.type === "back_forward";
};

type SectionRevealProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  /** A target of the top bar's links: focusable from script, not by Tab. */
  focusable?: boolean;
};

export function SectionReveal({ children, className = "", id, focusable }: SectionRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    // matchMedia too: during hydration the hook still reports the server's answer.
    if (!el || reduced || matchMedia("(prefers-reduced-motion: reduce)").matches || restoringScroll()) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return; // on screen at first paint
    el.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.reveal = "in";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // Decided once, at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      tabIndex={focusable ? -1 : undefined}
      className={`section-reveal outline-none ${className}`}
    >
      {children}
    </section>
  );
}
