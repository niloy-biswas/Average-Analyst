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

/** Admin UI + validation: one row per selectable model. */
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

const ANTHROPIC_MODEL_IDS = new Set<string>(ANTHROPIC_MODEL_CHOICES.map((c) => c.value));

function isAnthropicModelId(id: string): boolean {
  return ANTHROPIC_MODEL_IDS.has(id);
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
    ? isAnthropicModelId(modelId)
    : isOpenAiChatModelId(modelId);
}
