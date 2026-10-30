import React from 'react';
import {
  Home,
  Compass,
  Users,
  Briefcase
} from 'lucide-react';

export type TabType = 'home' | 'hub' | 'network' | 'career';

interface BottomTabBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onChangeTab }) => {
  const tabs: { id: TabType; label: string; icon: any; emoji: string }[] = [
    { id: 'home', label: 'Home', icon: Home, emoji: '🏠' },
    { id: 'hub', label: 'Hub', icon: Compass, emoji: '🗺️' },
    { id: 'network', label: 'Network', icon: Users, emoji: '👥' },
    { id: 'career', label: 'Career', icon: Briefcase, emoji: '💼' }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 sm:bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 bg-slate-900/95 dark:bg-[#0b0f19]/95 backdrop-blur-lg border-t sm:border border-slate-800 sm:rounded-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.5)] sm:shadow-2xl">
      <div className="w-full sm:w-[460px] md:w-[520px] px-3 sm:px-4 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                onChangeTab(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 group flex-1 max-w-[100px] ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Pill Glow */}
              {isActive && (
                <span className="absolute -top-2 w-8 h-1 bg-[#008751] rounded-full shadow-[0_0_12px_#008751]" />
              )}

              <div
                className={`w-10 h-7 flex items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#008751] text-white shadow-md shadow-[#008751]/30 scale-105'
                    : 'group-hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>

              <span
                className={`text-[11px] mt-1 font-semibold tracking-tight transition-colors flex items-center gap-1 ${
                  isActive ? 'text-[#008751] dark:text-emerald-400 font-extrabold' : 'text-slate-400'
                }`}
              >
                <span className="text-[10px] hidden sm:inline">{tab.emoji}</span>
                <span>{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
