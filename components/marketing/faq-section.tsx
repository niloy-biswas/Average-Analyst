"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/components/marketing/config";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  return (
    <section id="faq" className="border-b border-border/40 scroll-mt-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-10 sm:mb-12">
          FAQ
        </h2>

        <div className="border-t border-border/50">
          {FAQ_ITEMS.map((item) => {
            const open = openId === item.id;
            return (
              <div
                key={item.id}
                className={cn(
                  "relative border-b border-border/50 transition-colors",
                  open && "bg-primary/5"
                )}
              >
                {open && (
                  <span
                    className="absolute left-0 inset-y-0 w-0.5 bg-primary"
                    aria-hidden
                  />
                )}
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`faq-${item.id}`}
                    id={`faq-btn-${item.id}`}
                    onClick={() => setOpenId(open ? null : item.id)}
                    className="w-full flex items-center justify-between gap-4 py-5 sm:py-6 pl-4 sm:pl-5 pr-1 text-left text-base sm:text-lg font-medium text-foreground"
                  >
                    <span className="min-w-0 leading-snug">{item.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        open && "rotate-180 text-foreground/70"
                      )}
                    />
                  </button>
                </h3>
                <div
                  id={`faq-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${item.id}`}
                  hidden={!open}
                  className="pl-4 sm:pl-5 pr-8 pb-5 sm:pb-6"
                >
                  {open && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
