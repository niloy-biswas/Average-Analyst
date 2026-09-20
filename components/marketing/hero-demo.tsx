"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Check,
  Code2,
  FileText,
  LayoutList,
  LineChart as LineChartIcon,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import {
  HERO_ANSWER,
  HERO_CHART_DATA,
  HERO_CONTEXT_STEPS,
  HERO_DEMO_QUESTION,
  HERO_LIVE_REPLY,
} from "@/components/marketing/demo-data";
import { usePrefersReducedMotion } from "@/components/marketing/use-reduced-motion";
import { BRAND, contactMailto } from "@/lib/brand";
import { cn } from "@/lib/utils";

type DemoTab = "answer" | "chart" | "sql" | "context";
type Stage = "idle" | "question" | "context" | "result";

const DEMO_TAB_ITEMS: Array<{
  id: DemoTab;
  label: string;
  icon: LucideIcon;
  dwellMs: number;
}> = [
  { id: "answer", label: "Answer", icon: FileText, dwellMs: 4500 },
  { id: "chart", label: "Chart", icon: LineChartIcon, dwellMs: 5500 },
  { id: "sql", label: "SQL", icon: Code2, dwellMs: 5000 },
  { id: "context", label: "Context", icon: LayoutList, dwellMs: 4000 },
];

function useTypewriter(text: string, reduced: boolean, charsPerSec = 48) {
  const [out, setOut] = useState("");

  useEffect(() => {
    if (reduced) {
      setOut(text);
      return;
    }
    setOut("");
    let i = 0;
    const stepMs = Math.max(12, Math.round(1000 / charsPerSec));
    const id = window.setInterval(() => {
      i += 1;
      if (i >= text.length) {
        setOut(text);
        window.clearInterval(id);
        return;
      }
      setOut(text.slice(0, i));
    }, stepMs);
    return () => window.clearInterval(id);
  }, [text, reduced, charsPerSec]);

  return out;
}

function StreamingText({
  text,
  reduced,
  charsPerSec = 48,
  className,
  as: Tag = "p",
}: {
  text: string;
  reduced: boolean;
  charsPerSec?: number;
  className?: string;
  as?: "p" | "pre" | "span";
}) {
  const out = useTypewriter(text, reduced, charsPerSec);
  const done = out.length >= text.length;

  return (
    <Tag className={className} aria-label={text}>
      {out}
      {!reduced && !done && (
        <span
          className="inline-block w-[0.5ch] h-[1em] align-[-0.1em] bg-primary/70 animate-pulse ml-0.5"
          aria-hidden
        />
      )}
    </Tag>
  );
}

function ContextTagsStream({ tags, reduced }: { tags: readonly string[]; reduced: boolean }) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (reduced) {
      setVisible(tags.length);
      return;
    }
    setVisible(0);
    const timers = tags.map((_, i) =>
      window.setTimeout(() => setVisible(i + 1), 280 + i * 520)
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [reduced, tags]);

  return (
    <ul className="h-full space-y-2 overflow-auto">
      {tags.slice(0, visible).map((tag) => (
        <motion.li
          key={tag}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-xs rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-foreground/90"
        >
          {tag}
        </motion.li>
      ))}
    </ul>
  );
}

