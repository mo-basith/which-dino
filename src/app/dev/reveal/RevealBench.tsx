"use client";

import { useEffect, useRef, useState } from "react";
import { ResultScreen } from "@/components/result/ResultScreen";
import { DINO_LIST, DINOS, type DinoId } from "@/data/dinos";
import { backRows } from "@/lib/card";
import { TIMING, type TempoId } from "@/lib/motion";
import { TEMPO_IDS, frontOnStage, reducedSchedule, revealSchedule } from "@/lib/reveal";
import { MotionOverride } from "@/lib/useReducedMotion";

// A fixed date so server and client format the same string.
const HATCHED = new Date(2026, 9, 3);
// Bench only (not product motion): the pause between loops.
const LOOP_GAP = 1200;

type Motion = "system" | "reduced" | "full";

type BenchProps = { initialDino: DinoId; initialTempo: TempoId; bare: boolean };

export function RevealBench({ initialDino, initialTempo, bare }: BenchProps) {
  const [dinoId, setDinoId] = useState<DinoId>(initialDino);
  const [tempoId, setTempoId] = useState<TempoId>(initialTempo);
  const [motion, setMotion] = useState<Motion>("system");
  const [loop, setLoop] = useState(!bare);
  const [run, setRun] = useState(0);
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const replay = () => {
    window.clearTimeout(timer.current);
    setRun((n) => n + 1);
  };
  const onSettled = () => {
    if (loop) timer.current = window.setTimeout(replay, LOOP_GAP);
  };

  const override = motion === "system" ? null : motion === "reduced";
  const tempo = TIMING.reveal[tempoId];
  const s = revealSchedule(DINOS[dinoId].rarity === "rare", tempo);
  const r = reducedSchedule(tempo);

  return (
    <MotionOverride value={override}>
      <div data-motion={motion === "system" ? undefined : motion} className="overflow-x-clip">
        <main className="relative isolate mx-auto flex min-h-dvh w-full max-w-column flex-col px-gutter desk:max-w-wide">
          <ResultScreen
            key={`${dinoId}-${motion}-${tempoId}-${run}`}
            dinoId={dinoId}
            rows={backRows(dinoId)}
            hatchedAt={HATCHED}
            reveal
            tempo={tempoId}
            onRetake={replay}
            onSettled={onSettled}
          />
        </main>
        <details
          open
          hidden={bare}
          className="fixed right-4 bottom-4 z-10 w-[248px] rounded-control border border-line bg-raised-1 p-4 text-small [&[open]>summary]:mb-3"
        >
          <summary className="cursor-pointer font-mono text-label text-text-2 uppercase">Reveal · dev</summary>
          <div className="flex flex-col gap-3">
            <select
              className="h-10 rounded-control border border-line bg-raised-2 px-2"
              value={dinoId}
              onChange={(e) => setDinoId(e.target.value as DinoId)}
            >
              {DINO_LIST.map((dino) => (
                <option key={dino.id} value={dino.id}>
                  {dino.number} · {dino.name} ({dino.rarity})
                </option>
              ))}
            </select>
            <div className="grid grid-cols-3 gap-1" role="group" aria-label="Tempo">
              {TEMPO_IDS.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tempoId === t}
                  onClick={() => setTempoId(t)}
                  className={`h-8 rounded-key border text-label uppercase ${tempoId === t ? "border-line-selected bg-raised-2" : "border-line"}`}
                >
                  {t}
                  {t === TIMING.revealTempo ? " ·" : ""}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1" role="group" aria-label="Reduced motion">
              {(["system", "reduced", "full"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={motion === m}
                  onClick={() => setMotion(m)}
                  className={`h-8 rounded-key border text-label ${motion === m ? "border-line-selected bg-raised-2" : "border-line"}`}
                >
                  {m === "system" ? "OS" : m === "reduced" ? "Reduced" : "Full"}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
              Loop
            </label>
            <button type="button" onClick={replay} className="press h-10 rounded-control bg-text font-medium text-ground">
              Replay
            </button>
            <p className="font-mono text-label leading-relaxed text-text-2">
              shuffle {s.shuffle[0]} · land {s.land}
              <br />
              flip {s.flip} · flash {s.flash}
              <br />
              hold {s.hold} · dock {s.dock}
              <br />
              settle {s.settle} · done {s.done}
              <br />
              front on stage {frontOnStage(tempo)}
              <br />
              reduced: done {r.done}
            </p>
          </div>
        </details>
      </div>
    </MotionOverride>
  );
}
