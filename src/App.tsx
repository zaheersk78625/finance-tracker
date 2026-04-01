import { useState, useEffect, useMemo } from 'react';
import { Transaction, SavingTip } from './types';
import { TransactionForm } from './components/TransactionForm';
import { SummaryCards } from './components/SummaryCards';
import { AnalyticsChart } from './components/AnalyticsChart';
import { AITips } from './components/AITips';
import { generateSavingTips } from './services/geminiService';
import { Wallet, History, Trash2, LayoutDashboard, Globe, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { CURRENCIES, Currency } from './constants';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('savvytrack_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('savvytrack_currency');
    return saved ? JSON.parse(saved) : CURRENCIES[0];
  });
  const [tips, setTips] = useState<SavingTip[]>([]);
  const [isTipsLoading, setIsTipsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  useEffect(() => {
    localStorage.setItem('savvytrack_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('savvytrack_currency', JSON.stringify(currency));
  }, [currency]);

  const totals = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.expenses += t.amount;
      return acc;
    }, { income: 0, expenses: 0 });
  }, [transactions]);

  const savings = totals.income - totals.expenses;

  const handleAddTransaction = (data: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const fetchTips = async () => {
    if (transactions.length === 0) return;
    setIsTipsLoading(true);
    try {
      const newTips = await generateSavingTips(transactions);
      setTips(newTips);
    } finally {
      setIsTipsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
              <Wallet className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-gray-900">SavvyTrack</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Wealth Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const demoData: Transaction[] = [
                  { id: crypto.randomUUID(), description: 'Monthly Salary', amount: 5000, category: 'Salary', type: 'income', date: new Date().toISOString() },
                  { id: crypto.randomUUID(), description: 'Rent Payment', amount: 1500, category: 'Rent', type: 'expense', date: new Date().toISOString() },
                  { id: crypto.randomUUID(), description: 'Grocery Shopping', amount: 400, category: 'Food', type: 'expense', date: new Date().toISOString() },
                  { id: crypto.randomUUID(), description: 'Netflix Subscription', amount: 15, category: 'Entertainment', type: 'expense', date: new Date().toISOString() },
                  { id: crypto.randomUUID(), description: 'Freelance Project', amount: 800, category: 'Freelance', type: 'income', date: new Date().toISOString() },
                  { id: crypto.randomUUID(), description: 'Dining Out', amount: 120, category: 'Food', type: 'expense', date: new Date().toISOString() },
                ];
                setTransactions(demoData);
                setTips([]); // Reset tips so they regenerate
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            >
              <Sparkles size={14} /> Load Demo
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-xl border border-gray-200">
              <Globe size={14} className="text-gray-500" />
              <select
                value={currency.code}
                onChange={(e) => {
                  const selected = CURRENCIES.find(c => c.code === e.target.value);
                  if (selected) setCurrency(selected);
                }}
                className="bg-transparent text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                ))}
              </select>
            </div>

            <nav className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  activeTab === 'dashboard' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <LayoutDashboard size={18} /> Dashboard
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  activeTab === 'history' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <History size={18} /> History
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <SummaryCards 
                income={totals.income} 
                expenses={totals.expenses} 
                savings={savings} 
                currencySymbol={currency.symbol}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-8">
                  <TransactionForm onAdd={handleAddTransaction} currencySymbol={currency.symbol} />
                  <AITips 
                    tips={tips} 
                    isLoading={isTipsLoading} 
                    onRefresh={fetchTips} 
                    hasTransactions={transactions.length > 0}
                  />
                </div>
                <div className="lg:col-span-8">
                  <AnalyticsChart transactions={transactions} currencySymbol={currency.symbol} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
                <p className="text-sm text-gray-500 font-medium">{transactions.length} total entries</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.length > 0 ? (
                      transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                            {new Date(t.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-800">
                            {t.description}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-500">
                              {t.category}
                            </span>
                          </td>
                          <td className={cn(
                            "px-6 py-4 text-sm font-black text-right",
                            t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {t.type === 'income' ? '+' : '-'}{currency.symbol}{t.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                          No transactions found. Start adding some!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
