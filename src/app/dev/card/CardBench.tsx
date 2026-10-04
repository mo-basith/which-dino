"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Card } from "@/components/card/Card";
import { DINO_LIST, DINOS, type DinoId } from "@/data/dinos";
import { QUIZ } from "@/data/quiz";
import { backRows } from "@/lib/card";
import { score } from "@/lib/scoring";

// A fixed date so server and client format the same string.
const HATCHED = new Date(2026, 9, 3);
const SCALE_ROW: DinoId[] = ["trex", "mosasaurus"];
const SCALE_WIDTHS = [104, 240, 288];
const NONE = -1;

function Label({ children }: { children: ReactNode }) {
  return <p className="font-mono text-label text-text-3 uppercase">{children}</p>;
}

/** Card faces whose content pushes the footer past the bottom padding (where the face clips it). */
function measureOverflow() {
  return [...document.querySelectorAll<HTMLElement>("[data-bench-card]")].flatMap((card) =>
    [...card.querySelectorAll<HTMLElement>("[data-card-body]")]
      .filter((body) => {
        // Fractional rects (offsetTop/Height round), scaled back to design px.
        const footer = body.querySelector<HTMLElement>("[data-card-footer]");
        if (!footer) return false;
        const box = body.getBoundingClientRect();
        const k = box.height / body.offsetHeight;
        const bottom = box.bottom - parseFloat(getComputedStyle(body).paddingBottom) * k;
        return footer.getBoundingClientRect().bottom > bottom + 0.5;
      })
      .map((body) => {
        const side = body.parentElement?.classList.contains("card-face-back") ? "back" : "front";
        return `${card.dataset.benchCard} ${side}`;
      }),
  );
}

function useOverflowing(key: string) {
  const [overflowing, setOverflowing] = useState<string[]>([]);
  useEffect(() => {
    let live = true;
    // Measure once the card fonts are in (and again if more load), or the widths are wrong.
    const measure = () => live && setOverflowing([...new Set(measureOverflow())]);
    document.fonts.ready.then(measure);
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      live = false;
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, [key]);
  return overflowing;
}

export function CardBench() {
  const [holder, setHolder] = useState(true);
  const [answers, setAnswers] = useState<number[]>(QUIZ.map(() => NONE));

  // Answers count up to the first unanswered question, as in the quiz.
  const firstGap = answers.indexOf(NONE);
  const given = firstGap === NONE ? answers : answers.slice(0, firstGap);
  const winner = given.length > 0 ? score(given).winner : null;
  const overflowing = useOverflowing(`${given.join()}|${holder}`);

  const pick = (q: number, a: number) => setAnswers((prev) => prev.map((v, i) => (i === q ? a : v)));
  const cardProps = (id: DinoId) => ({
    dinoId: id,
    rows: backRows(id, given),
    holder: holder ? "Sam" : undefined,
    hatchedAt: HATCHED,
  });

  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-12 px-gutter py-16">
      <header className="flex flex-col gap-2">
        <Label>System G · dev</Label>
        <h1 className="text-title">Card</h1>
      </header>

      <section className="flex flex-col gap-4 rounded-control border border-line bg-raised-1 p-4">
        <label className="flex items-center gap-2 text-small">
          <input type="checkbox" checked={holder} onChange={(e) => setHolder(e.target.checked)} />
          Holder name (“Sam”)
        </label>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUIZ.map((question, q) => (
            <label key={question.id} className="flex flex-col gap-1 text-small text-text-2">
              {q + 1}. {question.prompt}
              <select
                className="h-10 rounded-control border border-line bg-raised-2 px-2 text-text"
                value={answers[q]}
                onChange={(e) => pick(q, Number(e.target.value))}
              >
                <option value={NONE}>—</option>
                {question.answers.map((answer, a) => (
                  <option key={a} value={a}>
                    {"abcd"[a]}. {answer.cardLine} ({answer.scores.join(" + ")})
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <p className="font-mono text-label text-text-2 uppercase">
          {winner ? `Winner: ${DINOS[winner].name} · ${given.length} answered` : "No answers: backs show README stats"}
        </p>
        <p className="font-mono text-label text-text-2 uppercase">
          {overflowing.length ? `Overflowing: ${overflowing.join(", ")}` : "No card text overflows"}
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <Label>Static · 104 / 240 / 288</Label>
        {SCALE_ROW.map((id) => (
          <div key={id} className="flex flex-wrap items-end gap-6">
            {SCALE_WIDTHS.map((width) => (
              <div key={width} className="flex items-end gap-2">
                <Card {...cardProps(id)} mode="static" width={width} />
                <Card {...cardProps(id)} mode="static" side="back" width={width} />
              </div>
            ))}
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <Label>Interactive · 280 · tap to flip</Label>
        <div className="grid gap-x-6 gap-y-12 xl:grid-cols-2">
          {DINO_LIST.map((dino) => (
            <div key={dino.id} data-bench-card={dino.id} className="flex flex-col gap-3">
              <Label>
                {dino.number} · {dino.name} · {dino.rarity}
              </Label>
              <div className="flex flex-wrap gap-6">
                <Card {...cardProps(dino.id)} mode="interactive" />
                <Card {...cardProps(dino.id)} mode="interactive" side="back" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
