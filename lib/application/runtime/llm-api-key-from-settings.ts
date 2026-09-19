import { decryptSecret } from "@/lib/secrets/credentials-crypto";
import { adminGetSetting } from "@/lib/supabase/admin-queries";
import { ModelProvider } from "../enums/model-names";

/**
 * Encrypted blob for the LLM API key for this provider.
 * Anthropic: `anthropic_api_key_encrypted` then legacy `ai_api_key_encrypted`.
 * OpenAI / OpenRouter: their own `<provider>_api_key_encrypted` only (legacy single column
 * may hold the wrong provider's key).
 */
export async function getEncryptedLlmApiKeyBlobForProvider(
  provider: ModelProvider
): Promise<string | null> {
  if (provider === ModelProvider.Anthropic) {
    return (
      (await adminGetSetting("anthropic_api_key_encrypted")) ??
      (await adminGetSetting("ai_api_key_encrypted"))
    );
  }
  return (await adminGetSetting(llmApiKeyAppSettingKey(provider))) ?? null;
}

export async function resolveLlmApiKeyFromSettings(
  provider: ModelProvider
): Promise<string | undefined> {
  const enc = await getEncryptedLlmApiKeyBlobForProvider(provider);
  if (!enc) return undefined;
  try {
    return decryptSecret(enc);
  } catch {
    return undefined;
  }
}

export function llmApiKeyAppSettingKey(
  provider: ModelProvider
): "anthropic_api_key_encrypted" | "openai_api_key_encrypted" | "openrouter_api_key_encrypted" {
  switch (provider) {
    case ModelProvider.Anthropic:
      return "anthropic_api_key_encrypted";
    case ModelProvider.OpenAI:
      return "openai_api_key_encrypted";
    case ModelProvider.OpenRouter:
      return "openrouter_api_key_encrypted";
  }
}

/** Env var fallback for this provider's API key, used when nothing is stored in settings. */
export function envApiKeyForProvider(provider: ModelProvider): string | undefined {
  switch (provider) {
    case ModelProvider.Anthropic:
      return process.env.ANTHROPIC_API_KEY;
    case ModelProvider.OpenAI:
      return process.env.OPENAI_API_KEY;
    case ModelProvider.OpenRouter:
      return process.env.OPENROUTER_API_KEY;
  }
}
