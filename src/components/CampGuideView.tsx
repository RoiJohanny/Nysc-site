import React, { useState, useEffect } from 'react';
import { useNysc } from '../context/NyscContext';
import { NYSC_ANTHEM, NYSC_GLOSSARY } from '../data/mockSeed';
import { CampChecklistItem } from '../types/nysc';
import {
  FileCheck,
  Music,
  CheckCircle2,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Info
} from 'lucide-react';

export const CampGuideView: React.FC = () => {
  const { campChecklist, toggleCampItem, fireConfetti } = useNysc();

  const [activeTab, setActiveTab] = useState<'checklist' | 'anthem' | 'glossary'>('checklist');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Anthem Sing-Along player state
  const [isPlayingAnthem, setIsPlayingAnthem] = useState(false);
  const [activeStanzaIdx, setActiveStanzaIdx] = useState(0);

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

  // Anthem sing-along timer simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingAnthem) {
      timer = setInterval(() => {
        setActiveStanzaIdx(prev => {
          if (prev >= NYSC_ANTHEM.length - 1) {
            setIsPlayingAnthem(false);
            fireConfetti();
            return 0;
          }
          return prev + 1;
        });
      }, 7000); // 7s per stanza for karaoke pacing
    }
    return () => clearInterval(timer);
  }, [isPlayingAnthem]);

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
            Master the 35 essential camp packing items, memorize the NYSC anthem, and learn Nigerian orientation camp vernacular.
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
            onClick={() => setActiveTab('anthem')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'anthem'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Anthem Player</span>
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
      ) : activeTab === 'anthem' ? (
        /* Anthem Sing-Along View */
        <div className="space-y-6">
          
          {/* Karaoke Sing-along player */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl text-center max-w-2xl mx-auto">
            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
                National Youth Service Corps Official Anthem
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                "Youths Obey the Clarion Call"
              </h2>
              <p className="text-xs text-slate-400">
                Mandatory for every morning parade at 05:30 AM. Drill soldiers will test you individually!
              </p>
            </div>

            {/* Sing-Along Controller */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsPlayingAnthem(!isPlayingAnthem)}
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-all hover:scale-105 active:scale-95"
              >
                {isPlayingAnthem ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Sing-Along</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start Sing-Along Mode</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveStanzaIdx(0);
                  setIsPlayingAnthem(false);
                }}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Stanzas Display */}
            <div className="space-y-4 pt-2">
              {NYSC_ANTHEM.map((item, idx) => {
                const isActive = activeStanzaIdx === idx;
                return (
                  <div
                    key={item.stanza}
                    onClick={() => setActiveStanzaIdx(idx)}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/30 scale-102'
                        : 'bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">
                      {item.stanza} {isActive && '🎶 (Sing Now)'}
                    </div>

                    <div className="space-y-1.5 text-sm sm:text-base font-semibold text-slate-100 leading-relaxed font-serif">
                      {item.lines.map((line, lIdx) => (
                        <p key={lIdx} className={isActive ? 'text-white' : 'text-slate-400'}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
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
