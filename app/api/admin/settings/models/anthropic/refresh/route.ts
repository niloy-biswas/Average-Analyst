import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-role";
import { ModelProvider } from "@/lib/application/enums/model-names";
import { resolveLlmApiKeyFromSettings } from "@/lib/application/runtime/llm-api-key-from-settings";

const schema = z.object({
  anthropic_api_key: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = schema.parse(await req.json().catch(() => ({})));

    const apiKey =
      body.anthropic_api_key?.trim() ||
      (await resolveLlmApiKeyFromSettings(ModelProvider.Anthropic)) ||
      process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "No Anthropic API key available. Paste a key or save one in Models settings." },
        { status: 400 }
      );
    }

    const res = await fetch("https://api.anthropic.com/v1/models?limit=1000", {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    });
    const text = await res.text();
    if (!res.ok) {
      let msg = text.slice(0, 400);
      try {
        const j = JSON.parse(text) as { error?: { message?: string } };
        if (typeof j.error?.message === "string") msg = j.error.message;
      } catch {
        /* keep msg */
      }
      return NextResponse.json({ error: msg }, { status: res.status === 401 ? 401 : 400 });
    }

    let data: { data?: Array<{ id?: string; created_at?: string }> };
    try {
      data = JSON.parse(text) as { data?: Array<{ id?: string; created_at?: string }> };
    } catch {
      return NextResponse.json({ error: "Invalid response from Anthropic models API" }, { status: 502 });
    }

    const models = (data.data ?? [])
      .map((m) => ({
        id: typeof m.id === "string" ? m.id : "",
        created: typeof m.created_at === "string" ? Date.parse(m.created_at) || undefined : undefined,
      }))
      .filter((m) => m.id)
      .sort((a, b) => {
        const ca = a.created ?? 0;
        const cb = b.created ?? 0;
        if (cb !== ca) return cb - ca;
        return a.id.localeCompare(b.id);
      });

    return NextResponse.json({ models });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    const status = e instanceof Error && "status" in e ? (e as { status: number }).status : 500;
    if (status === 401 || status === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to refresh Anthropic model catalog" }, { status: 500 });
  }
}
