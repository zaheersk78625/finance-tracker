import { Transaction, SavingTip } from "../types";

export async function generateSavingTips(transactions: Transaction[]): Promise<SavingTip[]> {
  if (transactions.length === 0) return [];

  const summary = transactions.reduce((acc, t) => {
    if (t.type === 'income') acc.income += t.amount;
    else {
      acc.expenses += t.amount;
      acc.categories[t.category] = (acc.categories[t.category] || 0) + t.amount;
    }
    return acc;
  }, { income: 0, expenses: 0, categories: {} as Record<string, number> });

  try {
    const response = await fetch('/api/tips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transactions, summary }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tips');
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating AI tips:", error);
    return [
      {
        title: "Start Small",
        content: "Try to save at least 10% of your income each month by cutting down on non-essential subscriptions.",
        impact: "medium"
      }
    ];
  }
}
