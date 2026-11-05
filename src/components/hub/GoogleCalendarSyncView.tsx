import React, { useState } from 'react';
import { useNysc } from '../../context/NyscContext';
import {
  NyscCalendarEvent,
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
  Repeat,
  Download,
  Check,
  Plus,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Tag
} from 'lucide-react';

export const GoogleCalendarSyncView: React.FC = () => {
  const {
    profile,
    calendarEvents,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    fireConfetti
  } = useNysc();

  const [syncedIds, setSyncedIds] = useState<Record<string, boolean>>({});
  const [syncStatusBanner, setSyncStatusBanner] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Modal State for Add / Edit Event
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndDate, setFormEndDate] = useState('');
  const [formEndTime, setFormEndTime] = useState('11:00');
  const [formEventType, setFormEventType] = useState<NyscCalendarEvent['eventType']>('cds');
  const [formRecurrence, setFormRecurrence] = useState<'none' | 'weekly' | 'monthly'>('none');

  const openAddModal = () => {
    setEditingEventId(null);
    const today = new Date().toISOString().split('T')[0];
    setFormTitle('');
    setFormDescription('');
    setFormLocation(`${profile.lga} NYSC Secretariat, ${profile.state_of_deployment}`);
    setFormStartDate(today);
    setFormStartTime('09:00');
    setFormEndDate(today);
    setFormEndTime('11:00');
    setFormEventType('cds');
    setFormRecurrence('none');
    setIsModalOpen(true);
  };

  const openEditModal = (event: NyscCalendarEvent) => {
    setEditingEventId(event.id);
    setFormTitle(event.title);
    setFormDescription(event.description || '');
    setFormLocation(event.location || '');
    setFormEventType(event.eventType);

    try {
      const sDate = new Date(event.startDate);
      setFormStartDate(sDate.toISOString().split('T')[0]);
      setFormStartTime(sDate.toTimeString().slice(0, 5));

      const eDate = new Date(event.endDate);
      setFormEndDate(eDate.toISOString().split('T')[0]);
      setFormEndTime(eDate.toTimeString().slice(0, 5));
    } catch {
      const today = new Date().toISOString().split('T')[0];
      setFormStartDate(today);
      setFormStartTime('09:00');
      setFormEndDate(today);
      setFormEndTime('11:00');
    }

    if (event.recurrenceRule?.includes('WEEKLY')) {
      setFormRecurrence('weekly');
    } else if (event.recurrenceRule?.includes('MONTHLY')) {
      setFormRecurrence('monthly');
    } else {
      setFormRecurrence('none');
    }

    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const startIso = new Date(`${formStartDate}T${formStartTime}:00`).toISOString();
    const endIso = new Date(`${formEndDate || formStartDate}T${formEndTime}:00`).toISOString();

    let recurrenceRule: string | undefined = undefined;
    if (formRecurrence === 'weekly') {
      recurrenceRule = 'RRULE:FREQ=WEEKLY';
    } else if (formRecurrence === 'monthly') {
      recurrenceRule = 'RRULE:FREQ=MONTHLY';
    }

    if (editingEventId) {
      updateCalendarEvent(editingEventId, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        location: formLocation.trim(),
        startDate: startIso,
        endDate: endIso,
        eventType: formEventType,
        recurrenceRule
      });
      setSyncStatusBanner(`Updated "${formTitle.trim()}" in calendar schedule!`);
    } else {
      addCalendarEvent({
        title: formTitle.trim(),
        description: formDescription.trim(),
        location: formLocation.trim(),
        startDate: startIso,
        endDate: endIso,
        eventType: formEventType,
        recurrenceRule
      });
      setSyncStatusBanner(`Added "${formTitle.trim()}" to calendar schedule!`);
    }

    setIsModalOpen(false);
    fireConfetti();
    setTimeout(() => setSyncStatusBanner(null), 5000);
  };

  const handleDeleteEvent = (id: string, title: string) => {
    deleteCalendarEvent(id);
    setSyncStatusBanner(`Removed "${title}" from calendar schedule.`);
    setTimeout(() => setSyncStatusBanner(null), 4000);
  };

  const handleRecordSync = async (event: NyscCalendarEvent) => {
    await saveCalendarEventToFirestore(profile.id, event);
    setSyncedIds(prev => ({ ...prev, [event.id]: true }));
  };

  const handleDownloadAllIcs = () => {
    const icsContent = generateIcsCalendar(calendarEvents);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nysc_schedule_${profile.state_of_deployment.toLowerCase().replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Save all to Firestore
    calendarEvents.forEach(ev => {
      saveCalendarEventToFirestore(profile.id, ev);
      setSyncedIds(prev => ({ ...prev, [ev.id]: true }));
    });

    fireConfetti();
    setSyncStatusBanner('NYSC Schedule (.ics) downloaded and synced to Firestore! Import into Google Calendar via Settings > Import.');
    setTimeout(() => setSyncStatusBanner(null), 6000);
  };

  const filteredEvents = calendarEvents.filter(ev => {
    if (filterType === 'all') return true;
    return ev.eventType === filterType;
  });

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
                Interactive Schedule & Google Calendar
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Customizable
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Add custom events, edit schedules, and sync CDS meetings, clearance, & milestones to Google Calendar.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openAddModal}
            className="px-3.5 py-2 rounded-xl bg-[#008751] hover:bg-[#007043] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>

          <button
            onClick={handleDownloadAllIcs}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-950/50 transition-all hover:scale-102"
          >
            <Download className="w-4 h-4" />
            <span>Download .ics</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: `All (${calendarEvents.length})` },
          { id: 'cds', label: 'CDS Meetings' },
          { id: 'clearance', label: 'Biometrics' },
          { id: 'ppa', label: 'PPA & Work' },
          { id: 'pop', label: 'POP / Milestone' },
          { id: 'custom', label: 'Custom' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
      {filteredEvents.length === 0 ? (
        <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <Calendar className="w-8 h-8 text-slate-500 mx-auto opacity-50" />
          <p className="text-xs text-slate-400">No events found in this category.</p>
          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredEvents.map(event => {
            const isSynced = syncedIds[event.id];
            const calendarUrl = createGoogleCalendarTemplateUrl(event);

            return (
              <div
                key={event.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
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
                          : event.eventType === 'ppa'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {event.eventType === 'cds'
                        ? 'Weekly CDS'
                        : event.eventType === 'clearance'
                        ? 'Monthly Biometrics'
                        : event.eventType === 'pop'
                        ? 'POP Milestone'
                        : event.eventType === 'ppa'
                        ? 'PPA / Work'
                        : 'Custom Event'}
                    </span>

                    <div className="flex items-center gap-1">
                      {event.recurrenceRule && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mr-1">
                          <Repeat className="w-3 h-3 text-slate-500" />
                          <span>Recurring</span>
                        </span>
                      )}

                      <button
                        onClick={() => openEditModal(event)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                        title="Edit event"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteEvent(event.id, event.title)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-bold text-white text-xs">{event.title}</h4>

                  {event.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  )}

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
                        {' - '}
                        {new Date(event.endDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
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
      )}

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-white text-base">
                  {editingEventId ? 'Edit Calendar Event' : 'Add New Schedule Event'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Environmental CDS Sanitization Outreach"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Event Type
                  </label>
                  <select
                    value={formEventType}
                    onChange={e => setFormEventType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="cds">Weekly CDS Meeting</option>
                    <option value="clearance">Monthly Biometrics</option>
                    <option value="ppa">PPA Work & Inspection</option>
                    <option value="pop">POP & Passing Out</option>
                    <option value="swearing_in">Orientation Camp</option>
                    <option value="custom">Custom / Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Recurrence
                  </label>
                  <select
                    value={formRecurrence}
                    onChange={e => setFormRecurrence(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="none">One-off Event</option>
                    <option value="weekly">Every Week</option>
                    <option value="monthly">Every Month</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Start Date & Time *</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      value={formStartDate}
                      onChange={e => setFormStartDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="time"
                      required
                      value={formStartTime}
                      onChange={e => setFormStartTime(e.target.value)}
                      className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">End Date & Time *</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      value={formEndDate}
                      onChange={e => setFormEndDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="time"
                      required
                      value={formEndTime}
                      onChange={e => setFormEndTime(e.target.value)}
                      className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Location / Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ikeja LGA Secretariat, Community Hall B"
                  value={formLocation}
                  onChange={e => setFormLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Event Description & Agenda
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes, required uniform, agenda, dues to pay, documents to bring..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-950/40"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingEventId ? 'Save Changes' : 'Create Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
