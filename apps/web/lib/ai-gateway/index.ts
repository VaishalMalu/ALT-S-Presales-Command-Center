import { z } from 'zod';
import { WinPredictionSchema, RequirementExtractionSchema, WinPrediction, RequirementExtraction } from './schemas';
import { WIN_PREDICTION_SYSTEM_PROMPT, REQUIREMENT_EXTRACTION_SYSTEM_PROMPT } from './prompts';

type SupportedProvider = 'AzureOpenAI' | 'Anthropic' | 'Gemini';

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

  constructor(provider: SupportedProvider = 'AzureOpenAI') {
    this.defaultProvider = provider;
  }

  /**
   * Internal router to dispatch to specific provider SDKs.
   * Mocked for foundational scaffolding.
   */
  private async dispatch<T>(systemPrompt: string, userContent: string, schema: z.ZodSchema<T>, options?: AIGatewayOptions): Promise<T> {
    const provider = options?.provider || this.defaultProvider;
    console.log(`Dispatching request to ${provider}...`);
    
    // In production, instantiate the respective SDK here (e.g., @azure/openai)
    // and use schema-enforced JSON generation (e.g. OpenAI structured outputs).
    
    // Mock response for architectural scaffolding
    if (schema === WinPredictionSchema) {
      return {
        probability: 85,
        revenue_forecast: 1200000,
        deal_health: 'Good',
        customer_intent: 'High',
        risk_level: 'Low',
        recommended_next_actions: ['Schedule technical deep-dive'],
        explanation: 'The customer exhibits strong buying signals and the budget aligns with the proposed solution design.'
      } as unknown as T;
    }
    
    throw new Error('Unsupported schema for mock dispatch');
  }

  public async predictWin(opportunityData: any, options?: AIGatewayOptions): Promise<WinPrediction> {
    return this.dispatch(
      WIN_PREDICTION_SYSTEM_PROMPT, 
      JSON.stringify(opportunityData), 
      WinPredictionSchema,
      options
    );
  }

  public async extractRequirements(rfpText: string, options?: AIGatewayOptions): Promise<RequirementExtraction> {
    return this.dispatch(
      REQUIREMENT_EXTRACTION_SYSTEM_PROMPT, 
      rfpText, 
      RequirementExtractionSchema,
      options
    );
  }
}

export const aiGateway = new AIGateway();
