import type { ReactNode } from "react";
import { Card } from "@/components/card/Card";
import { FlippableCard } from "@/components/card/FlipPill";
import { HerdSlot, HerdTile } from "@/components/herd/Herd";
import { AnswerRow } from "@/components/quiz/AnswerRow";
import { CardFan, FaceDownCard } from "@/components/quiz/CardFan";
import { Brand } from "@/components/quiz/parts";
import { EnterToStart, StartButton } from "@/components/quiz/QuizStart";
import { Sprite } from "@/components/Sprite";
import { DINO_LIST, type DinoId } from "@/data/dinos";
import type { CardRow } from "@/lib/card";
import { ScrollLink } from "./ScrollLink";
import { SectionReveal } from "./SectionReveal";

// The home page: the quiz's first-visit state on "/". Server-rendered; the
// only client pieces are the Start buttons and Enter (through the quiz's own
// start()), the in-page links, the section reveal and the phone's flippable
// sample card. Copy is as in reference/design/screens/home-*.png: where the
// two differ, the desktop wording shows from 768px up.

/** Content width: 1200 centred, with the phone gutter outside it. */
const CONTAINER = "mx-auto box-content w-auto max-w-wide px-gutter";
const EYEBROW = "font-mono text-label text-text-3 uppercase";

export function HomePage() {
  return (
    // Block layout (not flex), so each section's auto margins centre it at full width.
    <div>
      <EnterToStart />
      <HomeTopBar />
      <Hero />
      <HowItWorks />
      <TheHerd />
      <CardBack />
      <Closing />
      <Footer />
    </div>
  );
}

function HomeTopBar() {
  return (
    <header className="mt-6 flex h-9 items-center justify-between px-gutter md:mt-0 md:h-16 md:border-b md:border-line md:px-10">
      <Brand />
      <nav aria-label="Home" className="hidden items-center gap-6 md:flex">
        <ScrollLink to="how" className="text-small text-text-2 transition-colors hover:text-text">
          How it works
        </ScrollLink>
        <ScrollLink to="herd" className="text-small text-text-2 transition-colors hover:text-text">
          The herd
        </ScrollLink>
        <StartButton look="small" className="ml-2" />
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative border-b border-line pb-16 lg:border-0 lg:pb-0">
      <div
        aria-hidden
        className="bg-glow pointer-events-none absolute top-0 left-1/2 -z-10 h-[480px] w-[640px] -translate-x-1/2 -translate-y-1/4 [--glow-alpha:0.14] lg:top-1/2 lg:left-3/4 lg:h-[720px] lg:w-[900px] lg:-translate-y-1/2"
      />
      <div className={`${CONTAINER} flex flex-col lg:grid lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-2 lg:items-center`}>
        <CardFan className="mx-auto mt-12 [--face-k:0.5357] [--fan-rot:9deg] [--fan-x:0.41] lg:order-2 lg:mt-0 lg:[--face-k:0.857] lg:[--fan-rot:10deg] lg:[--fan-x:0.52]" />
        <div className="mt-24 lg:mt-0">
          <p className={EYEBROW}>
            A personality quiz · 10 dinos<span className="hidden md:inline"> to collect</span>
          </p>
          <h1 className="mt-4 text-hero">
            Which dino <br />
            are you?
          </h1>
          <p className="mt-6 max-w-column text-body text-text-2 lg:text-lead">
            Six questions, one holographic card. Collect the other nine from friends.
          </p>
          <div className="mt-10 flex items-center gap-5">
            <StartButton className="lg:w-auto lg:px-7" />
            <p className="hidden shrink-0 items-center gap-2 font-mono text-label text-text-3 lg:can-hover:flex">
              or press
              <kbd className="grid h-6 place-items-center rounded-key border border-line-strong px-1.5 font-mono text-label text-text-2">
                Enter
              </kbd>
            </p>
          </div>
          <p className={`mt-4 flex justify-between lg:mt-10 lg:justify-start lg:gap-2 ${EYEBROW}`}>
            <span>About a minute</span>
            <span aria-hidden className="hidden lg:inline">
              ·
            </span>
            <span>No sign-up</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/** A section's eyebrow and heading (and optional line under it). */
function SectionHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div>
      <p className={EYEBROW}>{eyebrow}</p>
      <h2 className="mt-3 text-section text-pretty">{title}</h2>
      {children && <p className="mt-4 max-w-column text-body text-text-2 lg:text-lead">{children}</p>}
    </div>
  );
}

const SECTION = "py-16 md:py-20";

const STEP_ROWS = [
  { text: "Still asleep. Obviously.", state: "rest" },
  { text: "On my third plan", state: "picked" },
  { text: "At brunch", state: "dimmed" },
  { text: "Nobody can find me", state: "dimmed" },
] as const;

