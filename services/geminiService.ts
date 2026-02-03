
import { GoogleGenAI, Type } from "@google/genai";
import { TaskStage, TaskCategory, TaskPriority, BillingType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const SYSTEM_INSTRUCTION = `You are the Practice Management Engine for "Sasingian LegalOS," a comprehensive practice management solution for a high-performance law firm in Port Moresby.

OBJECTIVE: Analyze legal operational data from unstructured records and map them to MATTERS for onboardng.

STRICT OPERATING RULES:
1. MATTERS: Treat every input as a 'Matter' or 'Legal Case'. Extract Case Number and Client Name as the primary identifiers.
2. FINANCIALS: 
   - Apply PNG GST (10%).
   - Identify if the input mentions Trust Funds, Retainers, or Deposits. Map these to 'trust_balance'.
   - Determine if the entry is 'Billable' based on the professional activity described.
3. TRUST COMPLIANCE: If a client pays a retainer, it MUST be recorded in the 'financials.trust_balance' field to satisfy statutory requirements.
4. TAX: All currency is PNG Kina (K). Calculate tax_amount as 0.1 * suggested_fee.

The output MUST be a valid JSON object matching the provided schema.`;

export async function processLegalData(input: string, imageData?: string) {
  const model = 'gemini-3-flash-preview';
  
  const contents: any[] = [{ text: `Extract Matter details from this legal operational data: ${input}` }];
  
  if (imageData) {
    contents.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageData.split(',')[1] || imageData
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          task_metadata: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING, enum: Object.values(TaskCategory) },
              priority: { type: Type.STRING, enum: Object.values(TaskPriority) },
              case_number: { type: Type.STRING },
              client_name: { type: Type.STRING },
              lawyer_assigned: { type: Type.STRING },
              deadline: { type: Type.STRING }
            },
            required: ["title", "category", "priority"]
          },
          workflow: {
            type: Type.OBJECT,
            properties: {
              stage: { type: Type.STRING, enum: Object.values(TaskStage) },
              estimated_hours: { type: Type.NUMBER },
              billable_hours: { type: Type.NUMBER },
              is_billable: { type: Type.BOOLEAN }
            },
            required: ["stage", "estimated_hours", "billable_hours", "is_billable"]
          },
          financials: {
            type: Type.OBJECT,
            properties: {
              suggested_fee: { type: Type.NUMBER },
              tax_amount: { type: Type.NUMBER },
              total_inclusive: { type: Type.NUMBER },
              billing_type: { type: Type.STRING, enum: Object.values(BillingType) },
              trust_balance: { type: Type.NUMBER },
              is_invoiced: { type: Type.BOOLEAN }
            },
            required: ["suggested_fee", "tax_amount", "total_inclusive", "billing_type", "trust_balance", "is_invoiced"]
          }
        },
        required: ["task_metadata", "workflow", "financials"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to parse response", error);
    throw new Error("Invalid output format from processing engine.");
  }
}
