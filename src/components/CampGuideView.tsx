import React, { useState } from 'react';
import { useNysc } from '../context/NyscContext';
import { NYSC_GLOSSARY } from '../data/mockSeed';
import { CampChecklistItem } from '../types/nysc';
import {
  FileCheck,
  BookOpen
} from 'lucide-react';

export const CampGuideView: React.FC = () => {
  const { campChecklist, toggleCampItem } = useNysc();

  const [activeTab, setActiveTab] = useState<'checklist' | 'glossary'>('checklist');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories: CampChecklistItem['category'][] = [
    'Mandatory Documents',
    'White Gears & Wear',
    'Health & Personal Care',
    'Hostel & Bedding',
    'Provisions & Cash'
  ];

  // Calculate packing stats
  const totalItems = campChecklist.length;
  const packedItems = campChecklist.filter(i => i.is_packed).length;
  const packingPct = Math.round((packedItems / totalItems) * 100);

  const filteredItems = selectedCategory === 'All'
    ? campChecklist
    : campChecklist.filter(i => i.category === selectedCategory);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Camp Survival & Orientation Toolkit
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
              21 Days Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Master the 35 essential camp packing items and learn Nigerian orientation camp vernacular.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex overflow-x-auto no-scrollbar max-w-full bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'checklist'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Packing List</span>
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'glossary'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Camp Lexicon</span>
          </button>
        </div>
      </div>

      {activeTab === 'checklist' ? (
        /* Packing Checklist View */
        <div className="space-y-6">
          
          {/* Packing Gauge Card */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Camp Luggage Readiness</span>
                  {packingPct === 100 && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                      100% Camp Ready! 🎉
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {packedItems} of {totalItems} items packed inside your travelling box.
                </p>
              </div>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">
                {packingPct}%
              </div>
            </div>

            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${packingPct}%` }}
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === 'All'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Items ({totalItems})
            </button>
            {categories.map(cat => {
              const count = campChecklist.filter(i => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Items List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => toggleCampItem(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 shadow-md ${
                  item.is_packed
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.is_packed}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer accent-emerald-500 shrink-0"
                />

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-bold leading-snug ${item.is_packed ? 'line-through text-slate-400' : 'text-white'}`}>
                      {item.title}
                    </h4>
                    {item.is_critical && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase shrink-0">
                        Compulsory
                      </span>
                    )}
                  </div>

                  {item.quantity && (
                    <div className="text-[10px] text-amber-300 font-mono">
                      Quantity: {item.quantity}
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      💡 {item.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        /* Camp Lexicon / Glossary */
        <div className="space-y-4">
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs text-slate-400">
            Familiarize yourself with the quintessential terms every corps member hears in camp and throughout service year.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {NYSC_GLOSSARY.map(item => (
              <div
                key={item.term}
                className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-1.5 shadow-md hover:border-slate-700 transition-all"
              >
                <div className="text-sm font-bold text-emerald-400">
                  {item.term}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
