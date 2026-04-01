import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { transactions, summary } = req.body;

  if (!transactions || transactions.length === 0) {
    return res.status(400).json({ error: 'No transactions provided' });
  }

  const prompt = `
    You are a world-class financial advisor. Analyze the following monthly financial data and provide 3 highly personalized, actionable saving tips.
    
    Financial Summary:
    - Total Income: $${summary.income}
    - Total Expenses: $${summary.expenses}
    - Net Savings: $${summary.income - summary.expenses}
    - Expense Breakdown by Category: ${JSON.stringify(summary.categories)}
    
    Context:
    - If expenses are high in "Food", suggest meal prepping or bulk buying.
    - If "Entertainment" is high, suggest free local activities.
    - If savings are negative, prioritize urgent budget cuts.
    - If savings are high, suggest investment or high-yield savings accounts.
    
    Your tips should be:
    1. Specific: Don't just say "save money", say "reduce X by doing Y".
    2. Actionable: Something the user can do today.
    3. Encouraging: Maintain a professional yet supportive tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional financial advisor. Provide 3 saving tips in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Short, catchy title for the tip" },
              content: { type: Type.STRING, description: "Detailed, actionable advice" },
              impact: { type: Type.STRING, enum: ["high", "medium", "low"], description: "Estimated impact on savings" }
            },
            required: ["title", "content", "impact"]
          }
        }
      }
    });

    return res.status(200).json(JSON.parse(response.text || "[]"));
  } catch (error) {
    console.error("Error generating AI tips:", error);
    return res.status(500).json({ error: 'Failed to generate tips' });
  }
}
