import React, { useState, useEffect } from 'react';
import { useNysc } from '../../context/NyscContext';
import {
  NyscCalendarEvent,
  generateDefaultNyscEvents,
  createGoogleCalendarTemplateUrl,
  saveCalendarEventToFirestore,
  generateIcsCalendar
} from '../../lib/googleCalendar';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  CheckCircle2,
  CalendarCheck2,
  Sparkles,
  Repeat,
  Download,
  Check
} from 'lucide-react';

export const GoogleCalendarSyncView: React.FC = () => {
  const { profile, fireConfetti } = useNysc();
  const [events, setEvents] = useState<NyscCalendarEvent[]>([]);
  const [syncedIds, setSyncedIds] = useState<Record<string, boolean>>({});
  const [syncStatusBanner, setSyncStatusBanner] = useState<string | null>(null);

  useEffect(() => {
    const defaultEvents = generateDefaultNyscEvents(profile);
    setEvents(defaultEvents);
  }, [profile]);

  const handleRecordSync = async (event: NyscCalendarEvent) => {
    await saveCalendarEventToFirestore(profile.id, event);
    setSyncedIds(prev => ({ ...prev, [event.id]: true }));
  };

  const handleDownloadAllIcs = () => {
    const icsContent = generateIcsCalendar(events);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nysc_schedule_${profile.state_of_deployment.toLowerCase().replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Save all to Firestore
    events.forEach(ev => {
      saveCalendarEventToFirestore(profile.id, ev);
      setSyncedIds(prev => ({ ...prev, [ev.id]: true }));
    });

    fireConfetti();
    setSyncStatusBanner('NYSC Schedule (.ics) downloaded and synced to Firestore! Import into Google Calendar via Settings > Import.');
    setTimeout(() => setSyncStatusBanner(null), 6000);
  };

  return (
    <div className="bg-slate-900/95 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base">
                Google Calendar Sync & Schedule
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Google Workspace
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Synchronize weekly CDS meetings, biometric clearance windows, and milestone dates to your Google Calendar
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadAllIcs}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-950/50 transition-all hover:scale-102"
          >
            <Download className="w-4 h-4" />
            <span>Download All Events (.ics)</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatusBanner && (
        <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncStatusBanner}</span>
          </div>
          <button
            onClick={() => setSyncStatusBanner(null)}
            className="text-slate-400 hover:text-white text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {events.map(event => {
          const isSynced = syncedIds[event.id];
          const calendarUrl = createGoogleCalendarTemplateUrl(event);

          return (
            <div
              key={event.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      event.eventType === 'clearance'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : event.eventType === 'cds'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : event.eventType === 'pop'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {event.eventType === 'cds'
                      ? 'Weekly CDS'
                      : event.eventType === 'clearance'
                      ? 'Monthly Biometrics'
                      : event.eventType === 'pop'
                      ? 'POP Milestone'
                      : 'Milestone'}
                  </span>

                  {event.recurrenceRule && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Repeat className="w-3 h-3 text-slate-500" />
                      <span>Recurring</span>
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-white text-xs">{event.title}</h4>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                <div className="pt-1 space-y-1 text-[10px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric'
                      })}{' '}
                      •{' '}
                      {new Date(event.startDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Native Anchor Tag avoiding window.open */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {isSynced ? 'Saved & Synced' : '1-Tap Template'}
                </span>

                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleRecordSync(event)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isSynced
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 hover:scale-102'
                  }`}
                >
                  {isSynced ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Added to Google</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Add to Google Calendar</span>
                    </>
                  )}
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
