"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@/components/quiz/parts";
import type { DinoId } from "@/data/dinos";
import { TIMING } from "@/lib/motion";
import { SHARE_TITLE, cardPath, shareText } from "@/lib/share";

// "Share card" (the system share sheet, or copy the message and link) and a
// "Copy link" icon button. Each shows a check for TIMING.copiedHold after
// copying. Step 6 adds the share sheet, signature and image.

type Copied = "share" | "link" | null;

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ShareActions({ dinoId }: { dinoId: DinoId }) {
  const [copied, setCopied] = useState<Copied>(null);
  const timer = useRef<number>(undefined);
  // Synchronous lock: the share sheet is async, so a second tap mustn't open another.
  const sharing = useRef(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const url = () => new URL(cardPath(dinoId), window.location.origin).href;

  const confirm = (which: Copied) => {
    window.clearTimeout(timer.current);
    setCopied(which);
    timer.current = window.setTimeout(() => setCopied(null), TIMING.copiedHold);
  };

  const share = async () => {
    if (sharing.current) return;
    sharing.current = true;
    const data = { title: SHARE_TITLE, text: shareText(dinoId), url: url() };
    try {
      if (typeof navigator.share === "function") {
        try {
          await navigator.share(data);
          return;
        } catch (error) {
          // Cancelled: do nothing. Anything else (not allowed here): copy instead.
          if (error instanceof DOMException && error.name === "AbortError") return;
        }
      }
      if (await copy(`${data.text} ${data.url}`)) confirm("share");
    } finally {
      sharing.current = false;
    }
  };

  const copyLink = async () => {
    if (await copy(url())) confirm("link");
  };

  return (
    <div className="flex w-full gap-2">
      <button
        type="button"
        onClick={share}
        className="press holo-ring grid h-12 flex-1 place-items-center rounded-control bg-text text-body font-medium text-ground"
      >
        <span className={`fade col-start-1 row-start-1 ${copied === "share" ? "opacity-0" : "opacity-100"}`}>Share card</span>
        <span
          aria-hidden={copied !== "share"}
          className={`fade col-start-1 row-start-1 flex items-center gap-2 ${copied === "share" ? "opacity-100" : "opacity-0"}`}
        >
          <CheckIcon size={16} />
          Link copied
        </span>
      </button>
      <button
        type="button"
        onClick={copyLink}
        aria-label={copied === "link" ? "Link copied" : "Copy link"}
        className="press holo-ring grid size-12 shrink-0 place-items-center rounded-control border border-line bg-raised-1 text-text-2"
      >
        <span className={`fade col-start-1 row-start-1 ${copied === "link" ? "opacity-0" : "opacity-100"}`}>
          <LinkIcon />
        </span>
        <span className={`fade col-start-1 row-start-1 text-text ${copied === "link" ? "opacity-100" : "opacity-0"}`}>
          <CheckIcon size={16} />
        </span>
      </button>
      <p className="sr-only" role="status">
        {copied ? "Link copied" : ""}
      </p>
    </div>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6.75 9.25a2.75 2.75 0 0 0 3.9 0l2.1-2.1a2.75 2.75 0 0 0-3.9-3.9l-.6.6M9.25 6.75a2.75 2.75 0 0 0-3.9 0l-2.1 2.1a2.75 2.75 0 0 0 3.9 3.9l.6-.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
