import type { ComponentProps, ReactNode } from "react";
import { Sprite } from "@/components/Sprite";
import type { DinoId } from "@/data/dinos";

// Small shared pieces of the quiz screens.

/** Top bar: 36px tall, 24px from the top. Slots stay in place even when empty. */
export function TopBar({ left, center, right }: { left: ReactNode; center?: ReactNode; right?: ReactNode }) {
  return (
    <header className="mt-6 grid h-9 grid-cols-[1fr_auto_1fr] items-center">
      <div className="flex items-center justify-self-start">{left}</div>
      <div className="justify-self-center">{center}</div>
      {/* Reserved for the mute button (sound comes in its own step). */}
      <div className="flex items-center justify-self-end">{right ?? <span className="size-9" aria-hidden />}</div>
    </header>
  );
}

export function Brand({ mark = "trex" }: { mark?: DinoId }) {
  return (
    <div className="flex items-center gap-2">
      <Sprite id={mark} size={{ scale: 1 }} />
      <span className="text-small font-medium">Which Dino?</span>
    </div>
  );
}

/** A small icon button: draws at 36px, with a 44px hit area. */
export function IconButton({ label, className = "", children, ...props }: ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`press holo-ring grid size-9 place-items-center rounded-icon border border-line bg-raised-1 text-text-2 [--ring-radius:var(--radius-icon)] before:absolute before:-inset-1 before:content-[''] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="m2.5 6.25 2.25 2.25L9.5 3.75" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The primary button's look, for links that act as one. One primary per screen. */
export const PRIMARY = "press holo-ring grid h-12 w-full place-items-center rounded-control bg-text text-body font-medium text-ground";

export function PrimaryButton({ className = "", ...props }: ComponentProps<"button">) {
  return <button type="button" className={`${PRIMARY} ${className}`} {...props} />;
}

/** A holo hairline chip ("NEW", "RARE · NEW"). */
export function HoloChip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`holo-hairline inline-flex h-8 items-center rounded-full px-3 font-mono text-label text-text uppercase ${className}`}>
      {children}
    </p>
  );
}

/** "02" style counters. */
export const pad2 = (n: number) => String(n).padStart(2, "0");
