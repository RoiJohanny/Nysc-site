import React, { useState } from 'react';
import { useNysc } from '../context/NyscContext';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Award,
  AlertTriangle,
  Info,
  Sparkles,
  FileCheck,
  Fingerprint,
  Building2,
  Wallet,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

export const ClearanceCdsHubView: React.FC = () => {
  const {
    profile,
    locationSchedule,
    clearances,
    toggleClearanceItem,
    addClearanceMonth,
    cdsLogs,
    addCdsLog,
    deleteCdsLog,
    fireConfetti
  } = useNysc();

  const [activeTab, setActiveTab] = useState<'clearance' | 'cds'>('clearance');
  const [isAddingCds, setIsAddingCds] = useState(false);
  const [newMonthInput, setNewMonthInput] = useState('');

  // Form state for CDS Log
  const [cdsDate, setCdsDate] = useState(new Date().toISOString().split('T')[0]);
  const [cdsTopic, setCdsTopic] = useState('');
  const [cdsDues, setCdsDues] = useState('500');
  const [cdsNotes, setCdsNotes] = useState('');
  const [cdsStatus, setCdsStatus] = useState<'Present' | 'Excused' | 'Absent'>('Present');

  // CDS Stats
  const totalCdsMeetings = cdsLogs.length;
  const presentMeetings = cdsLogs.filter(l => l.attendance_status === 'Present').length;
  const attendanceRate = totalCdsMeetings > 0 ? Math.round((presentMeetings / totalCdsMeetings) * 100) : 100;
  const totalDuesPaid = cdsLogs.reduce((sum, l) => sum + Number(l.dues_paid || 0), 0);

  const handleAddCdsLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cdsTopic.trim()) return;

    addCdsLog({
      meeting_date: cdsDate,
      topic: cdsTopic.trim(),
      dues_paid: Number(cdsDues || 0),
      notes: cdsNotes.trim(),
      attendance_status: cdsStatus
    });

    setCdsTopic('');
    setCdsNotes('');
    setIsAddingCds(false);
    fireConfetti();
  };

  const handleAddNewMonth = () => {
    if (!newMonthInput.trim()) return;
    addClearanceMonth(newMonthInput.trim());
    setNewMonthInput('');
    fireConfetti();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Clearance & CDS Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">
              {profile.lga} LGA Secretariat
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track biometric clearance milestones, PPA monthly evaluations, and weekly Community Development Service records.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('clearance')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'clearance'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>Biometric Clearance</span>
          </button>
          <button
            onClick={() => setActiveTab('cds')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'cds'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>CDS Logbook</span>
          </button>
        </div>
      </div>

      {activeTab === 'clearance' ? (
        <div className="space-y-6">
          
          {/* Rules / Important Notice */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Official NYSC Monthly Clearance Guideline:</span> Biometric clearance thumbprinting opens between the 1st and 25th of every month. Missing monthly biometrics without official LGI excuse results in an extension of service or stoppage of ₦77,000 allowance!
              </div>
            </div>
            <a
              href="https://portal.nysc.org.ng/NYSC1/Default.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-bold shrink-0 flex items-center gap-1.5 text-[11px] transition-all hover:scale-102"
              title="Open Official NYSC Portal for Biometrics & Profile Status"
            >
              <span>NYSC Portal Login</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
            </a>
          </div>

          {/* Add Future Month Form */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Need to add next service month? (e.g. 2026-11, 2026-12)
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="YYYY-MM (e.g. 2026-11)"
                value={newMonthInput}
                onChange={e => setNewMonthInput(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-emerald-500 flex-1 sm:w-40"
              />
              <button
                onClick={handleAddNewMonth}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Month</span>
              </button>
            </div>
          </div>

          {/* Clearance Cards by Month */}
          <div className="space-y-4">
            {clearances.map((c) => {
              const isFullyCleared =
                c.ppa_letter_signed && c.lgi_approval && c.biometrics_completed && c.payment_received;
              
              const completedCount = [
                c.ppa_letter_signed,
                c.lgi_approval,
                c.biometrics_completed,
                c.payment_received
              ].filter(Boolean).length;

              return (
                <div
                  key={c.id}
                  className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-extrabold flex items-center justify-center font-mono text-xs">
                        {c.month_year.split('-')[1]}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          Clearance Month: {c.month_year}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {c.notes || 'Routine monthly inspection at Local Government Secretariat.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-300">
                        {completedCount} / 4 Milestones
                      </span>
                      {isFullyCleared ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Fully Cleared & Paid</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4 Interactive Milestones */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    
                    {/* 1. PPA Letter */}
                    <div
                      onClick={() => toggleClearanceItem(c.month_year, 'ppa_letter_signed')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                        c.ppa_letter_signed
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <FileCheck className={`w-4 h-4 ${c.ppa_letter_signed ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <input
                          type="checkbox"
                          checked={c.ppa_letter_signed}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer accent-emerald-500"
                        />
                      </div>
                      <div className="text-xs font-bold text-slate-200">
                        1. PPA Letter Signed
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Signed & stamped by Principal or Employer.
                      </p>
                    </div>

                    {/* 2. LGI Signoff */}
                    <div
                      onClick={() => toggleClearanceItem(c.month_year, 'lgi_approval')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                        c.lgi_approval
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Building2 className={`w-4 h-4 ${c.lgi_approval ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <input
                          type="checkbox"
                          checked={c.lgi_approval}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer accent-emerald-500"
                        />
                      </div>
                      <div className="text-xs font-bold text-slate-200">
                        2. LGI Approval
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Signed by Local Government Inspector.
                      </p>
                    </div>

                    {/* 3. Biometrics Thumbprint */}
                    <div
                      onClick={() => toggleClearanceItem(c.month_year, 'biometrics_completed')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                        c.biometrics_completed
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Fingerprint className={`w-4 h-4 ${c.biometrics_completed ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <input
                          type="checkbox"
                          checked={c.biometrics_completed}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer accent-emerald-500"
                        />
                      </div>
                      <div className="text-xs font-bold text-slate-200">
                        3. Biometrics Captured
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Thumbprint captured at LGA portal.
                      </p>
                    </div>

                    {/* 4. Payment Alert */}
                    <div
                      onClick={() => toggleClearanceItem(c.month_year, 'payment_received')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                        c.payment_received
                          ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Wallet className={`w-4 h-4 ${c.payment_received ? 'text-amber-400' : 'text-slate-500'}`} />
                        <input
                          type="checkbox"
                          checked={c.payment_received}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
                        />
                      </div>
                      <div className="text-xs font-bold text-amber-300">
                        4. Payment Verified
                      </div>
                      <p className="text-[10px] text-slate-400">
                        ₦77,000 monthly alawee credited to bank account.
                      </p>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* CDS Logbook Tab */
        <div className="space-y-6">
          
          {/* CDS Group Header Card */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Assigned Group
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-400">
                  Meets every {locationSchedule.cds_meeting_day} @ {locationSchedule.cds_meeting_time || '09:00 AM'}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white">
                {profile.cds_group}
              </h2>
              <p className="text-xs text-slate-400">
                Venue: {locationSchedule.cds_address_notes || 'LGA Secretariat Main Hall'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="text-left sm:text-right">
                <div className="text-xs text-slate-400">Attendance Rate</div>
                <div className="text-lg sm:text-xl font-extrabold text-emerald-400">{attendanceRate}%</div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xs text-slate-400">Total Dues Paid</div>
                <div className="text-lg sm:text-xl font-extrabold text-white font-mono">₦{totalDuesPaid.toLocaleString()}</div>
              </div>
              <button
                onClick={() => setIsAddingCds(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Log Meeting</span>
              </button>
            </div>
          </div>

          {/* Meeting Logs List */}
          <div className="space-y-3">
            {cdsLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-md"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      {log.meeting_date}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.attendance_status === 'Present'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : log.attendance_status === 'Excused'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {log.attendance_status}
                    </span>
                    {log.dues_paid > 0 && (
                      <span className="text-[11px] font-mono text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                        ₦{log.dues_paid} Dues Paid
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white">
                    {log.topic}
                  </h4>

                  {log.notes && (
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {log.notes}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => deleteCdsLog(log.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors self-end sm:self-center"
                  title="Delete log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Log CDS Meeting Modal */}
      {isAddingCds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Log CDS Meeting & Dues
            </h3>

            <form onSubmit={handleAddCdsLog} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Meeting Date
                </label>
                <input
                  type="date"
                  value={cdsDate}
                  onChange={e => setCdsDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Meeting Topic / Outreach Project
                </label>
                <input
                  type="text"
                  placeholder="e.g. Health outreach to local secondary school"
                  value={cdsTopic}
                  onChange={e => setCdsTopic(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Attendance
                  </label>
                  <select
                    value={cdsStatus}
                    onChange={e => setCdsStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Present">Present</option>
                    <option value="Excused">Excused (Official)</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Dues Paid (₦)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={cdsDues}
                    onChange={e => setCdsDues(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Minutes / Personal Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Key resolutions, committee assignments, next week venue..."
                  value={cdsNotes}
                  onChange={e => setCdsNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingCds(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-950/50"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
