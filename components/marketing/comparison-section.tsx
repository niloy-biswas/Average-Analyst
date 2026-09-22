"use client";

import { Check, X } from "lucide-react";
import { COMPARISON_ROWS } from "@/components/marketing/config";

function Cell({ value, emphasis }: { value: string; emphasis?: boolean }) {
  if (value === "Yes" || value === "No") {
    const Icon = value === "Yes" ? Check : X;
    return (
      <span
        className={
          value === "Yes"
            ? "inline-flex items-center gap-1.5 text-primary font-medium"
            : "inline-flex items-center gap-1.5 text-muted-foreground"
        }
      >
        <Icon className="h-4 w-4 shrink-0" />
        {value}
      </span>
    );
  }
  return <span className={emphasis ? "text-foreground" : "text-muted-foreground"}>{value}</span>;
}

export function ComparisonSection() {
  return (
    <section className="border-b border-border/40 bg-muted/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
          Not another SQL chatbot.
        </h2>
        <p className="text-muted-foreground max-w-xl mb-10 leading-relaxed">
          Evid works beside your existing BI tools. It does not need to replace them.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-border/60">
          <table className="w-full min-w-[560px] table-fixed text-sm">
            <colgroup>
              <col className="w-[40%]" />
              <col className="w-[30%]" />
              <col className="w-[30%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Capability</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                  Generic SQL chatbot
                </th>
                <th className="px-4 py-3 text-center font-semibold text-primary bg-primary/5">
                  Evid
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.capability} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 text-left font-medium text-foreground">
                    {row.capability}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Cell value={row.generic} />
                  </td>
                  <td className="px-4 py-3 text-center bg-primary/5">
                    <Cell value={row.ours} emphasis />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
