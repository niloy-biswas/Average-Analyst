"use client";

import { motion } from "framer-motion";
import { BRAND, contactMailto, marketingPrimaryCta } from "@/lib/brand";
import { usePrefersReducedMotion } from "@/components/marketing/use-reduced-motion";
import { PrimaryCta } from "@/components/marketing/primary-cta";

export function FinalCta({ isLoggedIn }: { isLoggedIn: boolean }) {
  const primary = marketingPrimaryCta(isLoggedIn);
  const reduced = usePrefersReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <svg
          className="absolute inset-x-0 bottom-0 w-full h-24 opacity-30"
          viewBox="0 0 800 80"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0 50 Q100 20 200 45 T400 40 T600 55 T800 30"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.5"
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.6 }}
            viewport={{ once: true }}
            transition={{ duration: reduced ? 0 : 1.4, ease: "easeOut" }}
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
          Your data already knows the answer.
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Ask Evid, or run it on your own infrastructure.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <PrimaryCta
            {...primary}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          />
          <a
            href={BRAND.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg border border-border bg-card/50 text-sm font-medium hover:bg-muted/60 transition-colors"
          >
            View on GitHub
          </a>
          <a
            href={contactMailto("Evid implementation")}
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            Contact for implementation
          </a>
        </div>
      </div>
    </section>
  );
}