const HERD_ORDER = DINO_LIST.map((dino) => dino.id);
const SAMPLE_FOUND: DinoId[] = ["trex", "velociraptor", "mosasaurus"];

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Six quick questions",
      line: <>Saturday mornings, snacks, group chats. No right answers.</>,
      art: (
        <div className="flex w-[260px] flex-col gap-2">
          {STEP_ROWS.map((row, i) => (
            <AnswerRow key={row.text} index={i} text={row.text} state={row.state} size="small" />
          ))}
        </div>
      ),
    },
    {
      n: "02",
      title: "One holographic card",
      line: <>The herd shuffles, your card lands and flips. Three of the ten are rare.</>,
      art: <FaceDownCard id="velociraptor" className="[--face-k:0.4] md:[--face-k:0.47]" />,
    },
    {
      n: "03",
      title: "Build your herd",
      line: (
        <>
          Share your card. Every friend who sends theirs back adds a dino<span className="hidden md:inline"> to your binder</span>.
        </>
      ),
      art: (
        <div className="w-[300px] max-w-full">
          <div className={`flex justify-between ${EYEBROW}`}>
            <span>Your herd</span>
            <span>3 / 10</span>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {HERD_ORDER.map((id) => (
              <HerdSlot key={id} id={id} found={SAMPLE_FOUND.includes(id)} />
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <SectionReveal id="how" focusable className={`${CONTAINER} ${SECTION} scroll-mt-4`}>
      <SectionHead eyebrow="How it works" title="Three steps, about a minute." />
      <ol className="mt-8 grid gap-12 md:mt-12 md:grid-cols-3 md:gap-8">
        {steps.map((step) => (
          <li key={step.n}>
            <div
              aria-hidden
              className="grid h-[200px] place-items-center overflow-hidden rounded-card border border-line bg-raised-1 px-4 md:h-[240px]"
            >
              {step.art}
            </div>
            <p className="mt-6 font-mono text-label text-text-3">{step.n}</p>
            <h3 className="mt-2 text-heading">{step.title}</h3>
            <p className="mt-2 text-body text-text-2">{step.line}</p>
          </li>
        ))}
      </ol>
    </SectionReveal>
  );
}

function TheHerd() {
  return (
    <SectionReveal id="herd" focusable className={`${CONTAINER} ${SECTION} scroll-mt-4`}>
      <SectionHead eyebrow="The herd" title="Ten dinos. Which one is you?">
        <span className="md:hidden">Seven commons, three rares.</span>
        <span className="hidden md:inline">Seven commons and three rares. You get one from the quiz; friends bring the rest.</span>
      </SectionHead>
      {/* "0 / 10 found" joins the heading in step 5, with the herd. */}
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:mt-12 lg:grid-cols-5">
        {DINO_LIST.map((dino) => (
          <li key={dino.id}>
            <HerdTile dino={dino} found={false} />
          </li>
        ))}
      </ul>
    </SectionReveal>
  );
}

// The sample card: a T-rex with the reference's back rows and holder.
const SAMPLE_ROWS: CardRow[] = [
  { label: "40 voice notes", value: 94 },
  { label: "Said it loudly", value: 91 },
  { label: "Main-character energy", value: 99 },
];
// Noon UTC, so it prints 03.10.26 in any time zone, on the server and the client alike.
const SAMPLE_HATCHED = new Date(Date.UTC(2026, 9, 3, 12));
const SAMPLE = { dinoId: "trex", rows: SAMPLE_ROWS, holder: "Sam", hatchedAt: SAMPLE_HATCHED } as const;

function CardBack() {
  return (
    <SectionReveal className={`${CONTAINER} ${SECTION} lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16`}>
      <SectionHead eyebrow="Every card has a back" title="Your answers become your stats.">
        <span className="md:hidden">Three stats from what you picked, who to herd with, who to avoid, and one real fact.</span>
        <span className="hidden md:inline">
          Flip it over: three stats from what you picked, who to herd with, who to avoid at brunch, and one real fact.
        </span>
      </SectionHead>
      {/* Phones and tablets: one card showing its back, and the pill. Desktop: both sides, still. */}
      <div className="mt-10 flex justify-center lg:hidden">
        <FlippableCard {...SAMPLE} width="interactive" side="back" labels={{ front: "Show back", back: "Show front" }} />
      </div>
      <div className="hidden gap-8 lg:flex">
        <Card {...SAMPLE} mode="static" side="front" />
        <Card {...SAMPLE} mode="static" side="back" />
      </div>
    </SectionReveal>
  );
}

function Closing() {
  return (
    <SectionReveal className="relative py-24 md:py-32">
      <div
        aria-hidden
        className="bg-glow pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[480px] w-[720px] max-w-full -translate-x-1/2 -translate-y-1/2 [--glow-alpha:0.12]"
      />
      <div className={`${CONTAINER} flex flex-col items-center text-center`}>
        <Sprite id="trex" size={{ scale: 4 }} />
        <h2 className="mt-8 text-title md:text-display">Ready to find out?</h2>
        <StartButton className="mt-8 md:w-auto md:px-7" />
      </div>
    </SectionReveal>
  );
}

function Footer() {
  return (
    <footer className="flex flex-col gap-3 border-t border-line px-gutter py-8 md:flex-row md:items-center md:justify-between md:px-10">
      <p className="flex items-center gap-3 text-small text-text-2">
        <Sprite id="chicken" size={{ scale: 1 }} silhouette color="var(--color-text-3)" />
        <span>
          A side project by{" "}
          <a
            href="https://mobasith.com"
            className="text-text underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-text"
          >
            Nino
          </a>
        </span>
      </p>
      <p className={EYEBROW}>Series 01 · 10 dinos</p>
    </footer>
  );
}
