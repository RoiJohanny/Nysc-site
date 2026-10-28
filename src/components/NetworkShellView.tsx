import React, { useState } from 'react';
import { CorperDirectoryView } from './network/CorperDirectoryView';
import { MarketplaceView } from './MarketplaceView';
import { HousingRelocationTransitView } from './network/HousingRelocationTransitView';
import { EmergencyDirectoryView } from './EmergencyDirectoryView';
import {
  Users,
  ShoppingBag,
  Home,
  ShieldAlert,
  Sparkles,
  Layers,
  MapPin
} from 'lucide-react';

interface NetworkShellViewProps {
  initialSubModule?: 'directory' | 'marketplace' | 'housing' | 'sos';
}

export const NetworkShellView: React.FC<NetworkShellViewProps> = ({
  initialSubModule = 'directory'
}) => {
  const [activeSubModule, setActiveSubModule] = useState<'directory' | 'marketplace' | 'housing' | 'sos'>(
    initialSubModule
  );

  const subModules = [
    {
      id: 'directory',
      label: 'Corper Directory',
      icon: Users,
      desc: 'State, PPA & CDS Network'
    },
    {
      id: 'marketplace',
      label: 'Marketplace (POD)',
      icon: ShoppingBag,
      desc: 'Used Beds, Fans & Gear'
    },
    {
      id: 'housing',
      label: 'Housing & Transit',
      icon: Home,
      desc: 'Lodges, Relocation & Fares'
    },
    {
      id: 'sos',
      label: 'Emergency SOS',
      icon: ShieldAlert,
      desc: 'LGI & Security Lines'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Network Segmented Sub-navigation Bar */}
      <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-2 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          {subModules.map((module) => {
            const Icon = module.icon;
            const isActive = activeSubModule === module.id;
            const isSos = module.id === 'sos';

            return (
              <button
                key={module.id}
                onClick={() => setActiveSubModule(module.id as any)}
                className={`p-2.5 sm:p-3 rounded-xl text-left transition-all flex items-center sm:items-start gap-2.5 ${
                  isActive
                    ? isSos
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-bold'
                      : 'bg-[#008751] text-white shadow-lg shadow-[#008751]/30 font-bold'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/40'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isSos
                      ? 'bg-rose-950/60 text-rose-400'
                      : 'bg-slate-700/60 text-[#008751]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold truncate">{module.label}</div>
                  <div
                    className={`text-[10px] hidden sm:block truncate ${
                      isActive ? 'text-white/80' : 'text-slate-400'
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

      {/* Render Active Sub-module */}
      <div>
        {activeSubModule === 'directory' && <CorperDirectoryView />}
        {activeSubModule === 'marketplace' && <MarketplaceView />}
        {activeSubModule === 'housing' && <HousingRelocationTransitView />}
        {activeSubModule === 'sos' && <EmergencyDirectoryView />}
      </div>

    </div>
  );
};
