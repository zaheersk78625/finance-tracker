import React, { useState } from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { Transaction, TransactionType, CATEGORIES } from '../types';
import { cn } from '../lib/utils';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  currencySymbol: string;
}

export function TransactionForm({ onAdd, currencySymbol }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    onAdd({
      description,
      amount: parseFloat(amount),
      category,
      type,
    });

    setDescription('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
        <button
          type="button"
          onClick={() => { setType('income'); setCategory(CATEGORIES.income[0]); }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all text-sm font-medium",
            type === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <PlusCircle size={16} /> Income
        </button>
        <button
          type="button"
          onClick={() => { setType('expense'); setCategory(CATEGORIES.expense[0]); }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all text-sm font-medium",
            type === 'expense' ? "bg-white text-rose-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <MinusCircle size={16} /> Expense
        </button>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="What's this for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
          required
        />
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
              {currencySymbol}
            </span>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
              required
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-1/3 px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            {CATEGORIES[type].map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className={cn(
          "w-full py-3 rounded-xl text-white font-semibold transition-all shadow-lg active:scale-95",
          type === 'income' ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200" : "bg-rose-500 hover:bg-rose-600 shadow-rose-200"
        )}
      >
        Add {type.charAt(0).toUpperCase() + type.slice(1)}
      </button>
    </form>
  );
}
