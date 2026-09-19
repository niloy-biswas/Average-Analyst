import { ChatOpenAI } from "@langchain/openai";
import { OPENROUTER_MODEL_CHOICES } from "../enums/model-names";

export function createOpenRouterLLM(model?: string, apiKeyOverride?: string): ChatOpenAI {
  const apiKey = apiKeyOverride ?? process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  return new ChatOpenAI({
    model: model ?? process.env.OPENROUTER_DEFAULT_MODEL ?? OPENROUTER_MODEL_CHOICES[0]!.value,
    apiKey,
    streaming: true,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });
}
