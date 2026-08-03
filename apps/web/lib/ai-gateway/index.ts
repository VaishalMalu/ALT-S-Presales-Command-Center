import { z } from "zod";
import {
  WinPredictionSchema,
  RequirementExtractionSchema,
  WinPrediction,
  RequirementExtraction,
} from "./schemas";
import {
  WIN_PREDICTION_SYSTEM_PROMPT,
  REQUIREMENT_EXTRACTION_SYSTEM_PROMPT,
} from "./prompts";

type SupportedProvider = "AzureOpenAI" | "Anthropic" | "Gemini";

export interface AIGatewayOptions {
  provider?: SupportedProvider;
  temperature?: number;
}

/**
 * AI Gateway Interface
 * Abstracts the underlying LLM provider, enforcing structured output via Zod schemas.
 * (In a real implementation, this would use the Vercel AI SDK or direct provider SDKs).
 */
export class AIGateway {
  private defaultProvider: SupportedProvider;

  constructor(provider: SupportedProvider = "AzureOpenAI") {
    this.defaultProvider = provider;
  }

  /**
   * Internal router to dispatch to specific provider SDKs.
   * Mocked for foundational scaffolding.
   */
  private async dispatch<T>(
    systemPrompt: string,
    userContent: string,
    schema: z.ZodSchema<T>,
    options?: AIGatewayOptions,
  ): Promise<T> {
    const provider = options?.provider || this.defaultProvider;
    console.log(`Dispatching request to ${provider} (via Groq)...`);

    const { generateJSON } = await import("../ai/groq");

    let schemaDescription = "";
    if (schema instanceof z.ZodObject) {
      const shape = schema.shape;
      const entries = Object.entries(shape).map(([key, value]: any) => {
        let typeStr = value._def.typeName;
        if (value instanceof z.ZodEnum) {
          typeStr = `enum [${value._def.values.map((v: string) => `"${v}"`).join(", ")}]`;
        } else if (value instanceof z.ZodArray) {
          typeStr = `array of ${value._def.type._def.typeName}`;
        }
        return `  "${key}": ${typeStr} // ${value._def.description || ""}`;
      });
      schemaDescription = `{\n${entries.join(",\n")}\n}`;
    } else {
      schemaDescription = JSON.stringify(schema, null, 2);
    }

    const prompt = `${userContent}\n\nYou MUST return a JSON object matching this schema definition:\n${schemaDescription}`;
    
    return await generateJSON<T>(prompt, systemPrompt);
  }

  public async predictWin(
    opportunityData: any,
    options?: AIGatewayOptions,
  ): Promise<WinPrediction> {
    return this.dispatch(
      WIN_PREDICTION_SYSTEM_PROMPT,
      JSON.stringify(opportunityData),
      WinPredictionSchema,
      options,
    );
  }

  public async extractRequirements(
    rfpText: string,
    options?: AIGatewayOptions,
  ): Promise<RequirementExtraction> {
    return this.dispatch(
      REQUIREMENT_EXTRACTION_SYSTEM_PROMPT,
      rfpText,
      RequirementExtractionSchema,
      options,
    );
  }
}

export const aiGateway = new AIGateway();
