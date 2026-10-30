import React, { useState } from 'react';
import { useNysc } from '../../context/NyscContext';
import { PpaWorkLog } from '../../types/nysc';
import {
  Briefcase,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Copy,
  Check,
  Download,
  Printer,
  FileText,
  Building2,
  Tag,
  CheckCircle2,
  ExternalLink,
  Award,
  GraduationCap
} from 'lucide-react';

import { exportCvToPdf } from '../../lib/pdfExport';

export const PpaAchievementCvView: React.FC = () => {
  const {
    profile,
    ppaWorkLogs,
    addPpaWorkLog,
    deletePpaWorkLog,
    saedNotes,
    fireConfetti
  } = useNysc();

  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [achievementText, setAchievementText] = useState('');
  const [skillTagsInput, setSkillTagsInput] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [copiedCv, setCopiedCv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Suggested STAR action verbs for Nigerian CVs
  const starActionVerbs = [
    'Spearheaded',
    'Automated',
    'Engineered',
    'Trained',
    'Optimized',
    'Facilitated',
    'Restructured',
    'Negotiated'
  ];

  const handleAddVerb = (verb: string) => {
    if (!achievementText) {
      setAchievementText(`${verb} `);
    } else {
      setAchievementText((prev) => `${prev} ${verb} `);
    }
  };

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementText.trim()) return;

    const tags = skillTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addPpaWorkLog({
      achievement_text: achievementText.trim(),
      skill_tags: tags.length > 0 ? tags : ['Project Management', 'Problem Solving'],
      log_date: logDate
    });

    setAchievementText('');
    setSkillTagsInput('');
    setIsAddingAchievement(false);
    fireConfetti();
  };

  // Compile SAED and PPA skills
  const compiledSkills = Array.from(
    new Set([
      ...ppaWorkLogs.flatMap((l) => l.skill_tags || []),
      ...saedNotes.map((n) => n.skill_category),
      'Analytical Thinking',
      'Team Leadership',
      'Microsoft Office'
    ])
  );

  // Generate plain text CV for copy / text download
  const generatePlainTextCv = () => {
    return `
================================================================================
CURRICULUM VITAE - ${profile.full_name.toUpperCase()}
================================================================================
State of Deployment: ${profile.state_of_deployment} State (${profile.lga} LGA)
NYSC State Code: ${profile.state_code || 'LA/26A/4819'} | Batch: ${profile.batch_stream}
Phone: ${profile.phone} | Status: Serving Corps Member

--------------------------------------------------------------------------------
CAREER SUMMARY
--------------------------------------------------------------------------------
Proactive, results-driven professional currently fulfilling the mandatory National
Youth Service Corps (NYSC) scheme at ${profile.ppa_name}. Proven track record of
delivering measurable organizational efficiency, curriculum development, and technical
project facilitation. Actively seeking graduate career placement post-service.

--------------------------------------------------------------------------------
PLACE OF PRIMARY ASSIGNMENT (PPA) EXPERIENCE
--------------------------------------------------------------------------------
NYSC Graduate Intern / Project Assistant
${profile.ppa_name} — ${profile.state_of_deployment}, Nigeria
Duration: ${profile.swearing_in_date || '2026-03'} to ${profile.pop_date || '2027-02'}

Key Accomplishments & Impact:
${ppaWorkLogs
  .map((log) => `• [${log.log_date}] ${log.achievement_text}`)
  .join('\n')}

--------------------------------------------------------------------------------
VOCATIONAL & TECHNICAL EXPERTISE (SAED & PROFESSIONAL SKILLS)
--------------------------------------------------------------------------------
${compiledSkills.map((s) => `• ${s}`).join('\n')}

--------------------------------------------------------------------------------
COMMUNITY DEVELOPMENT SERVICE (CDS)
--------------------------------------------------------------------------------
Active Group Member — ${profile.cds_group}
LGA Secretariat, ${profile.lga}, ${profile.state_of_deployment} State
Participated in weekly grassroots outreach, educational advocacy, and local sensitization rallies.

--------------------------------------------------------------------------------
EDUCATION & CREDENTIALS
--------------------------------------------------------------------------------
• National Youth Service Corps (NYSC) Discharge Certificate (In-View: ${profile.pop_date})
• Bachelor's Degree / Higher National Diploma (Second Class Upper Honours)
================================================================================
`.trim();
  };

  const handleCopyCv = () => {
    const text = generatePlainTextCv();
    navigator.clipboard.writeText(text);
    setCopiedCv(true);
    fireConfetti();
    setTimeout(() => setCopiedCv(false), 3000);
  };

  const handleDownloadTxt = () => {
    const text = generatePlainTextCv();
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${profile.full_name.replace(/\s+/g, '_')}_NYSC_CV_Draft.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    fireConfetti();
    setExportSuccessMessage('CV Draft downloaded as text (.txt) file!');
    setTimeout(() => setExportSuccessMessage(null), 4000);
  };

  const handleExportPdf = () => {
    try {
      setIsExportingPdf(true);
      exportCvToPdf(profile, ppaWorkLogs, compiledSkills);
      fireConfetti();
      setExportSuccessMessage('ATS-Ready CV exported successfully as PDF!');
      setTimeout(() => setExportSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to export CV to PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Action Buttons */}
      <div className="bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-[#008751]" />
              <span>PPA Work Log & Auto-CV Generator</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#008751]/20 text-emerald-300 border border-[#008751]/30 font-mono uppercase">
              ATS-Optimized
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Log quantifiable PPA accomplishments during your 11 months of service. Automatically compile an exportable, professional CV draft ready for post-NYSC employers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleCopyCv}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
            title="Copy CV text to clipboard"
          >
            {copiedCv ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
            <span>{copiedCv ? 'Copied CV!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all hover:scale-102"
            title="Download plain text CV (.txt)"
          >
            <FileText className="w-4 h-4 text-slate-300" />
            <span>.TXT</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all hover:scale-102"
            title="Download formatted ATS CV as PDF"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'Exporting...' : 'Export PDF'}</span>
          </button>

          <button
            onClick={() => setIsAddingAchievement(true)}
            className="px-3.5 py-2 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#008751]/25 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Log Milestone</span>
          </button>
        </div>
      </div>

      {/* Export Success Banner */}
      {exportSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportSuccessMessage}</span>
        </div>
      )}

      {/* Grid: Left Column (Accomplishment Tracker) & Right Column (Live ATS CV Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Bullet Point Tracker (5 Columns) */}
        <div className="lg:col-span-5 space-y-4 print:hidden">
          
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Logged PPA Milestones ({ppaWorkLogs.length})</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {profile.ppa_name}
                </p>
              </div>

              <button
                onClick={() => setIsAddingAchievement(true)}
                className="p-1.5 rounded-lg bg-[#008751]/20 hover:bg-[#008751]/30 text-emerald-300 border border-[#008751]/30"
                title="Add new bullet point"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List of Logged Bullets */}
            <div className="space-y-3">
              {ppaWorkLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-[#008751]/40 transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#008751]" />
                      <span>{log.log_date}</span>
                    </span>

                    <button
                      onClick={() => deletePpaWorkLog(log.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all"
                      title="Delete bullet point"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {log.achievement_text}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {log.skill_tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-800 text-[9px] font-semibold text-slate-400 border border-slate-700/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Auto-Generated CV Draft (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-slate-900/95 rounded-3xl border border-slate-800 p-4 sm:p-6 md:p-8 space-y-6 shadow-2xl print:bg-white print:text-slate-900 print:border-none print:p-0 print:shadow-none">
            
            {/* Header: Candidate Info */}
            <div className="border-b-2 border-slate-700 print:border-slate-800 pb-4 space-y-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white print:text-slate-900 uppercase tracking-tight">
                  {profile.full_name}
                </h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-[#008751]/20 text-emerald-300 border border-[#008751]/30 print:bg-slate-100 print:text-slate-800 font-mono self-center sm:self-auto">
                  NYSC: {profile.state_code || 'LA/26A/4819'}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-slate-400 print:text-slate-600 font-mono">
                <span>{profile.phone}</span>
                <span>•</span>
                <span>{profile.state_of_deployment} State ({profile.lga} LGA)</span>
                <span>•</span>
                <span>{profile.batch_stream}</span>
              </div>
            </div>

            {/* Section 1: Professional Summary */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#008751] print:text-emerald-800 border-b border-slate-800 print:border-slate-300 pb-1">
                Executive Professional Summary
              </h3>
              <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
                Motivated and adaptable young Nigerian graduate currently fulfilling mandatory national service at{' '}
                <strong>{profile.ppa_name}</strong>. Combines strong vocational training in SAED modules with proven track record of process automation, community advocacy, and classroom instruction. Prepared for entry-level trainee and associate corporate roles.
              </p>
            </div>

            {/* Section 2: PPA Work Experience */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#008751] print:text-emerald-800">
                  NYSC Place of Primary Assignment (PPA)
                </h3>
                <span className="text-[10px] font-mono text-slate-400 print:text-slate-500">
                  {profile.swearing_in_date || 'Mar 2026'} – {profile.pop_date || 'Feb 2027'} (In-Service)
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-white print:text-slate-900">
                    Graduate Trainee / Educational Associate
                  </h4>
                  <span className="text-[11px] text-slate-400 print:text-slate-600">
                    {profile.state_of_deployment}, Nigeria
                  </span>
                </div>
                <div className="text-xs font-semibold text-emerald-400 print:text-emerald-700">
                  {profile.ppa_name}
                </div>
              </div>

              {/* Dynamic Accomplishments from Tracker */}
              <ul className="space-y-1.5 text-xs text-slate-300 print:text-slate-700 list-disc list-outside pl-4 leading-relaxed">
                {ppaWorkLogs.map((log) => (
                  <li key={log.id} className="pl-1">
                    {log.achievement_text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 3: Skills & Competencies */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#008751] print:text-emerald-800 border-b border-slate-800 print:border-slate-300 pb-1">
                Skills & Technical Competencies (SAED & Work)
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {compiledSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 print:bg-slate-100 text-slate-200 print:text-slate-800 text-[11px] font-semibold border border-slate-700/60 print:border-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Section 4: CDS & Community Impact */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#008751] print:text-emerald-800 border-b border-slate-800 print:border-slate-300 pb-1">
                Community Development Service (CDS)
              </h3>
              <div className="text-xs text-slate-300 print:text-slate-700">
                <strong>{profile.cds_group}</strong> — Active Member & Outreach Facilitator
                <p className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">
                  Engaged in weekly community projects, school sensitization drives, and public welfare campaigns at the {profile.lga} Local Government Secretariat.
                </p>
              </div>
            </div>

            {/* Actions Footer inside preview */}
            <div className="pt-4 border-t border-slate-800 print:hidden flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-slate-400">
                Auto-synced with your live PPA entries.
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadTxt}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .txt</span>
                </button>

                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="px-4 py-1.5 rounded-xl bg-[#008751] hover:bg-[#006f43] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#008751]/25 transition-all hover:scale-102"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPdf ? 'Generating...' : 'Export PDF'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Log Achievement Modal */}
      {isAddingAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Log PPA Bullet Accomplishment</span>
              </h3>
              <button
                onClick={() => setIsAddingAchievement(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Action Verbs Helper */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Start with a STAR action verb:
              </span>
              <div className="flex flex-wrap gap-1">
                {starActionVerbs.map((verb) => (
                  <button
                    key={verb}
                    type="button"
                    onClick={() => handleAddVerb(verb)}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-[#008751] hover:text-white text-slate-300 text-[10px] font-semibold border border-slate-700 transition-colors"
                  >
                    +{verb}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddAchievement} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Accomplishment Description (What you did & the measurable outcome)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Spearheaded digitizing student records for 850 pupils, cutting grade processing time by 40%..."
                  value={achievementText}
                  onChange={(e) => setAchievementText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Skills Demonstrated (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Data Analysis, Process Optimization"
                    value={skillTagsInput}
                    onChange={(e) => setSkillTagsInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Date Logged
                  </label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#008751]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingAchievement(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white font-bold shadow-md shadow-[#008751]/30"
                >
                  Add to CV Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
