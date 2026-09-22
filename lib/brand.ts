/**
 * Product brand. Change here when renaming. UI and landing copy import from this module.
 */
export const BRAND = {
  name: "Evid",
  tagline: "Ask your data. Get answers backed by evidence.",
  description:
    "Ask questions in plain English and get charts, explanations, and SQL grounded in approved dashboards, tables, and business rules.",
  ogDescription:
    "Governed AI analytics with published context, approved tables, inspectable SQL, and self-hosted deployment options.",
  /** Short line under the name in product chrome */
  productLabel: "Governed AI analytics",
  supportEmail: "hello@niloy.tech",
  githubUrl: "https://github.com/niloy-biswas/Evid",
  footerLine: "Evid. Governed answers from your own data.",
} as const;

export function contactMailto(subject?: string): string {
  if (!subject) return `mailto:${BRAND.supportEmail}`;
  return `mailto:${BRAND.supportEmail}?subject=${encodeURIComponent(subject)}`;
}

/** Primary marketing CTA: open product (signed in) vs book a demo (signed out, no self-serve signup). */
export function marketingPrimaryCta(isLoggedIn: boolean): {
  href: string;
  label: string;
  external: boolean;
} {
  return isLoggedIn
    ? { href: "/app", label: "Open app", external: false }
    : { href: contactMailto(`Demo request: ${BRAND.name}`), label: "Book a demo", external: true };
}
