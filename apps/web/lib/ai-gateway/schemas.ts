import { z } from "zod";

export const WinPredictionSchema = z.object({
  probability: z
    .number()
    .min(0)
    .max(100)
    .describe("Win probability percentage between 0 and 100."),
  revenue_forecast: z.number().describe("The estimated revenue forecast."),
  deal_health: z
    .enum(["Poor", "Fair", "Good", "Excellent"])
    .describe("Overall health of the deal."),
  customer_intent: z
    .enum(["Low", "Medium", "High"])
    .describe("Assessed intent of the customer."),
  risk_level: z
    .enum(["Low", "Medium", "High", "Critical"])
    .describe("Calculated risk level."),
  recommended_next_actions: z
    .array(z.string())
    .describe("Specific, actionable next steps for the sales team."),
  explanation: z
    .string()
    .describe(
      "Detailed explanation for the prediction, avoiding generic AI phrasing.",
    ),
});

export const RequirementExtractionSchema = z.object({
  requirements: z.array(
    z.object({
      id: z
        .string()
        .describe("Unique identifier for the requirement (e.g., REQ-01)."),
      description: z.string().describe("Full description of the requirement."),
      is_mandatory: z
        .boolean()
        .describe("Whether this requirement is mandatory or optional."),
      technical_domain: z
        .string()
        .describe("The technical domain (e.g., Security, Cloud, Data)."),
    }),
  ),
  deliverables: z
    .array(z.string())
    .describe("List of concrete deliverables requested."),
  deadlines: z.array(
    z.object({
      date: z.string().describe("The deadline date (ISO format)."),
      description: z.string().describe("What is due on this date."),
    }),
  ),
  budget: z.number().nullable().describe("The stated budget, if any."),
  executive_summary: z
    .string()
    .describe("A high-level executive summary of the document."),
});

export type WinPrediction = z.infer<typeof WinPredictionSchema>;
export type RequirementExtraction = z.infer<typeof RequirementExtractionSchema>;
