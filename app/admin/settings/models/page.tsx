"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlaskConical, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ANTHROPIC_MODEL_CHOICES, OPENAI_MODEL_CHOICES } from "@/lib/application/enums/model-names";

type ModelOption = { value: string; label: string };
type CatalogModel = { id: string; created?: number };

function anthropicOptions(): ModelOption[] {
  return ANTHROPIC_MODEL_CHOICES.map((o) => ({ value: o.value, label: o.label }));
}

function seedOpenAiOptions(): ModelOption[] {
  return OPENAI_MODEL_CHOICES.map((o) => ({ value: o.value, label: o.label }));
}

function pickModel(options: ModelOption[], fromServer: string | undefined): string {
  const candidate = (fromServer ?? "").trim();
  if (candidate) return candidate;
  return options[0]?.value ?? "";
}

function ModelCombobox({
  options,
  value,
  onChange,
}: {
  options: ModelOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.value.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
          setQuery("");
        }
      }}
    >
      <input
        value={open ? query : value}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        placeholder="Search model IDs…"
        autoComplete="off"
        className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm font-mono"
      />
      {open ? (
        <div className="absolute z-10 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-muted-foreground">No models match &quot;{query}&quot;.</p>
          ) : (
            filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setQuery("");
                }}
                className={`block w-full text-left px-3 py-2 text-sm font-mono hover:bg-muted/60 ${
                  o.value === value ? "bg-muted/40 text-foreground" : "text-foreground"
                }`}
              >
                {o.value}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function messageFromApiError(data: unknown): string {
  if (!data || typeof data !== "object" || !("error" in data)) return "Request failed";
  const err = (data as { error: unknown }).error;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const o = err as { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
    const parts: string[] = [];
    if (Array.isArray(o.formErrors)) parts.push(...o.formErrors);
    if (o.fieldErrors) {
      for (const msgs of Object.values(o.fieldErrors)) {
        if (Array.isArray(msgs)) parts.push(...msgs);
      }
    }
    if (parts.length > 0) return parts.join(" ");
  }
  try {
    return JSON.stringify(err);
  } catch {
    return "Request failed";
  }
}

