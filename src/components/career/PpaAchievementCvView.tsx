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
  GraduationCap,
  Pencil,
  Star,
  X,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

import { exportCvToPdf } from '../../lib/pdfExport';

export const PpaAchievementCvView: React.FC = () => {
  const {
    profile,
    ppaWorkLogs,
    addPpaWorkLog,
    updatePpaWorkLog,
    deletePpaWorkLog,
    saedNotes,
    fireConfetti
  } = useNysc();

  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [achievementText, setAchievementText] = useState('');
  const [skillTagsInput, setSkillTagsInput] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [copiedCv, setCopiedCv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Suggested STAR action verbs for Nigerian CVs
  const DEFAULT_STAR_VERBS = [
    'Spearheaded',
    'Automated',
    'Engineered',
    'Trained',
    'Optimized',
    'Facilitated',
    'Restructured',
    'Negotiated',
    'Pioneered',
    'Coordinated',
    'Implemented',
    'Streamlined'
  ];

  const [starActionVerbs, setStarActionVerbs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nysc_star_action_verbs');
      return saved ? JSON.parse(saved) : DEFAULT_STAR_VERBS;
    } catch {
      return DEFAULT_STAR_VERBS;
    }
  });

  const [isManagingVerbs, setIsManagingVerbs] = useState(false);
  const [customVerbInput, setCustomVerbInput] = useState('');

  const saveVerbsToStorage = (verbs: string[]) => {
    setStarActionVerbs(verbs);
    try {
      localStorage.setItem('nysc_star_action_verbs', JSON.stringify(verbs));
    } catch {}
  };

  const handleAddCustomVerb = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customVerbInput.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (!starActionVerbs.some((v) => v.toLowerCase() === formatted.toLowerCase())) {
      const updated = [...starActionVerbs, formatted];
      saveVerbsToStorage(updated);
    }
    setCustomVerbInput('');
  };

  const handleRemoveVerbFromBank = (verbToRemove: string) => {
    const updated = starActionVerbs.filter((v) => v.toLowerCase() !== verbToRemove.toLowerCase());
    saveVerbsToStorage(updated);
  };

  const handleResetVerbs = () => {
    saveVerbsToStorage(DEFAULT_STAR_VERBS);
  };

  // Helper to detect what STAR action verb starts the text
  const getLeadingVerb = (text: string, verbsList: string[]): string | null => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    for (const verb of verbsList) {
      const regex = new RegExp(`^${verb}\\b`, 'i');
      if (regex.test(trimmed)) {
        return verb;
      }
    }
    return null;
  };

  const detectedLeadingVerb = getLeadingVerb(achievementText, starActionVerbs);

  // Smart Add, Replace, or Remove starting STAR action verb
  const handleToggleStartVerb = (verb: string) => {
    const trimmed = achievementText.trim();
    if (!trimmed) {
      setAchievementText(`${verb} `);
      return;
    }

    // Check if it already starts with THIS exact verb (case-insensitive)
    const exactRegex = new RegExp(`^${verb}\\b\\s*`, 'i');
    if (exactRegex.test(trimmed)) {
      // Remove it from the start!
      const remainder = trimmed.replace(exactRegex, '');
      const capitalizedRemainder = remainder ? remainder.charAt(0).toUpperCase() + remainder.slice(1) : '';
      setAchievementText(capitalizedRemainder);
      return;
    }

    // Check if it starts with another verb from the bank
    const currentLeading = getLeadingVerb(trimmed, starActionVerbs);
    if (currentLeading) {
      // Replace leading verb cleanly
      const replaceRegex = new RegExp(`^${currentLeading}\\b\\s*`, 'i');
      const remainder = trimmed.replace(replaceRegex, '');
      const cleanRemainder = remainder ? remainder.charAt(0).toLowerCase() + remainder.slice(1) : '';
      setAchievementText(`${verb} ${cleanRemainder}`);
      return;
    }

    // Starts without a known verb - prepend it cleanly
    const firstWordMatch = trimmed.match(/^([a-zA-Z]+)(.*)/s);
    let formattedRemainder = trimmed;
    if (firstWordMatch) {
      const firstWord = firstWordMatch[1];
      if (firstWord !== firstWord.toUpperCase()) {
        formattedRemainder = firstWord.charAt(0).toLowerCase() + firstWord.slice(1) + firstWordMatch[2];
      }
    }
    setAchievementText(`${verb} ${formattedRemainder}`);
  };

  // Remove any leading verb from achievement text
  const handleRemoveLeadingVerb = () => {
    const trimmed = achievementText.trim();
    if (!trimmed) return;
    const currentLeading = getLeadingVerb(trimmed, starActionVerbs);
    if (currentLeading) {
      const regex = new RegExp(`^${currentLeading}\\b\\s*`, 'i');
      const remainder = trimmed.replace(regex, '');
      const capitalized = remainder ? remainder.charAt(0).toUpperCase() + remainder.slice(1) : '';
      setAchievementText(capitalized);
    } else {
      const match = trimmed.match(/^([a-zA-Z]+)\s*(.*)/s);
      if (match) {
        const remainder = match[2];
        const capitalized = remainder ? remainder.charAt(0).toUpperCase() + remainder.slice(1) : '';
        setAchievementText(capitalized);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingLogId(null);
    setAchievementText('');
    setSkillTagsInput('');
    setLogDate(new Date().toISOString().split('T')[0]);
    setIsAddingAchievement(true);
  };

  const handleStartEdit = (log: PpaWorkLog) => {
    setEditingLogId(log.id);
    setAchievementText(log.achievement_text);
    setSkillTagsInput(log.skill_tags.join(', '));
    setLogDate(log.log_date);
    setIsAddingAchievement(true);
  };

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementText.trim()) return;

    const tags = skillTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingLogId) {
      updatePpaWorkLog(editingLogId, {
        achievement_text: achievementText.trim(),
        skill_tags: tags.length > 0 ? tags : ['Project Management', 'Problem Solving'],
        log_date: logDate
      });
    } else {
      addPpaWorkLog({
        achievement_text: achievementText.trim(),
        skill_tags: tags.length > 0 ? tags : ['Project Management', 'Problem Solving'],
        log_date: logDate
      });
    }

    setAchievementText('');
    setSkillTagsInput('');
    setEditingLogId(null);
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
            onClick={handleOpenAddModal}
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
                onClick={handleOpenAddModal}
                className="p-1.5 rounded-lg bg-[#008751]/20 hover:bg-[#008751]/30 text-emerald-300 border border-[#008751]/30"
                title="Add new bullet point"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List of Logged Bullets */}
            <div className="space-y-3">
              {ppaWorkLogs.map((log) => {
                const logLeadingVerb = getLeadingVerb(log.achievement_text, starActionVerbs);
                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-[#008751]/40 transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#008751]" />
                          <span>{log.log_date}</span>
                        </span>
                        {logLeadingVerb && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>STAR: {logLeadingVerb}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => handleStartEdit(log)}
                          className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                          title="Edit accomplishment & STAR verb"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deletePpaWorkLog(log.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete bullet point"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
                );
              })}
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

      {/* Log / Edit Achievement Modal */}
      {isAddingAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>{editingLogId ? 'Edit PPA Bullet Accomplishment' : 'Log PPA Bullet Accomplishment'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddingAchievement(false);
                  setEditingLogId(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* STAR Action Verbs Section */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>STAR Action Verbs for CV:</span>
                </span>
                
                <button
                  type="button"
                  onClick={() => setIsManagingVerbs(!isManagingVerbs)}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                    isManagingVerbs
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
                  }`}
                  title="Customize the available STAR verbs bank"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>{isManagingVerbs ? 'Done Customizing' : 'Manage Verb Bank'}</span>
                </button>
              </div>

              {/* Leading Verb Status / Active Banner */}
              {detectedLeadingVerb ? (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-[11px] text-emerald-300/90 shrink-0">Bullet starts with:</span>
                    <span className="font-extrabold px-2 py-0.5 rounded-md bg-[#008751] text-white text-[11px] truncate shadow-sm">
                      {detectedLeadingVerb}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLeadingVerb}
                    className="px-2.5 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/80 text-[10px] font-bold flex items-center gap-1 transition-all shrink-0 shadow-sm"
                    title="Remove starting action verb from accomplishment"
                  >
                    <X className="w-3 h-3" />
                    <span>Remove Verb</span>
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400">
                  Click any verb below to <strong>start your bullet point</strong> with a high-impact STAR verb (boosts ATS score):
                </p>
              )}

              {/* Action Verbs Pills List */}
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {starActionVerbs.map((verb) => {
                  const isCurrentLeading = detectedLeadingVerb?.toLowerCase() === verb.toLowerCase();
                  return (
                    <div key={verb} className="inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStartVerb(verb)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                          isCurrentLeading
                            ? 'bg-[#008751] text-white border-emerald-400 shadow-sm shadow-[#008751]/30 hover:bg-rose-700 hover:border-rose-500'
                            : 'bg-slate-800/90 hover:bg-[#008751]/30 hover:text-emerald-300 text-slate-300 border-slate-700/80'
                        }`}
                        title={
                          isCurrentLeading
                            ? `Click to REMOVE "${verb}" from start of bullet`
                            : `Click to START bullet with "${verb}"`
                        }
                      >
                        {isCurrentLeading ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>{verb}</span>
                            <span className="text-[9px] text-emerald-200 ml-0.5 font-mono">✕</span>
                          </>
                        ) : (
                          <span>+{verb}</span>
                        )}
                      </button>

                      {/* If in manage mode, show small remove from bank button */}
                      {isManagingVerbs && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVerbFromBank(verb)}
                          className="ml-0.5 p-1 text-slate-500 hover:text-rose-400 rounded-md hover:bg-slate-800"
                          title={`Remove "${verb}" from verbs bank`}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Manage Verbs Panel (Add custom verb or Reset defaults) */}
              {isManagingVerbs && (
                <div className="pt-2.5 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Add custom verb (e.g. Pioneered, Coordinated)"
                      value={customVerbInput}
                      onChange={(e) => setCustomVerbInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomVerb();
                        }
                      }}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomVerb()}
                      disabled={!customVerbInput.trim()}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-all"
                    >
                      + Add
                    </button>
                    <button
                      type="button"
                      onClick={handleResetVerbs}
                      className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                      title="Reset verb list to defaults"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Add custom verbs to your suggestion bank, or click ✕ next to any verb to remove it.
                  </p>
                </div>
              )}
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
                  onClick={() => {
                    setIsAddingAchievement(false);
                    setEditingLogId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white font-bold shadow-md shadow-[#008751]/30"
                >
                  {editingLogId ? 'Update CV Bullet' : 'Add to CV Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
