export type StatusBadge = "Available" | "Roadmap" | "Coming soon";

export const MARKETING_NAV = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const;

export const TRUST_LABELS = [
  "Open source",
  "Self-hostable",
  "Bring your own model",
  "BigQuery supported",
] as const;

export const INTEGRATION_LABELS = [
  "BigQuery",
  "Supabase",
  "LangGraph",
  "Opik",
  "OpenAI-compatible models",
] as const;

/** Pricing / contact cards. No dollar amounts; all CTAs are email except roadmap/coming-soon items. */
export const PRICING_PLANS: Array<{
  id: string;
  title: string;
  status: StatusBadge;
  blurb: string;
  points: string[];
  ctaLabel: string;
  subject: string;
}> = [
  {
    id: "community",
    title: "Community",
    status: "Roadmap",
    blurb: "Run Evid yourself. Bring your own Supabase, warehouse, and model keys.",
    points: [
      "Self-hosted on your infrastructure",
      "Published context and approved tables",
      "Open-source friendly path",
    ],
    ctaLabel: "Contact about Community",
    subject: "Evid Community",
  },
  {
    id: "cloud",
    title: "Cloud + implementation",
    status: "Available",
    blurb: "We host the app and help you connect dashboards, rules, and data sources.",
    points: [
      "Managed Evid Cloud",
      "Warehouse and context setup support",
      "Role-based admin for your team",
    ],
    ctaLabel: "Contact about Cloud",
    subject: "Evid Cloud and implementation",
  },
  {
    id: "setup",
    title: "We set it up for you",
    status: "Available",
    blurb:
      "A full setup service: we wire your stack, publish your first dashboards, and hand over a working workspace.",
    points: [
      "End-to-end configuration",
      "Business rules and approved tables",
      "Handoff and walkthrough for your team",
    ],
    ctaLabel: "Contact about setup",
    subject: "Evid setup service",
  },
];

export const COMPARISON_ROWS: Array<{
  capability: string;
  generic: string;
  ours: string;
}> = [
  {
    capability: "Warehouse access",
    generic: "Broad or unrestricted",
    ours: "Dashboard-scoped",
  },
  {
    capability: "Business definitions",
    generic: "Prompt-dependent",
    ours: "Published context",
  },
  {
    capability: "Approved tables",
    generic: "Often absent",
    ours: "Explicitly allowlisted",
  },
  {
    capability: "Draft/publish workflow",
    generic: "No",
    ours: "Yes",
  },
  {
    capability: "Inspectable SQL",
    generic: "Sometimes",
    ours: "Yes",
  },
  {
    capability: "Per-dashboard data sources",
    generic: "Rare",
    ours: "Yes",
  },
  {
    capability: "Self-hosting",
    generic: "Depends",
    ours: "Designed for it (Docker path on roadmap)",
  },
];

export const FAQ_ITEMS: Array<{ id: string; question: string; answer: string }> = [
  {
    id: "warehouse-data",
    question: "Do you store warehouse data?",
    answer:
      "No. Queries run against your configured BigQuery project. Evid stores chat messages, dashboard context, and encrypted credentials in your Supabase project, never copies of warehouse tables.",
  },
  {
    id: "warehouses",
    question: "Which data warehouses are supported?",
    answer:
      "BigQuery is supported today, including per-dashboard data sources. Other connectors are on the roadmap.",
  },
  {
    id: "self-host",
    question: "Can Evid be self-hosted?",
    answer:
      "The app is designed to be self-hostable and avoids Vercel-only APIs. Docker packaging is on the roadmap; today the path is Supabase Cloud plus a containerized app.",
  },
  {
    id: "roles",
    question: "Who can edit and publish context?",
    answer:
      "Editors create and edit drafts. Admins publish and archive dashboards. Chat users only see and query published dashboards.",
  },
  {
    id: "bi-replace",
    question: "Does this replace our BI tool?",
    answer:
      "No. Evid works beside Metabase, Looker Studio, Looker, Power BI, or other BI tools, governing the AI layer around published context. It doesn't need to replace your charts.",
  },
  {
    id: "vs-generic",
    question: "How is this different from a generic AI SQL tool?",
    answer:
      "Questions are scoped to a published dashboard, grounded in business rules and caveats, limited to approved tables, and gated by role-based publishing. Every answer comes back with the SQL, the source tables, and the context that shaped it, so you can check the work.",
  },
  {
    id: "byo-model",
    question: "Can we bring our own model credentials?",
    answer:
      "Yes. Admins configure provider and API keys in settings (encrypted at rest). Environment-variable fallback remains supported for first-run and self-host setups.",
  },
  {
    id: "per-dashboard-bq",
    question: "Can each dashboard use a separate BigQuery project?",
    answer:
      "Yes. Assign an encrypted data source (project, location, credentials) independently per dashboard from the admin workspace.",
  },
];

export const CAPABILITIES = [
  {
    id: "registry",
    title: "Dashboard registry",
    body: "Create, draft, publish, and archive analytics dashboards. Chat users only see published dashboards.",
  },
  {
    id: "context",
    title: "Business context",
    body: "Define business rules, caveats, instructions, purpose, and example questions without changing application code.",
  },
  {
    id: "tables",
    title: "Approved tables",
    body: "Restrict each dashboard to specific warehouse tables so the agent stays within scope.",
  },
  {
    id: "sources",
    title: "Per-dashboard data sources",
    body: "Assign encrypted BigQuery credentials and data locations independently for each dashboard.",
  },
  {
    id: "inspect",
    title: "Inspectable answers",
    body: "Review the explanation, visualization, query, source tables, and applied context behind an answer.",
  },
  {
    id: "roles",
    title: "Roles and publishing",
    body: "Editors prepare context. Admins publish it. Users query only what has been approved.",
  },
] as const;
