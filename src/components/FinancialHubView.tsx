import React, { useState } from 'react';
import { useNysc } from '../context/NyscContext';
import { Expense } from '../types/nysc';
import {
  Coins,
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  PieChart,
  Tag,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  Check,
  Edit2
} from 'lucide-react';

export const FinancialHubView: React.FC = () => {
  const { financials, updateFinancials, expenses, addExpense, deleteExpense, fireConfetti } = useNysc();

  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isEditingSources, setIsEditingSources] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Form states for adding expense
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Expense['category']>('Food');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  // Form state for sources
  const [fedAlawee, setFedAlawee] = useState(financials.federal_alawee || 77000);
  const [stateAllow, setStateAllow] = useState(financials.state_allowance || 0);
  const [ppaStipend, setPpaStipend] = useState(financials.ppa_stipend || 0);
  const [sideHustle, setSideHustle] = useState(financials.side_hustle || 0);

  const categories: Expense['category'][] = ['Food', 'Transport', 'Rent', 'Data', 'CDS Dues', 'Personal', 'Other'];

  const totalInflow =
    Number(financials.federal_alawee || 77000) +
    Number(financials.state_allowance || 0) +
    Number(financials.ppa_stipend || 0) +
    Number(financials.side_hustle || 0);

  const totalOutflow = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const netSavings = totalInflow - totalOutflow;
  const savingsRate = totalInflow > 0 ? Math.max(0, Math.round((netSavings / totalInflow) * 100)) : 0;

  // Category totals
  const categoryTotals = categories.map((cat) => {
    const sum = expenses.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0);
    const pct = totalOutflow > 0 ? Math.round((sum / totalOutflow) * 100) : 0;
    return { category: cat, total: sum, percentage: pct };
  }).filter(c => c.total > 0);

  const handleSaveSources = (e: React.FormEvent) => {
    e.preventDefault();
    updateFinancials({
      federal_alawee: Number(fedAlawee),
      state_allowance: Number(stateAllow),
      ppa_stipend: Number(ppaStipend),
      side_hustle: Number(sideHustle)
    });
    setIsEditingSources(false);
    fireConfetti();
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount || Number(newAmount) <= 0) return;

    addExpense({
      title: newTitle.trim(),
      category: newCategory,
      amount: Number(newAmount),
      expense_date: newDate
    });

    setNewTitle('');
    setNewAmount('');
    setIsAddingExpense(false);
  };

  const filteredExpenses = filterCategory === 'All'
    ? expenses
    : expenses.filter(e => e.category === filterCategory);

  // Quick preset templates for corper expenses
  const quickTemplates = [
    { title: 'Keke / BRT to PPA', cat: 'Transport' as const, amt: 800 },
    { title: 'Food & Cooking Gas Refill', cat: 'Food' as const, amt: 6500 },
    { title: 'Monthly CDS Dues', cat: 'CDS Dues' as const, amt: 1000 },
    { title: 'MTN / Airtel Data 20GB', cat: 'Data' as const, amt: 5000 },
    { title: 'Khaki Drycleaning & Ironing', cat: 'Personal' as const, amt: 1500 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Corper Financial Hub & ₦77,000 Alawee Planner
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Active Ledger
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track and budget your monthly Federal allowance, state subventions, PPA stipends, and day-to-day living expenses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditingSources(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit Inflows</span>
          </button>

          <button
            onClick={() => setIsAddingExpense(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Top Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Inflow Card */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Monthly Inflow</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            ₦{totalInflow.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>Fed: ₦{(financials.federal_alawee || 77000).toLocaleString()}</span>
            <span>•</span>
            <span>PPA: ₦{(financials.ppa_stipend || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Total Outflow Card */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Month Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-400">
            ₦{totalOutflow.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">
            Across {expenses.length} recorded line items
          </div>
        </div>

        {/* Net Savings & Rate */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Disposable Surplus / Savings</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            ₦{netSavings.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
            <span>{savingsRate}% Savings Rate</span>
            <span className="text-slate-400 font-normal">
              ({(netSavings * 11).toLocaleString()} est. post-NYSC reserve)
            </span>
          </div>
        </div>

      </div>

      {/* Income Breakdown & Spending by Category Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Income Sources Detailed Breakdown */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              Monthly Inflow Sources
            </h3>
            <button
              onClick={() => setIsEditingSources(true)}
              className="text-[11px] text-emerald-400 hover:underline font-semibold"
            >
              Update
            </button>
          </div>

          <div className="space-y-3">
            
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">Federal Government Alawee</div>
                <div className="text-[10px] text-emerald-400 font-medium">Standard National Corps Wage</div>
              </div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                ₦{Number(financials.federal_alawee || 77000).toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">State Government Allowance</div>
                <div className="text-[10px] text-slate-400">State specific subvention</div>
              </div>
              <div className="text-sm font-bold text-slate-200 font-mono">
                ₦{Number(financials.state_allowance || 0).toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">PPA Stipend / Transportation</div>
                <div className="text-[10px] text-slate-400">Host school / employer bonus</div>
              </div>
              <div className="text-sm font-bold text-slate-200 font-mono">
                ₦{Number(financials.ppa_stipend || 0).toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">Side Hustle / Freelancing</div>
                <div className="text-[10px] text-slate-400">SAED skill / digital tutoring</div>
              </div>
              <div className="text-sm font-bold text-slate-200 font-mono">
                ₦{Number(financials.side_hustle || 0).toLocaleString()}
              </div>
            </div>

          </div>

          {/* Quick Corper Advice Box */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart NYSC Alawee Rule</span>
            </div>
            <p className="text-[11px] text-emerald-200/80 leading-relaxed">
              Always save minimum 30% of your ₦77,000 Alawee (approx ₦23,000/mo). In 10 months, you will have ₦230,000+ for apartment rent and post-service job hunting!
            </p>
          </div>
        </div>

        {/* Right 2 Cols: Category Spending Breakdown & Quick Presets */}
        <div className="lg:col-span-2 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-teal-400" />
              Spending Distribution by Category
            </h3>
            <span className="text-xs text-slate-400">
              Total Spent: ₦{totalOutflow.toLocaleString()}
            </span>
          </div>

          {/* Category Progress Bars */}
          <div className="space-y-3">
            {categoryTotals.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No expenses logged yet. Tap "Add Expense" to start tracking.
              </div>
            ) : (
              categoryTotals.map(item => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{item.category}</span>
                    <span className="text-slate-400">
                      ₦{item.total.toLocaleString()} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Template Buttons */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Corper Presets (One-tap logging)
            </div>
            <div className="flex flex-wrap gap-2">
              {quickTemplates.map(tmpl => (
                <button
                  key={tmpl.title}
                  onClick={() => {
                    addExpense({
                      title: tmpl.title,
                      category: tmpl.cat,
                      amount: tmpl.amt,
                      expense_date: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3 h-3 text-emerald-400" />
                  <span>{tmpl.title}</span>
                  <span className="text-emerald-400 font-mono text-[11px]">₦{tmpl.amt}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Expenses History Table */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">
              Recent Expense Records
            </h3>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              {filteredExpenses.length} items
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterCategory('All')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterCategory === 'All'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterCategory === c
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Table / List */}
        <div className="space-y-2">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No expenses matching the selected category.
            </div>
          ) : (
            filteredExpenses.map(item => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center text-slate-300 font-bold text-xs">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category}
                      </span>
                      <span>•</span>
                      <span>{item.expense_date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm font-bold text-rose-400 font-mono">
                    -₦{Number(item.amount).toLocaleString()}
                  </div>
                  <button
                    onClick={() => deleteExpense(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Inflow Sources Modal */}
      {isEditingSources && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              Configure Monthly Inflow Sources
            </h3>
            <p className="text-xs text-slate-400">
              Update your Federal alawee, state allowance, PPA stipend, or side hustles.
            </p>

            <form onSubmit={handleSaveSources} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Federal Alawee (₦)
                </label>
                <input
                  type="number"
                  value={fedAlawee}
                  onChange={e => setFedAlawee(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  State Allowance (₦) - If applicable
                </label>
                <input
                  type="number"
                  value={stateAllow}
                  onChange={e => setStateAllow(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  PPA Monthly Stipend (₦)
                </label>
                <input
                  type="number"
                  value={ppaStipend}
                  onChange={e => setPpaStipend(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Side Hustle / Freelance Earnings (₦)
                </label>
                <input
                  type="number"
                  value={sideHustle}
                  onChange={e => setSideHustle(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingSources(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-950/50"
                >
                  Save Inflows
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isAddingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Log New Expense
            </h3>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Expense Title / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rice & Cooking Oil at local market"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Amount (₦)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 3500"
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Expense Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingExpense(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-950/50"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
