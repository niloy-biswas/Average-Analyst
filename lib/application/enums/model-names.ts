export enum ModelProvider {
  Anthropic = "anthropic",
  OpenAI = "openai",
}

export enum AnthropicModel {
  Sonnet4_5 = "claude-sonnet-4-6",
  Opus4 = "claude-opus-4-5",
  Haiku4_5 = "claude-haiku-4-5",
}

/** Seed choices shown before the admin refreshes the live OpenAI catalog. */
export enum OpenAIModel {
  gpt5_5 = "gpt-5.5",
  gpt5_4 = "gpt-5.4",
  gpt5_2 = "gpt-5.2",
}

/** Seed choices shown before the admin refreshes the live Anthropic catalog. */
export const ANTHROPIC_MODEL_CHOICES: ReadonlyArray<{ value: AnthropicModel; label: string }> = [
  { value: AnthropicModel.Sonnet4_5, label: "Claude Sonnet 4.6" },
  { value: AnthropicModel.Opus4, label: "Claude Opus 4.5" },
  { value: AnthropicModel.Haiku4_5, label: "Claude Haiku 4.5" },
];

export const OPENAI_MODEL_CHOICES: ReadonlyArray<{ value: OpenAIModel; label: string }> = [
  { value: OpenAIModel.gpt5_5, label: "GPT-5.5" },
  { value: OpenAIModel.gpt5_4, label: "GPT-5.4" },
  { value: OpenAIModel.gpt5_2, label: "GPT-5.2" },
];

/** Any Claude model id from Anthropic's catalog. */
export function isAnthropicChatModelId(id: string): boolean {
  return /^claude-/i.test(id.trim());
}

/** Chat/reasoning-ish OpenAI model ids — excludes embeddings/tts/dall-e/etc. */
export function isOpenAiChatModelId(id: string): boolean {
  const lower = id.trim().toLowerCase();
  if (!lower) return false;
  if (
    /embedding|whisper|tts|dall-e|moderation|realtime|transcribe|audio|image|codex|babbage|davinci|curie|ada|sora|gpt-image/i.test(
      lower
    )
  ) {
    return false;
  }
  return /^(gpt-|o1|o3|o4)/i.test(lower);
}

export function isValidModelForProvider(provider: ModelProvider, modelId: string): boolean {
  return provider === ModelProvider.Anthropic
    ? isAnthropicChatModelId(modelId)
    : isOpenAiChatModelId(modelId);
}
