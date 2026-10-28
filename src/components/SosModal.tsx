import React from 'react';
import { useNysc } from '../context/NyscContext';
import {
  ShieldAlert,
  PhoneCall,
  X,
  AlertTriangle,
  MapPin,
  Award,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose }) => {
  const { profile, emergencyContacts } = useNysc();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-red-500/50 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl shadow-red-950/80 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-600/30 text-red-400 flex items-center justify-center border border-red-500/40">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                NYSC Emergency SOS Hotlines
              </h2>
              <p className="text-xs text-red-300">
                24/7 Corps Member Distress & Security Intervention
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Identity Reference for Reporting */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
          <div className="text-slate-400 font-medium">State clearly when calling security or NYSC:</div>
          <div className="text-white font-bold text-sm">
            Corper {profile.full_name}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-slate-300 font-mono text-[11px] pt-0.5">
            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              State Code: {profile.state_code || 'LA/26A/4819'}
            </span>
            <span>•</span>
            <span>{profile.state_of_deployment} State ({profile.lga} LGA)</span>
          </div>
        </div>

        {/* Direct One-Tap Call Buttons */}
        <div className="space-y-3">
          
          {/* National Toll-Free Call Centre */}
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-600/50 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-red-400 uppercase tracking-wide">
                National Distress Toll-Free
              </div>
              <div className="text-sm font-extrabold text-white">
                NYSC Headquarters Desk
              </div>
              <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                08033107873
              </div>
            </div>

            <a
              href="tel:08033107873"
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-950/60 transition-all hover:scale-105 active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Now</span>
            </a>
          </div>

          {/* Additional Seeded Contacts */}
          {emergencyContacts.map(c => (
            <div
              key={c.id}
              className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-3"
            >
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  {c.role_title}
                </div>
                <div className="text-xs font-bold text-slate-200">
                  {c.contact_name}
                </div>
                <div className="text-xs font-mono text-emerald-400">
                  {c.phone_number}
                </div>
              </div>

              <a
                href={`tel:${c.phone_number.replace(/[^0-9]/g, '')}`}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call</span>
              </a>
            </div>
          ))}

        </div>

        {/* Safety Guidelines */}
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-200 space-y-1">
          <div className="font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Essential Travel & Safety Protocol</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            NYSC policy strictly prohibits night travel after 06:00 PM. If stuck while traveling, seek refuge at the nearest military barracks, police command, NYSC secretariat, or Corpers Lodge.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
          >
            Close Emergency Window
          </button>
        </div>

      </div>
    </div>
  );
};
