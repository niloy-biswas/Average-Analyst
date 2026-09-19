import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-role";
import {
  ModelProvider,
  isValidModelForProvider,
  parseModelProvider,
} from "@/lib/application/enums/model-names";
import {
  envApiKeyForProvider,
  resolveLlmApiKeyFromSettings,
} from "@/lib/application/runtime/llm-api-key-from-settings";
import { testLlmConnection } from "@/lib/admin/test-connections";

const schema = z.object({
  provider: z.enum(["anthropic", "openai", "openrouter"]),
  model: z.string().min(1),
  /** @deprecated Use <provider>_api_key for the matching provider. */
  api_key: z.string().optional(),
  anthropic_api_key: z.string().optional(),
  openai_api_key: z.string().optional(),
  openrouter_api_key: z.string().optional(),
});

function bodyApiKey(
  body: z.infer<typeof schema>,
  provider: ModelProvider
): string | undefined {
  switch (provider) {
    case ModelProvider.Anthropic:
      return body.anthropic_api_key?.trim();
    case ModelProvider.OpenAI:
      return body.openai_api_key?.trim();
    case ModelProvider.OpenRouter:
      return body.openrouter_api_key?.trim();
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = schema.parse(await req.json());
    const provider = parseModelProvider(body.provider);

    if (!isValidModelForProvider(provider, body.model)) {
      return NextResponse.json({ error: "Invalid model for provider" }, { status: 400 });
    }

    let apiKey: string | undefined =
      bodyApiKey(body, provider) ||
      body.api_key?.trim() ||
      (await resolveLlmApiKeyFromSettings(provider));
    if (!apiKey) {
      apiKey = envApiKeyForProvider(provider);
    }
    if (!apiKey) {
      return NextResponse.json({ error: "No API key available to test" }, { status: 400 });
    }

    await testLlmConnection(provider, apiKey, body.model);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    const status = e instanceof Error && "status" in e ? (e as { status: number }).status : 500;
    if (status === 401 || status === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status });
    }
    const msg = e instanceof Error ? e.message : "Test failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
