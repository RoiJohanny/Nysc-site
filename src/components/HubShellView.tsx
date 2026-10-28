import React, { useState } from 'react';
import { useNysc } from '../context/NyscContext';
import { GeolocationMap } from './hub/GeolocationMap';
import { EditLocationScheduleModal } from './hub/EditLocationScheduleModal';
import { ClearanceCdsHubView } from './ClearanceCdsHubView';
import { DocumentVaultView } from './DocumentVaultView';
import { GoogleCalendarSyncView } from './hub/GoogleCalendarSyncView';
import {
  Navigation,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Layers,
  Edit2,
  MapPin,
  ExternalLink,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';

interface HubShellViewProps {
  initialSubModule?: 'all' | 'map' | 'clearance' | 'vault' | 'cds' | 'calendar';
}

export const HubShellView: React.FC<HubShellViewProps> = ({ initialSubModule = 'all' }) => {
  const { profile, locationSchedule } = useNysc();
  const [activeSubModule, setActiveSubModule] = useState<'all' | 'map' | 'clearance' | 'vault' | 'cds' | 'calendar'>(
    initialSubModule
  );
  const [isEditLocationOpen, setIsEditLocationOpen] = useState(false);

  const subModules = [
    { id: 'all', label: 'All Modules', icon: Layers, desc: 'Map, Clearance & Locker' },
    { id: 'map', label: 'Google Maps', icon: Navigation, desc: 'PPA & CDS Geolocation' },
    { id: 'calendar', label: 'Google Calendar', icon: Calendar, desc: 'Sync CDS & Clearance' },
    { id: 'clearance', label: 'Biometrics', icon: CheckCircle2, desc: 'Clearance Checklist' },
    { id: 'vault', label: 'Doc Locker', icon: ShieldCheck, desc: 'Encrypted Vault' },
    { id: 'cds', label: 'CDS Logbook', icon: Sparkles, desc: 'Meetings & Dues' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Hub Header & Status Bar */}
      <div className="bg-slate-900/95 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Decorative NYSC Green Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#008751]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#008751]/20 text-emerald-300 border border-[#008751]/30 flex items-center gap-1 font-mono">
                <MapPin className="w-3 h-3 text-[#008751]" />
                <span>{profile.state_of_deployment} • {profile.lga} LGA</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                {profile.state_code || 'LA/26A/4819'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {profile.cds_group}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>🗺️ Service Hub & Official Logistics</span>
            </h1>

            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Interactive Leaflet routing between your PPA & CDS venue, monthly biometric clearance milestone tracker, and AES-256 encrypted official documents locker.
            </p>
          </div>

          {/* Quick Action Button to Edit Coordinates / Schedule */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditLocationOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#008751]/25 transition-all hover:scale-102 active:scale-98"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Location / Schedule</span>
            </button>
          </div>
        </div>

        {/* Quick Nav Segmented Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 mt-5 pt-4 border-t border-slate-800/80">
          {subModules.map(module => {
            const Icon = module.icon;
            const isActive = activeSubModule === module.id;
            return (
              <button
                key={module.id}
                onClick={() => setActiveSubModule(module.id as any)}
                className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-[#008751] text-white shadow-lg shadow-[#008751]/30 font-bold'
                    : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/40'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-700/60 text-[#008751]'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold truncate">{module.label}</div>
                  <div className={`text-[10px] hidden sm:block truncate ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {module.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER VIEW ACCORDING TO SELECTED SUBMODULE */}
      
      {/* 1. ALL-IN-ONE COMPLETE HUB (Displays Map + Biometric Clearance + Encrypted Locker in order) */}
      {activeSubModule === 'all' && (
        <div className="space-y-8">
          
          {/* Pillar 1: Interactive Geolocation Map (Leaflet) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#008751]/20 text-[#008751] flex items-center justify-center font-black text-xs">
                  1
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Interactive Geolocation Map & Routing
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Auto-centered on {profile.state_of_deployment} State
              </span>
            </div>

            <GeolocationMap
              stateName={profile.state_of_deployment || 'Lagos'}
              lgaName={profile.lga || 'Ikeja'}
              ppaName={profile.ppa_name || 'Primary Place of Assignment'}
              ppaAddress={profile.ppa_address || 'PPA Address'}
              ppaLat={locationSchedule.ppa_latitude || 6.5925}
              ppaLng={locationSchedule.ppa_longitude || 3.3444}
              ppaNotes={locationSchedule.ppa_address_notes}
              cdsGroup={profile.cds_group || 'CDS Group'}
              cdsAddress={locationSchedule.cds_address_notes || 'LGA Secretariat Main Hall'}
              cdsLat={locationSchedule.cds_latitude || 6.5982}
              cdsLng={locationSchedule.cds_longitude || 3.3401}
              cdsMeetingDay={locationSchedule.cds_meeting_day || 'Thursday'}
              cdsMeetingTime={locationSchedule.cds_meeting_time || '09:00 AM'}
              transitFareNotes={locationSchedule.transit_fare_notes}
              onOpenEditModal={() => setIsEditLocationOpen(true)}
            />
          </section>

          {/* Pillar 2: Biometric Clearance Checklist (PPA Letter Signed -> LGI Approval -> Biometrics Captured -> Payment Verified) */}
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                  2
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Biometric Clearance Milestone Checklist
                </h2>
              </div>
              <button
                onClick={() => setActiveSubModule('clearance')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                Expand View & History →
              </button>
            </div>

            <ClearanceCdsHubView />
          </section>

          {/* Pillar 3: Encrypted Document Locker (Call-Up Letter, Green Card, PPA Acceptance, NYSC ID) */}
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xs">
                  3
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Encrypted Document Locker (AES-256)
                </h2>
              </div>
              <button
                onClick={() => setActiveSubModule('vault')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                Manage Vault Documents →
              </button>
            </div>

            <DocumentVaultView />
          </section>

          {/* Pillar 4: Google Calendar Synchronization */}
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-xs">
                  4
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Google Calendar NYSC Sync & Schedule
                </h2>
              </div>
              <button
                onClick={() => setActiveSubModule('calendar')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                Expand Calendar Hub →
              </button>
            </div>

            <GoogleCalendarSyncView />
          </section>

        </div>
      )}

      {/* 2. FOCUSED GOOGLE CALENDAR VIEW */}
      {activeSubModule === 'calendar' && (
        <div className="space-y-6">
          <GoogleCalendarSyncView />
        </div>
      )}

      {/* 2. FOCUSED GEOLOCATION MAP VIEW */}
      {activeSubModule === 'map' && (
        <div className="space-y-6">
          <GeolocationMap
            stateName={profile.state_of_deployment || 'Lagos'}
            lgaName={profile.lga || 'Ikeja'}
            ppaName={profile.ppa_name || 'Primary Place of Assignment'}
            ppaAddress={profile.ppa_address || 'PPA Address'}
            ppaLat={locationSchedule.ppa_latitude || 6.5925}
            ppaLng={locationSchedule.ppa_longitude || 3.3444}
            ppaNotes={locationSchedule.ppa_address_notes}
            cdsGroup={profile.cds_group || 'CDS Group'}
            cdsAddress={locationSchedule.cds_address_notes || 'LGA Secretariat Main Hall'}
            cdsLat={locationSchedule.cds_latitude || 6.5982}
            cdsLng={locationSchedule.cds_longitude || 3.3401}
            cdsMeetingDay={locationSchedule.cds_meeting_day || 'Thursday'}
            cdsMeetingTime={locationSchedule.cds_meeting_time || '09:00 AM'}
            transitFareNotes={locationSchedule.transit_fare_notes}
            onOpenEditModal={() => setIsEditLocationOpen(true)}
          />
        </div>
      )}

      {/* 3. FOCUSED BIOMETRIC CLEARANCE VIEW */}
      {activeSubModule === 'clearance' && (
        <div className="space-y-6">
          <ClearanceCdsHubView />
        </div>
      )}

      {/* 4. FOCUSED DOCUMENT VAULT VIEW */}
      {activeSubModule === 'vault' && (
        <div className="space-y-6">
          <DocumentVaultView />
        </div>
      )}

      {/* 5. FOCUSED CDS LOGBOOK VIEW */}
      {activeSubModule === 'cds' && (
        <div className="space-y-6">
          <ClearanceCdsHubView />
        </div>
      )}

      {/* Edit Location & Schedule Modal */}
      <EditLocationScheduleModal
        isOpen={isEditLocationOpen}
        onClose={() => setIsEditLocationOpen(false)}
      />

    </div>
  );
};