export function HeroDemo() {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const liveEndRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [contextDone, setContextDone] = useState(0);
  const [tab, setTab] = useState<DemoTab>("answer");
  const [metric, setMetric] = useState(0);
  const [chartReady, setChartReady] = useState(false);
  const [draft, setDraft] = useState("");
  const [liveUserMessage, setLiveUserMessage] = useState<string | null>(null);

  const activeTab = DEMO_TAB_ITEMS.find((t) => t.id === tab) ?? DEMO_TAB_ITEMS[0];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    if (reduced) {
      setStage("result");
      setContextDone(HERO_CONTEXT_STEPS.length);
      setMetric(HERO_ANSWER.metricValue);
      setChartReady(true);
      setTab("answer");
      return;
    }

    let cancelled = false;
    const timers: number[] = [];

    setStage("idle");
    setContextDone(0);
    setMetric(0);
    setChartReady(false);
    setTab("answer");

    timers.push(
      window.setTimeout(() => {
        if (!cancelled) setStage("question");
      }, 120)
    );

    timers.push(
      window.setTimeout(() => {
        if (!cancelled) setStage("context");
      }, 700)
    );

    HERO_CONTEXT_STEPS.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) setContextDone(i + 1);
        }, 950 + i * 380)
      );
    });

    const resultAt = 950 + HERO_CONTEXT_STEPS.length * 380 + 200;
    timers.push(
      window.setTimeout(() => {
        if (cancelled) return;
        setStage("result");
        setChartReady(true);
      }, resultAt)
    );

    timers.push(
      window.setTimeout(() => {
        if (cancelled) return;
        const target = HERO_ANSWER.metricValue;
        const start = performance.now();
        const duration = 900;
        const tick = (now: number) => {
          if (cancelled) return;
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setMetric(Number((target * eased).toFixed(2)));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, resultAt + 50)
    );

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [inView, reduced]);

  useEffect(() => {
    if (!liveUserMessage) return;
    liveEndRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "nearest",
    });
  }, [liveUserMessage, reduced]);

  useEffect(() => {
    if (stage !== "result" || !inView) return;

    const timer = window.setTimeout(() => {
      setTab((current) => {
        const i = DEMO_TAB_ITEMS.findIndex((t) => t.id === current);
        return DEMO_TAB_ITEMS[(i + 1) % DEMO_TAB_ITEMS.length].id;
      });
    }, activeTab.dwellMs);

    return () => window.clearTimeout(timer);
  }, [stage, tab, inView, activeTab.dwellMs]);

  const sendLiveMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setLiveUserMessage(text);
    setDraft("");
  };

  return (
    <div
      ref={rootRef}
      className="relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl"
      aria-label="Product demonstration of Average Analyst answering a revenue question"
    >
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent pointer-events-none" />

      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/20">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="ml-2 text-xs text-muted-foreground font-mono truncate">
          Revenue · Published
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-4 min-h-[420px] sm:min-h-[460px]">
        <AnimatePresence>
          {(stage === "question" || stage === "context" || stage === "result") && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex justify-end"
            >
              <div className="max-w-[90%] rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5 text-sm leading-relaxed">
                {HERO_DEMO_QUESTION}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(stage === "context" || stage === "result") && (
            <motion.ul
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              {HERO_CONTEXT_STEPS.map((step, i) => {
                const done = contextDone > i || stage === "result";
                const stepActive = contextDone === i && stage === "context";
                if (!done && !stepActive) return null;
                return (
                  <motion.li
                    key={step}
                    initial={reduced ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span
                      className={cn(
                        "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                        done
                          ? "border-primary/40 bg-primary/15 text-primary"
                          : "border-border"
                      )}
                    >
                      {done && <Check className="h-2.5 w-2.5" />}
                    </span>
                    {step}
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {stage === "result" && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-xl border border-border/60 bg-background/60 overflow-hidden"
            >
              <div className="px-3 sm:px-4 pt-3 flex flex-col gap-2">
                <p className="text-[11px] font-medium text-primary tracking-wide">
                  {HERO_ANSWER.foundLabel}
                </p>
                <div
                  className="flex items-end gap-4 overflow-x-auto border-b border-border/40"
                  role="tablist"
                  aria-label="Inspect answer"
                >
                  {DEMO_TAB_ITEMS.map((t) => {
                    const selected = tab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => setTab(t.id)}
                        className={cn(
                          "relative pb-2 inline-flex items-center gap-1.5 shrink-0 text-[11px] font-medium leading-none outline-none transition-colors",
                          selected
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <t.icon className="h-3 w-3 shrink-0" aria-hidden />
                        {t.label}
                        {selected && (
                          <motion.span
                            key={`${t.id}-progress`}
                            className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                            initial={{ scaleX: reduced ? 1 : 0 }}
                            animate={{ scaleX: 1 }}
                            transition={
                              reduced
                                ? { duration: 0 }
                                : { duration: t.dwellMs / 1000, ease: "linear" }
                            }
                            style={{ transformOrigin: "left center" }}
                            aria-hidden
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 sm:p-4 h-[13.5rem] sm:h-[15.5rem]" role="tabpanel">
                {tab === "answer" && (
                  <div className="h-full flex flex-col justify-center space-y-3">
                    <div className="flex flex-wrap items-end gap-3">
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                          {HERO_ANSWER.metricLabel}
                        </p>
                        <p className="text-2xl font-bold tabular-nums text-foreground">
                          ${metric.toFixed(2)}
                          {HERO_ANSWER.metricUnit}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-destructive tabular-nums pb-1">
                        {HERO_ANSWER.changePct}%
                      </p>
                    </div>
                    <StreamingText
                      text={`${HERO_ANSWER.headline} ${HERO_ANSWER.detail}`}
                      reduced={reduced}
                      charsPerSec={42}
                      className="text-sm text-foreground leading-relaxed"
                    />
                  </div>
                )}

                {tab === "chart" && (
                  <div className="h-full">
                    <div className="h-full w-full">
                      {chartReady && (
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={HERO_CHART_DATA}
                            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="var(--border)"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="week"
                              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "var(--popover)",
                                border: "1px solid var(--border)",
                                borderRadius: 8,
                                fontSize: 12,
                              }}
                            />
                            <ReferenceLine
                              x="W4"
                              stroke="var(--primary)"
                              strokeDasharray="4 4"
                              label={{
                                value: "Campaign end",
                                fill: "var(--muted-foreground)",
                                fontSize: 10,
                                position: "insideTopRight",
                              }}
                            />
                            <Bar
                              dataKey="enrolments"
                              fill="var(--chart-primary)"
                              opacity={0.35}
                              radius={[4, 4, 0, 0]}
                              isAnimationActive={!reduced}
                              animationDuration={900}
                            />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke="var(--primary)"
                              strokeWidth={2}
                              dot={false}
                              isAnimationActive={!reduced}
                              animationDuration={1100}
                            />
                            <Line
                              type="monotone"
                              dataKey="previous"
                              stroke="var(--muted-foreground)"
                              strokeWidth={1.5}
                              strokeDasharray="4 4"
                              dot={false}
                              isAnimationActive={!reduced}
                              animationDuration={1100}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    <p className="sr-only">
                      Combination chart of weekly revenue and enrolments with previous-period
                      comparison and a campaign-end annotation at week 4.
                    </p>
                  </div>
                )}

                {tab === "sql" && (
                  <StreamingText
                    as="pre"
                    text={HERO_ANSWER.sql}
                    reduced={reduced}
                    charsPerSec={72}
                    className="h-full text-[11px] sm:text-xs font-mono text-muted-foreground overflow-auto leading-relaxed whitespace-pre"
                  />
                )}

                {tab === "context" && (
                  <ContextTagsStream tags={HERO_ANSWER.contextTags} reduced={reduced} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {liveUserMessage && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex justify-end">
                <div className="max-w-[90%] rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5 text-sm leading-relaxed">
                  {liveUserMessage}
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed px-0.5">
                {HERO_LIVE_REPLY.prefix}{" "}
                <Link
                  href={HERO_LIVE_REPLY.accountHref}
                  className="text-primary font-medium hover:underline underline-offset-2"
                >
                  {HERO_LIVE_REPLY.accountLabel}
                </Link>{" "}
                or{" "}
                <a
                  href={contactMailto(HERO_LIVE_REPLY.demoSubject)}
                  className="text-primary font-medium hover:underline underline-offset-2"
                >
                  {HERO_LIVE_REPLY.demoLabel}
                </a>
                .
              </p>
              <div ref={liveEndRef} />
            </motion.div>
          )}
        </AnimatePresence>

        <form
          className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 flex items-center gap-2 focus-within:border-primary/50 transition-colors"
          onSubmit={(e) => {
            e.preventDefault();
            sendLiveMessage();
          }}
        >
          <label htmlFor="hero-demo-ask" className="sr-only">
            Ask {BRAND.name}
          </label>
          <input
            id="hero-demo-ask"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Ask ${BRAND.name}…`}
            autoComplete="off"
            className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Send message"
            className={cn(
              "h-8 w-8 rounded-md inline-flex items-center justify-center shrink-0 transition-colors",
              draft.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
