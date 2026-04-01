import { Sparkles, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SavingTip } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AITipsProps {
  tips: SavingTip[];
  isLoading: boolean;
  onRefresh: () => void;
  hasTransactions: boolean;
}

export function AITips({ tips, isLoading, onRefresh, hasTransactions }: AITipsProps) {
  const impactIcons = {
    high: <TrendingUp className="text-emerald-500" size={16} />,
    medium: <Minus className="text-amber-500" size={16} />,
    low: <TrendingDown className="text-rose-500" size={16} />,
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Sparkles className="text-indigo-600" size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">AI Saving Tips</h3>
        </div>
        {tips.length > 0 && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50 flex items-center gap-1"
          >
            {isLoading ? <Loader2 className="animate-spin" size={14} /> : 'Refresh Tips'}
          </button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 space-y-3"
            >
              <Loader2 className="animate-spin text-indigo-500" size={32} />
              <p className="text-sm text-gray-400 font-medium">Analyzing your spending...</p>
            </motion.div>
          ) : tips.length > 0 ? (
            tips.map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-800">{tip.title}</h4>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-white rounded-full border border-gray-100 shadow-sm">
                    {impactIcons[tip.impact]}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{tip.impact} impact</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{tip.content}</p>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 space-y-4">
              <p className="text-gray-400 text-sm italic">
                {hasTransactions 
                  ? "Ready to see how you can save?" 
                  : "Add some transactions to get AI-powered saving tips!"}
              </p>
              {hasTransactions && (
                <button
                  onClick={onRefresh}
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Generate Personalized Tips
                </button>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