export default function ModelsSettingsPage() {
  const [provider, setProvider] = useState("anthropic");
  const [model, setModel] = useState("");
  const [anthropicApiKey, setAnthropicApiKey] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [keyPresence, setKeyPresence] = useState({ anthropic: false, openai: false });
  const [openaiCatalog, setOpenaiCatalog] = useState<CatalogModel[]>([]);
  const [catalogAutoFetched, setCatalogAutoFetched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/settings/models");
    if (!res.ok) {
      setError("Failed to load settings");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setError(null);
    setTestSuccess(null);
    const p = data.provider ?? "anthropic";
    setProvider(p);
    setModel(
      pickModel(p === "openai" ? seedOpenAiOptions() : anthropicOptions(), data.model)
    );
    setKeyPresence({
      anthropic: Boolean(data.has_anthropic_api_key_stored ?? data.has_api_key_stored),
      openai: Boolean(data.has_openai_api_key_stored),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client fetch-on-mount; `load` only updates state after await
    void load();
  }, [load]);

  const handleRefreshCatalog = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    setTestSuccess(null);
    const res = await fetch("/api/admin/settings/models/openai/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        openai_api_key: openaiApiKey.trim() || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setRefreshing(false);
    if (!res.ok) {
      setError(messageFromApiError(data));
      return;
    }
    setOpenaiCatalog(Array.isArray(data.models) ? (data.models as CatalogModel[]) : []);
  }, [openaiApiKey]);

  useEffect(() => {
    if (
      provider === "openai" &&
      keyPresence.openai &&
      openaiCatalog.length === 0 &&
      !catalogAutoFetched
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot catalog fetch when OpenAI becomes active
      setCatalogAutoFetched(true);
      void handleRefreshCatalog();
    }
  }, [provider, keyPresence.openai, openaiCatalog.length, catalogAutoFetched, handleRefreshCatalog]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTestSuccess(null);
    const res = await fetch("/api/admin/settings/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        model,
        anthropic_api_key: anthropicApiKey.trim() || undefined,
        openai_api_key: openaiApiKey.trim() || undefined,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(messageFromApiError(j));
      return;
    }
    if (openaiApiKey.trim()) {
      // New/rotated key — allow the catalog to auto-fetch again with it.
      setCatalogAutoFetched(false);
    }
    setAnthropicApiKey("");
    setOpenaiApiKey("");
    await load();
    setTestSuccess("Saved.");
  }

  async function handleTest() {
    setTesting(true);
    setError(null);
    setTestSuccess(null);
    const res = await fetch("/api/admin/settings/models/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        model,
        anthropic_api_key: anthropicApiKey.trim() || undefined,
        openai_api_key: openaiApiKey.trim() || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setTesting(false);
    if (!res.ok) {
      setError(messageFromApiError(data));
      return;
    }
    setTestSuccess(
      `Connected — ${provider === "openai" ? "OpenAI" : "Anthropic"} accepted a request for model ${model}.`
    );
  }

  let modelOptions: ModelOption[];
  if (provider === "openai") {
    modelOptions = openaiCatalog.length > 0
      ? openaiCatalog.map((c) => ({ value: c.id, label: c.id }))
      : seedOpenAiOptions();
    if (model.trim() && !modelOptions.some((o) => o.value === model)) {
      modelOptions = [{ value: model, label: model }, ...modelOptions];
    }
  } else {
    modelOptions = anthropicOptions();
  }

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">AI models</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Save an API key for each provider you use, then switch the active provider anytime. Only the
          active provider and model are used for chat; keys are encrypted at rest.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <Card className="overflow-visible">
            <CardHeader>
              <CardTitle className="text-base">Active chat runtime</CardTitle>
              <CardDescription>
                These control which LLM runs in production. Changing provider does not remove the
                other provider&apos;s saved key.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Active provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => {
                    const next = e.target.value;
                    setTestSuccess(null);
                    setError(null);
                    setProvider(next);
                    setModel((prev) =>
                      pickModel(next === "openai" ? seedOpenAiOptions() : anthropicOptions(), prev)
                    );
                  }}
                  className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm"
                >
                  <option value="anthropic">Anthropic</option>
                  <option value="openai">OpenAI</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Model for active provider
                  </label>
                  {provider === "openai" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={refreshing}
                      onClick={() => void handleRefreshCatalog()}
                    >
                      <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
                      {refreshing ? "Refreshing…" : "Refresh from OpenAI"}
                    </Button>
                  ) : null}
                </div>
                {provider === "openai" ? (
                  <ModelCombobox
                    options={modelOptions}
                    value={model}
                    onChange={(v) => {
                      setModel(v);
                      setTestSuccess(null);
                      setError(null);
                    }}
                  />
                ) : (
                  <select
                    value={model}
                    onChange={(e) => {
                      setModel(e.target.value);
                      setTestSuccess(null);
                      setError(null);
                    }}
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm font-mono"
                  >
                    {modelOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label} ({o.value})
                      </option>
                    ))}
                  </select>
                )}
                {provider === "openai" ? (
                  <p className="text-xs text-muted-foreground">
                    {openaiCatalog.length > 0
                      ? `${openaiCatalog.length} models from your OpenAI account.`
                      : "Add an OpenAI key and refresh to list every model on your account."}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Provider API keys</CardTitle>
              <CardDescription>
                Paste a key only when adding or rotating it. Leave blank to keep the stored value.
                You can configure both providers, then flip &quot;Active provider&quot; above without
                touching keys again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Anthropic
                    </p>
                    {keyPresence.anthropic ? (
                      <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                        Key stored
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Not stored
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    One key for all Claude models. Falls back to{" "}
                    <span className="font-mono">ANTHROPIC_API_KEY</span> if empty.
                  </p>
                  <input
                    type="password"
                    value={anthropicApiKey}
                    onChange={(e) => {
                      setAnthropicApiKey(e.target.value);
                      setTestSuccess(null);
                      setError(null);
                    }}
                    autoComplete="off"
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm"
                    placeholder={
                      keyPresence.anthropic ? "Leave blank to keep existing key" : "Paste Anthropic API key"
                    }
                  />
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      OpenAI
                    </p>
                    {keyPresence.openai ? (
                      <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                        Key stored
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Not stored
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Used for chat and catalog refresh. Falls back to{" "}
                    <span className="font-mono">OPENAI_API_KEY</span> if empty.
                  </p>
                  <input
                    type="password"
                    value={openaiApiKey}
                    onChange={(e) => {
                      setOpenaiApiKey(e.target.value);
                      setTestSuccess(null);
                      setError(null);
                    }}
                    autoComplete="off"
                    className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm"
                    placeholder={
                      keyPresence.openai ? "Leave blank to keep existing key" : "Paste OpenAI API key"
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button type="submit">Save</Button>
            <Button
              type="button"
              variant="outline"
              disabled={testing || !model}
              onClick={() => void handleTest()}
            >
              <FlaskConical className="size-3.5" />
              {testing ? "Testing…" : "Test active connection"}
            </Button>
          </div>

          <div aria-live="polite" className="min-h-[1.25rem]">
            {error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            {testSuccess && !error ? (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
                {testSuccess}
              </div>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
