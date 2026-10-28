import React from 'react';
import { useNysc } from '../context/NyscContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { NyscPhase } from '../types/nysc';
import {
  Globe,
  Settings,
  ShieldAlert,
  Coins,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

interface NavbarProps {
  onOpenProfile: () => void;
  onOpenSos: () => void;
  onOpenPortal: () => void;
  onOpenSettings: () => void;
  onOpenAdmin?: () => void;
  isAdminView?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenProfile,
  onOpenSos,
  onOpenPortal,
  onOpenSettings,
  onOpenAdmin,
  isAdminView = false
}) => {
  const { profile, switchPhase, financials } = useNysc();
  const { isOnline, lastSynced } = useOnlineStatus();

  const phases: { key: NyscPhase; label: string; icon: string }[] = [
    { key: 'PCM', label: 'PCM', icon: '🎓' },
    { key: 'CAMP', label: 'Camp', icon: '🏕️' },
    { key: 'ACTIVE', label: 'Active', icon: '🎖️' },
    { key: 'POP', label: 'POP', icon: '🏆' }
  ];

  // Calculate days until next alawee alert (around 28th of month)
  const today = new Date();
  const currentDay = today.getDate();
  const daysUntilAlawee = currentDay <= 28 ? 28 - currentDay : 30 - currentDay + 28;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          
          {/* Brand Logo & Name with NYSC Green (#008751) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#005a36] to-[#008751] flex items-center justify-center shadow-lg shadow-[#008751]/25 text-white font-extrabold text-base sm:text-lg tracking-wider border border-[#008751]/40 shrink-0">
              NYSC
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-sm sm:text-lg text-white tracking-tight">
                  My NYSC Companion
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#008751]/15 text-[#008751] border border-[#008751]/30">
                  {profile.batch_stream}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
                Service & Humility • Progressive Web App
              </p>
            </div>
          </div>

          {/* Quick Header Actions: Portal Link, Sync Indicator, Settings Gear, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Quick Portal Link Button opening portal.nysc.org.ng */}
            <button
              onClick={onOpenPortal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#008751]/15 hover:bg-[#008751]/25 text-emerald-300 border border-[#008751]/40 text-xs font-bold transition-all hover:scale-102 active:scale-95"
              title="Open Official NYSC Portal (portal.nysc.org.ng)"
            >
              <Globe className="w-3.5 h-3.5 text-[#008751]" />
              <span className="hidden xs:inline">NYSC Portal</span>
            </button>

            {/* Sync Indicator (🟢 Online / 🔴 Offline Local Storage Status) */}
            <div
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                isOnline
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/30 text-red-300'
              }`}
              title={
                isOnline
                  ? `🟢 Online • Local Storage Synced at ${lastSynced.toLocaleTimeString()}`
                  : '🔴 Offline • Operating on Cached Local Storage'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span className="hidden sm:inline font-mono">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Alawee Countdown Pill */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>
                ₦{(financials.federal_alawee || 77000).toLocaleString()}{' '}
                <span className="text-amber-400/70 font-normal">
                  in {daysUntilAlawee === 0 ? 'Today!' : `${daysUntilAlawee}d`}
                </span>
              </span>
            </div>

            {/* Quick SOS Trigger */}
            <button
              onClick={onOpenSos}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
              title="Emergency SOS & Hotlines"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-bounce" />
              <span className="hidden md:inline">SOS</span>
            </button>

            {/* Creator Admin Control Panel button (/admin) */}
            {profile.is_admin && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isAdminView
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 hover:scale-102'
                }`}
                title="Creator & Admin Control Panel (/admin)"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* Settings Gear Icon (⚙️) triggering Settings Modal */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all hover:rotate-45"
              title="Settings & PWA Preferences"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 text-slate-200" />
            </button>

            {/* Profile Avatar Trigger */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all text-left"
              title="View & Edit Profile"
            >
              <img
                src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                alt={profile.full_name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-2 ring-[#008751]/50"
              />
              <div className="hidden lg:block">
                <div className="text-xs font-bold text-slate-200 truncate max-w-[100px]">
                  {profile.full_name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-[#008751] font-mono">
                  {profile.state_code || 'LA/26A'}
                </div>
              </div>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
