import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Transaction } from '../types';
import { cn } from '../lib/utils';
import { PieChart as PieIcon, BarChart3 as BarIcon, ArrowUpRight } from 'lucide-react';

interface AnalyticsChartProps {
  transactions: Transaction[];
  currencySymbol: string;
}

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

export function AnalyticsChart({ transactions, currencySymbol }: AnalyticsChartProps) {
  const [view, setView] = useState<'category' | 'comparison'>('category');

  const expenseData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) existing.value += t.amount;
      else acc.push({ name: t.category, value: t.amount });
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value);

  const comparisonData = useMemo(() => {
    const totals = transactions.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
    return [
      { name: 'Income', value: totals.income, fill: '#10b981' },
      { name: 'Expense', value: totals.expense, fill: '#f43f5e' }
    ];
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-[500px] space-y-4">
        <div className="p-4 bg-gray-50 rounded-full">
          <BarIcon className="text-gray-300" size={48} />
        </div>
        <p className="text-gray-400 font-medium">Add transactions to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <div className="xl:col-span-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-[500px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">
            {view === 'category' ? 'Expense Breakdown' : 'Income vs Expense'}
          </h3>
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setView('category')}
              className={cn(
                "p-2 rounded-lg transition-all",
                view === 'category' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <PieIcon size={18} />
            </button>
            <button
              onClick={() => setView('comparison')}
              className={cn(
                "p-2 rounded-lg transition-all",
                view === 'comparison' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <BarIcon size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            {view === 'category' ? (
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => `${currencySymbol}${value.toLocaleString()}`}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            ) : (
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `${currencySymbol}${val}`} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => `${currencySymbol}${value.toLocaleString()}`}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="xl:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Top Spending</h3>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {expenseData.length > 0 ? (
            expenseData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl group hover:bg-indigo-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Category</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{currencySymbol}{item.toLocaleString()}</p>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-indigo-500 font-bold">
                    <ArrowUpRight size={10} />
                    {((item.value / comparisonData[1].value) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm italic">
              No expenses recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
