import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { cn } from '../lib/utils';

interface SummaryCardsProps {
  income: number;
  expenses: number;
  savings: number;
  currencySymbol: string;
}

export function SummaryCards({ income, expenses, savings, currencySymbol }: SummaryCardsProps) {
  const cards = [
    { title: 'Total Income', amount: income, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Expenses', amount: expenses, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Total Savings', amount: savings, icon: PiggyBank, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className={cn("p-3 rounded-xl", card.bg)}>
            <card.icon className={card.color} size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
            <p className={cn("text-2xl font-bold", card.color)}>{currencySymbol}{card.amount.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
