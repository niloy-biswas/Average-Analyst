import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-role";
import { adminGetSetting, adminUpsertSetting } from "@/lib/supabase/admin-queries";
import { encryptSecret, isEncryptionConfigured } from "@/lib/secrets/credentials-crypto";
import { ModelProvider, isValidModelForProvider } from "@/lib/application/enums/model-names";
import {
  getEncryptedLlmApiKeyBlobForProvider,
  llmApiKeyAppSettingKey,
} from "@/lib/application/runtime/llm-api-key-from-settings";
import {
  getStoredModelForProvider,
  llmModelAppSettingKey,
} from "@/lib/application/runtime/llm-model-from-settings";

function toModelProvider(p: string | null | undefined): ModelProvider {
  return p === "openai" ? ModelProvider.OpenAI : ModelProvider.Anthropic;
}

const saveSchema = z
  .object({
    provider: z.enum(["anthropic", "openai"]),
    anthropic_model: z.string().optional(),
    openai_model: z.string().optional(),
    /** @deprecated Prefer anthropic_api_key / openai_api_key so both providers can be configured at once. */
    api_key: z.string().optional(),
    anthropic_api_key: z.string().optional(),
    openai_api_key: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const activeModel =
      data.provider === "openai" ? data.openai_model?.trim() : data.anthropic_model?.trim();
    if (!activeModel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A model is required for the active provider",
        path: [data.provider === "openai" ? "openai_model" : "anthropic_model"],
      });
    }

    const anthropicModel = data.anthropic_model?.trim();
    if (anthropicModel && !isValidModelForProvider(ModelProvider.Anthropic, anthropicModel)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Model must be a valid Anthropic model id",
        path: ["anthropic_model"],
      });
    }

    const openaiModel = data.openai_model?.trim();
    if (openaiModel && !isValidModelForProvider(ModelProvider.OpenAI, openaiModel)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Model must be a valid OpenAI model id",
        path: ["openai_model"],
      });
    }
  });

export async function GET() {
  try {
    await requireAdmin();
    const providerRaw = await adminGetSetting("ai_provider");
    const anthropicModel = await getStoredModelForProvider(ModelProvider.Anthropic);
    const openaiModel = await getStoredModelForProvider(ModelProvider.OpenAI);
    const providerEnum = toModelProvider(providerRaw ?? process.env.MODEL_PROVIDER);
    const hasAnthropic = Boolean(await getEncryptedLlmApiKeyBlobForProvider(ModelProvider.Anthropic));
    const hasOpenai = Boolean(await getEncryptedLlmApiKeyBlobForProvider(ModelProvider.OpenAI));
    const hasKey = Boolean(await getEncryptedLlmApiKeyBlobForProvider(providerEnum));
    const activeModel =
      (providerEnum === ModelProvider.OpenAI ? openaiModel : anthropicModel) ??
      (providerEnum === ModelProvider.OpenAI
        ? process.env.OPENAI_DEFAULT_MODEL
        : process.env.ANTHROPIC_DEFAULT_MODEL) ??
      "";
    return NextResponse.json({
      provider: providerRaw ?? process.env.MODEL_PROVIDER ?? "anthropic",
      model: activeModel,
      anthropic_model: anthropicModel ?? "",
      openai_model: openaiModel ?? "",
      has_api_key_stored: hasKey,
      has_anthropic_api_key_stored: hasAnthropic,
      has_openai_api_key_stored: hasOpenai,
    });
  } catch (e) {
    const status = e instanceof Error && "status" in e ? (e as { status: number }).status : 500;
    if (status === 401 || status === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to load model settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = saveSchema.parse(await req.json());

    await adminUpsertSetting("ai_provider", body.provider);
    if (body.anthropic_model?.trim()) {
      await adminUpsertSetting(
        llmModelAppSettingKey(ModelProvider.Anthropic),
        body.anthropic_model.trim()
      );
    }
    if (body.openai_model?.trim()) {
      await adminUpsertSetting(llmModelAppSettingKey(ModelProvider.OpenAI), body.openai_model.trim());
    }

    const keyAnth = body.anthropic_api_key?.trim();
    const keyOpen = body.openai_api_key?.trim();
    const keyLegacy = body.api_key?.trim();
    const needsEncryption = Boolean(keyAnth || keyOpen || keyLegacy);

    if (needsEncryption && !isEncryptionConfigured()) {
      return NextResponse.json(
        {
          error:
            "SETTINGS_ENCRYPTION_KEY is not set (min 16 chars). Required to store API keys.",
        },
        { status: 400 }
      );
    }

    if (keyAnth) {
      await adminUpsertSetting("anthropic_api_key_encrypted", encryptSecret(keyAnth));
    }
    if (keyOpen) {
      await adminUpsertSetting("openai_api_key_encrypted", encryptSecret(keyOpen));
    }
    if (keyLegacy && !keyAnth && !keyOpen) {
      const p = body.provider === "openai" ? ModelProvider.OpenAI : ModelProvider.Anthropic;
      await adminUpsertSetting(llmApiKeyAppSettingKey(p), encryptSecret(keyLegacy));
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    const status = e instanceof Error && "status" in e ? (e as { status: number }).status : 500;
    if (status === 401 || status === 403) {
      return NextResponse.json({ error: "Forbidden" }, { status });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to save model settings" }, { status: 500 });
  }
}
