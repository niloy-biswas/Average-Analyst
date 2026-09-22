"use client";

import { motion } from "framer-motion";
import { HeroDemo } from "@/components/marketing/hero-demo";
import { GitHubIcon } from "@/components/marketing/github-icon";
import { PrimaryCta } from "@/components/marketing/primary-cta";
import { TRUST_LABELS } from "@/components/marketing/config";
import { BRAND, marketingPrimaryCta } from "@/lib/brand";

export function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const primary = marketingPrimaryCta(isLoggedIn);
  const [beforeHighlight, afterHighlight] = BRAND.tagline.split("evidence");

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-10 pb-16 sm:pb-24">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(ellipse_at_bottom_right,color-mix(in_oklab,var(--muted-foreground)_12%,transparent),transparent_50%)]"
          aria-hidden
        />

        <div className="relative px-6 sm:px-10 lg:px-14 pt-12 sm:pt-16 pb-8 sm:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-5">
              {BRAND.productLabel}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.05] text-balance mb-5">
              {beforeHighlight}
              {afterHighlight !== undefined ? (
                <span className="font-mono italic text-primary">evidence</span>
              ) : null}
              {afterHighlight}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto mb-8">
              Ask questions in plain English and get charts, explanations, and inspectable
              SQL, grounded in your organization&apos;s approved dashboards, tables, and
              business rules.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <PrimaryCta
                {...primary}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-[0_0_24px_var(--primary-glow)]"
              />
              <a
                href={BRAND.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg border border-border bg-background/40 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
              >
                <GitHubIcon />
                View on GitHub
              </a>
            </div>

            <p className="text-xs text-muted-foreground/80">
              {TRUST_LABELS.join(" · ")}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="relative px-4 sm:px-8 lg:px-12 pb-6 sm:pb-10"
        >
          <div className="mx-auto max-w-4xl">
            <HeroDemo />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
