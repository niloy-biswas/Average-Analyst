import { adminGetSetting } from "@/lib/supabase/admin-queries";
import { ModelProvider } from "../enums/model-names";

export function llmModelAppSettingKey(
  provider: ModelProvider
): "ai_model_anthropic" | "ai_model_openai" | "ai_model_openrouter" {
  switch (provider) {
    case ModelProvider.Anthropic:
      return "ai_model_anthropic";
    case ModelProvider.OpenAI:
      return "ai_model_openai";
    case ModelProvider.OpenRouter:
      return "ai_model_openrouter";
  }
}

/**
 * Stored model id for this provider.
 * `ai_model_<provider>` is the per-provider store; `ai_model` is the pre-migration single
 * value (whichever provider was active when it was written), kept as a one-time fallback
 * so upgrades don't lose an already-configured model.
 */
export async function getStoredModelForProvider(provider: ModelProvider): Promise<string | null> {
  return (
    (await adminGetSetting(llmModelAppSettingKey(provider))) ?? (await adminGetSetting("ai_model"))
  );
}
