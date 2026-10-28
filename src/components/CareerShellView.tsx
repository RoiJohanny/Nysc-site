import React, { useState } from 'react';
import { useNysc } from '../context/NyscContext';
import { SaedJournalView } from './SaedJournalView';
import { PpaAchievementCvView } from './career/PpaAchievementCvView';
import { JobsAndPpaView } from './JobsAndPpaView';
import {
  Award,
  Briefcase,
  FileText,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface CareerShellViewProps {
  initialSubModule?: 'saed' | 'ppa' | 'jobs';
}

export const CareerShellView: React.FC<CareerShellViewProps> = ({
  initialSubModule = 'saed'
}) => {
  const { saedNotes, ppaWorkLogs, jobListings } = useNysc();
  const [activeSubModule, setActiveSubModule] = useState<'saed' | 'ppa' | 'jobs'>(
    initialSubModule
  );

  const subModules = [
    {
      id: 'saed',
      label: 'SAED Journal',
      icon: Award,
      count: saedNotes.length,
      desc: 'Skills, Multi-Photo Notes & PDF'
    },
    {
      id: 'ppa',
      label: 'PPA Work Log & CV',
      icon: FileText,
      count: ppaWorkLogs.length,
      desc: 'Milestones & Auto-Generated CV'
    },
    {
      id: 'jobs',
      label: 'Job Board',
      icon: Briefcase,
      count: jobListings.length,
      desc: 'LinkedIn & Jobberman Openings'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Career Sub-navigation Bar */}
      <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-2 shadow-xl print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {subModules.map((module) => {
            const Icon = module.icon;
            const isActive = activeSubModule === module.id;

            return (
              <button
                key={module.id}
                onClick={() => setActiveSubModule(module.id as any)}
                className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                  isActive
                    ? 'bg-[#008751] text-white shadow-lg shadow-[#008751]/30 font-bold'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/40'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-700/60 text-[#008751]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="truncate flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate">{module.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {module.count}
                    </span>
                  </div>
                  <div
                    className={`text-[10px] truncate mt-0.5 ${
                      isActive ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {module.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Selected Career Sub-module */}
      <div>
        {activeSubModule === 'saed' && <SaedJournalView />}
        {activeSubModule === 'ppa' && <PpaAchievementCvView />}
        {activeSubModule === 'jobs' && <JobsAndPpaView />}
      </div>

    </div>
  );
};
