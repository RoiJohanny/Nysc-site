import React, { useState } from 'react';
import { useNysc } from '../context/NyscContext';
import { NyscPhase, Expense } from '../types/nysc';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  MapPin,
  TrendingUp,
  FileText,
  Briefcase,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Trash2,
  PhoneCall,
  ShieldAlert,
  Wallet,
  Gauge,
  Percent,
  Check,
  Edit2,
  HelpCircle,
  RotateCcw,
  GraduationCap,
  Tent,
  FileCheck
} from 'lucide-react';
import { CampGuideView } from './CampGuideView';

interface DashboardViewProps {
  onNavigateTab: (tabId: 'home' | 'hub' | 'network' | 'career') => void;
  onOpenProfile: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, onOpenProfile }) => {
  const {
    profile,
    switchPhase,
    locationSchedule,
    financials,
    updateFinancials,
    expenses,
    addExpense,
    deleteExpense,
    clearances,
    toggleClearanceItem,
    emergencyContacts,
    addEmergencyContact,
    fireConfetti
  } = useNysc();

  // Modals inside Home Tab
  const [isEditingInflows, setIsEditingInflows] = useState(false);
  const [isLoggingExpense, setIsLoggingExpense] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);

  // Inflow edit fields
  const [fedAlawee, setFedAlawee] = useState(financials.federal_alawee || 77000);
  const [stateAllow, setStateAllow] = useState(financials.state_allowance || 0);
  const [ppaStipend, setPpaStipend] = useState(financials.ppa_stipend || 0);
  const [sideHustle, setSideHustle] = useState(financials.side_hustle || 0);

  // Expense log fields
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('Food');
  const [customCategory, setCustomCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Contact fields
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // 1. Calculate Service Year Progression & Countdown Ring
  const swearingDate = new Date(profile.swearing_in_date || '2026-03-25');
  const popDate = new Date(profile.pop_date || '2027-02-28');
  const now = new Date();

  const totalServiceDays = Math.max(1, Math.round((popDate.getTime() - swearingDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysServed = Math.max(0, Math.min(totalServiceDays, Math.round((now.getTime() - swearingDate.getTime()) / (1000 * 60 * 60 * 24))));
  const daysRemaining = Math.max(0, totalServiceDays - daysServed);
  const progressPct = Math.min(100, Math.round((daysServed / totalServiceDays) * 100));

  // Compute month number out of 12
  const monthServed = Math.min(12, Math.max(1, Math.ceil((daysServed / totalServiceDays) * 12)));

  // SVG Circular Ring Math
  const ringRadius = 42;
  const ringCircumference = 2 * Math.PI * ringRadius; // ~263.89
  const strokeOffset = ringCircumference - (ringCircumference * progressPct) / 100;

  // 2. Financial Hub Calculations
  const totalMonthlyIncome =
    Number(financials.federal_alawee || 77000) +
    Number(financials.state_allowance || 0) +
    Number(financials.ppa_stipend || 0) +
    Number(financials.side_hustle || 0);

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const remainingBalance = Math.max(0, totalMonthlyIncome - totalSpent);
  const spentPct = totalMonthlyIncome > 0 ? Math.min(100, Math.round((totalSpent / totalMonthlyIncome) * 100)) : 0;

  // Safe daily spend calculation
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeftInMonth = Math.max(1, daysInMonth - currentDay);
  const safeDailySpend = Math.max(0, Math.round(remainingBalance / daysLeftInMonth));

  // Budget health colors
  const budgetStatus =
    spentPct > 85
      ? { color: 'text-rose-400', bg: 'bg-rose-500', label: 'Critical Budget Alert' }
      : spentPct > 65
      ? { color: 'text-amber-400', bg: 'bg-amber-500', label: 'Moderate Spending Pace' }
      : { color: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Healthy Savings Pace' };

  // Current month clearance status
  const currentMonthKey = '2026-10';
  const currentClearance = clearances.find(c => c.month_year === currentMonthKey) || {
    id: 'clr-temp',
    user_id: profile.id,
    month_year: currentMonthKey,
    ppa_letter_signed: false,
    lgi_approval: false,
    biometrics_completed: false,
    payment_received: false
  };

  const clearanceCompletedCount = [
    currentClearance.ppa_letter_signed,
    currentClearance.lgi_approval,
    currentClearance.biometrics_completed,
    currentClearance.payment_received
  ].filter(Boolean).length;

  const handleSaveInflows = (e: React.FormEvent) => {
    e.preventDefault();
    updateFinancials({
      federal_alawee: Number(fedAlawee),
      state_allowance: Number(stateAllow),
      ppa_stipend: Number(ppaStipend),
      side_hustle: Number(sideHustle)
    });
    setIsEditingInflows(false);
    fireConfetti();
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount || Number(expenseAmount) <= 0) return;

    const finalCategory = (expenseCategory === 'Other' && customCategory.trim())
      ? customCategory.trim() as any
      : expenseCategory;

    addExpense({
      title: expenseTitle.trim(),
      category: finalCategory,
      amount: Number(expenseAmount),
      expense_date: expenseDate
    });

    setExpenseTitle('');
    setExpenseAmount('');
    setCustomCategory('');
    setIsLoggingExpense(false);
    fireConfetti();
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    addEmergencyContact({
      contact_name: contactName.trim(),
      role_title: contactRole.trim() || 'Emergency Contact',
      phone_number: contactPhone.trim(),
      is_default: false,
      state: profile.state_of_deployment,
      lga: profile.lga
    });

    setContactName('');
    setContactRole('');
    setContactPhone('');
    setIsAddingContact(false);
    fireConfetti();
  };

  const quickExpensePresets = [
    { title: 'Keke / BRT to PPA', cat: 'Transport' as const, amt: 800 },
    { title: 'Food & Cooking Gas Refill', cat: 'Food' as const, amt: 4500 },
    { title: 'Monthly CDS Dues', cat: 'CDS Dues' as const, amt: 1000 },
    { title: 'MTN 20GB Data Bundle', cat: 'Data' as const, amt: 5000 },
    { title: 'Khaki Drycleaning', cat: 'Personal' as const, amt: 1500 }
  ];

  return (
    <div className="space-y-6">
      
      {/* =========================================================================
          1. LIFECYCLE HEADER CARD WITH DYNAMIC COUNTDOWN RING & MANUAL PHASE SWITCHER
         ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-[#008751]/40 p-5 sm:p-7 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-[#008751]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left: Corper Bio & Manual Phase Override Switcher */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/60 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#008751]" />
                <span>{profile.state_code || 'LA/26A/4819'}</span>
              </span>

              {/* Service Phase Manual Override Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-700/80 text-xs">
                <span className="text-slate-400 font-medium">Phase:</span>
                <select
                  value={profile.current_phase}
                  onChange={(e) => switchPhase(e.target.value as NyscPhase)}
                  className="bg-transparent text-white font-extrabold focus:outline-none cursor-pointer text-xs"
                  title="Manual phase switcher"
                >
                  <option value="PCM" className="bg-slate-900 text-slate-200">🎓 PCM (Prospective)</option>
                  <option value="CAMP" className="bg-slate-900 text-slate-200">🏕️ Orientation Camp</option>
                  <option value="ACTIVE" className="bg-slate-900 text-slate-200">🎖️ Active Service (PPA & CDS)</option>
                  <option value="POP" className="bg-slate-900 text-slate-200">🏆 POP Phase (Discharged)</option>
                </select>
              </div>

              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{profile.state_of_deployment} ({profile.lga} LGA)</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, Corper {profile.full_name} 🇳🇬
            </h1>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              {profile.current_phase === 'PCM' && (
                <span>🎓 <strong>Prospective Corps Member:</strong> Preparing for mobilization, call-up letter printing, and orientation camp deployment in <strong className="text-white">{profile.state_of_deployment}</strong>.</span>
              )}
              {profile.current_phase === 'CAMP' && (
                <span>🏕️ <strong>Orientation Camp Active:</strong> 21-day physical drill, early morning bugle, SAED lectures, and camp social events in <strong className="text-white">{profile.state_of_deployment}</strong>.</span>
              )}
              {profile.current_phase === 'ACTIVE' && (
                <span>🎖️ Serving at <strong className="text-white">{profile.ppa_name}</strong> • Member of <strong className="text-amber-300">{profile.cds_group}</strong>.</span>
              )}
              {profile.current_phase === 'POP' && (
                <span>🏆 <strong>Passing Out Parade (Discharged):</strong> Congratulations on fulfilling your national service obligation to Nigeria!</span>
              )}
            </p>
          </div>

          {/* Right: Dynamic Circular Progress Countdown Ring Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-center sm:justify-start gap-4 sm:gap-5 shadow-xl w-full lg:w-auto lg:min-w-[280px]">
            {/* SVG Circular Ring */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  className="text-slate-800 stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Ring with #008751 */}
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  className="text-[#008751] stroke-current transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Center percentage */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base sm:text-lg font-extrabold text-white font-mono leading-none">
                  {progressPct}%
                </span>
                <span className="text-[9px] text-emerald-400 font-semibold uppercase mt-0.5">
                  Served
                </span>
              </div>
            </div>

            {/* Countdown Ring Meta text */}
            <div className="space-y-1">
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                Month {monthServed} of 12
              </div>
              <div className="text-base sm:text-lg font-black text-amber-400 font-mono tracking-tight leading-snug">
                {daysRemaining} Days
              </div>
              <p className="text-[11px] text-slate-400">
                Until Passing Out Parade (POP) 🎓
              </p>
              <div className="text-[10px] text-slate-500 font-mono">
                Day {daysServed} of {totalServiceDays} completed
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* =========================================================================
          PHASE-SPECIFIC INTERACTIVE MODULES (PCM / CAMP / POP)
         ========================================================================= */}

      {/* 1. PCM PHASE: Mobilization & Camp Entry Command Center */}
      {profile.current_phase === 'PCM' && (
        <div className="bg-slate-900/95 rounded-3xl border border-blue-500/40 p-5 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  PCM Mobilization & Orientation Camp Prep Hub
                </h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Prospective Corps Member
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Everything required before reporting to NYSC Orientation Camp in {profile.state_of_deployment} State.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://portal.nysc.org.ng/NYSC1/CallUpLetter.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <span>Print Call-Up Slip</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => switchPhase('CAMP')}
                className="px-3.5 py-2 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                title="Transition to Camp Phase once arrived at camp"
              >
                <span>Enter Camp Phase 🏕️</span>
              </button>
            </div>
          </div>

          {/* 4 Core Pre-Camp Requirements Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg">📄</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">1. Call-Up Letter & Slip</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                Print 5 colored and 5 black-and-white photocopies. Never laminate this original document.
              </p>
              <a
                href="https://portal.nysc.org.ng/NYSC1/CallUpLetter.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-400 hover:underline font-semibold block pt-1"
              >
                Download Slip ↗
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg">🟩</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">2. Green Card Registration</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                Must contain clear biometric barcode and institutional stamp from your university or polytechnic.
              </p>
              <a
                href="https://portal.nysc.org.ng/NYSC1/GreenCard.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-400 hover:underline font-semibold block pt-1"
              >
                Verify Green Card ↗
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg">🏥</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Mandatory
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">3. Medical Fitness Slip</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                Must be issued by a recognized Government or General Hospital (with blood group, genotype & chest X-Ray).
              </p>
              <button
                onClick={() => onNavigateTab('hub')}
                className="text-[11px] text-amber-300 hover:underline font-semibold block pt-1 text-left"
              >
                Store in Document Vault ↗
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg">🎒</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  35 Items
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">4. White Wear & Provisions</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                White round-neck vests, tennis shoes, waist pouch, mosquito net, and flashlight.
              </p>
              <button
                onClick={() => switchPhase('CAMP')}
                className="text-[11px] text-purple-300 hover:underline font-semibold block pt-1 text-left"
              >
                Open Packing Toolkit ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CAMP PHASE: 21-Day Orientation Camp Toolkit */}
      {profile.current_phase === 'CAMP' && (
        <div className="space-y-4">
          <div className="bg-slate-900/95 rounded-3xl border border-rose-500/40 p-4 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl shrink-0">
                🏕️
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Orientation Camp Phase Active (21 Days)
                </h3>
                <p className="text-xs text-slate-300">
                  Interactive camp packing checklist, NYSC Anthem sing-along player, and camp rules guide.
                </p>
              </div>
            </div>

            <button
              onClick={() => switchPhase('ACTIVE')}
              className="px-4 py-2 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0"
              title="Graduated from camp and deployed to Primary Assignment"
            >
              <span>Camp Done? Advance to Active Service 🎖️</span>
            </button>
          </div>

          <CampGuideView />
        </div>
      )}

      {/* 3. POP PHASE: Passing Out Parade & Discharged Alumni Hub */}
      {profile.current_phase === 'POP' && (
        <div className="bg-slate-900/95 rounded-3xl border border-amber-500/40 p-5 sm:p-7 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Passing Out Parade (POP) & Discharged Alumni Hub
                </h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Service Completed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Final clearance sign-offs, NYSC Discharge Certificate validation, and career launchpad.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://verify.nysc.org.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <span>Verify Discharge Cert</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => onNavigateTab('career')}
                className="px-3.5 py-2 rounded-xl bg-[#008751] hover:bg-[#006f43] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <span>Export Career CV Draft 💼</span>
              </button>
            </div>
          </div>

          {/* 4-Step Final Discharge Clearance Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400">STAGE 1</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-xs font-bold text-white">PPA Final Release Letter</h4>
              <p className="text-[11px] text-slate-400">
                Official release letter and evaluation letter stamped by your employer or principal.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400">STAGE 2</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-xs font-bold text-white">CDS Inspector Clearance</h4>
              <p className="text-[11px] text-slate-400">
                All weekly CDS attendance and project dues settled and signed by your CDS schedule officer.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400">STAGE 3</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-xs font-bold text-white">LGI Final Sign-Off</h4>
              <p className="text-[11px] text-slate-400">
                Local Government Inspector signs off on your final biometric book and state clearance slip.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-400">STAGE 4</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <h4 className="text-xs font-bold text-white">Discharge Certificate</h4>
              <p className="text-[11px] text-slate-400">
                Collect your Certificate of National Service at the Passing Out Parade ground.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. MULTI-SOURCE FINANCIAL HUB & REMAINING BALANCE CALCULATOR
         ========================================================================= */}
      <div className="bg-slate-900/95 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-2xl space-y-6">
        
        {/* Financial Header & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#008751]" />
                <span>Multi-Source Financial Hub & Allowance Tracker</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#008751]/20 text-emerald-300 border border-[#008751]/30">
                Live Calculator
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Federal ₦77,000 allowance, state stipend, PPA wages, and real-time safe daily spend budgeter.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsEditingInflows(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#008751]" />
              <span>Configure Inflows</span>
            </button>

            <button
              onClick={() => setIsLoggingExpense(true)}
              className="px-4 py-2 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#008751]/30 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* 3 Prominent Metric Cards: Total Income, Total Spent, TOTAL REMAINING BALANCE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Total Monthly Inflow */}
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Monthly Inflow</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              ₦{totalMonthlyIncome.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5">
              <span className="text-emerald-400 font-semibold font-mono">
                ₦{(financials.federal_alawee || 77000).toLocaleString()}
              </span>
              <span>Fed Alawee</span>
              {financials.ppa_stipend > 0 && (
                <>
                  <span>•</span>
                  <span>₦{financials.ppa_stipend.toLocaleString()} PPA</span>
                </>
              )}
            </div>
          </div>

          {/* Card 2: Total Spent This Month */}
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Spent This Month</span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono tracking-tight">
              -₦{totalSpent.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">
              Across {expenses.length} logged expense items
            </div>
          </div>

          {/* Card 3: PROMINENT TOTAL REMAINING BALANCE */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#005a36]/30 via-slate-800/80 to-slate-900 border-2 border-[#008751] space-y-2 shadow-xl shadow-[#008751]/15 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#008751]/20 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs text-emerald-300 font-bold uppercase tracking-wider">
              <span>Total Remaining Balance</span>
              <div className="w-7 h-7 rounded-lg bg-[#008751]/20 text-[#008751] flex items-center justify-center">
                <Wallet className="w-4 h-4 text-emerald-300" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-300 font-mono tracking-tight">
              ₦{remainingBalance.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-300 font-medium">
              Available liquid funds in corper account
            </div>
          </div>

        </div>

        {/* Dynamic Budget Progress Bar & Safe Daily Spend Indicator */}
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">
                Monthly Spending Discipline ({spentPct}% Consumed)
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${budgetStatus.color} bg-slate-900 border border-slate-800`}>
                {budgetStatus.label}
              </span>
            </div>

            <div className="text-xs text-slate-400">
              Safe Daily Spend Indicator:
            </div>
          </div>

          {/* Color-changing Progress Bar (Green / Yellow / Red) */}
          <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-700 ${budgetStatus.bg}`}
              style={{ width: `${spentPct}%` }}
            />
          </div>

          {/* Safe Daily Spend Highlight Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Safe Daily Allowance:</span>
                  <span className="text-base font-extrabold text-amber-300 font-mono">
                    ₦{safeDailySpend.toLocaleString()} / day
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Calculated as (₦{remainingBalance.toLocaleString()} Remaining Balance ÷ {daysLeftInMonth} Days Left in Month)
                </p>
              </div>
            </div>

            <div className="text-[11px] text-emerald-400 font-mono font-semibold self-start sm:self-auto bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              Next Alawee: 28th
            </div>
          </div>

          {/* Quick 1-Tap Expense Presets */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Corper Log Presets:
            </div>
            <div className="flex flex-wrap gap-2">
              {quickExpensePresets.map((preset) => (
                <button
                  key={preset.title}
                  onClick={() => {
                    addExpense({
                      title: preset.title,
                      category: preset.cat,
                      amount: preset.amt,
                      expense_date: new Date().toISOString().split('T')[0]
                    });
                    fireConfetti();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3 h-3 text-[#008751]" />
                  <span>{preset.title}</span>
                  <span className="text-emerald-400 font-mono font-bold text-[11px]">₦{preset.amt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================================
          3. EMERGENCY SOS WIDGET (ONE-TAP CALLING FOR LGI, POLICE & CUSTOM CONTACTS)
         ========================================================================= */}
      <div className="bg-slate-900/95 rounded-3xl border border-red-500/30 p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/40">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <span>Emergency SOS Hotline Desk</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                  24/7 Rapid Response
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct one-tap dialing to your Local Government Inspector (LGI), Police DPO, and saved security contacts.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingContact(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-red-400" />
            <span>Add Custom Contact</span>
          </button>
        </div>

        {/* SOS One-Tap Calling Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Official 1: LGI (Local Government Inspector) */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 flex flex-col justify-between space-y-3 hover:border-red-500/40 transition-all">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
                LGI - {profile.lga} LGA
              </span>
              <h4 className="text-xs font-extrabold text-white">
                Mr. Babatunde (LGI Desk)
              </h4>
              <div className="text-xs font-mono font-bold text-emerald-400">
                08034091288
              </div>
            </div>

            <a
              href="tel:08034091288"
              className="w-full py-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-950/50 transition-all hover:scale-102"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call LGI</span>
            </a>
          </div>

          {/* Official 2: Police Area Command */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 flex flex-col justify-between space-y-3 hover:border-red-500/40 transition-all">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
                Area Police Command
              </span>
              <h4 className="text-xs font-extrabold text-white">
                Nigeria Police DPO Desk
              </h4>
              <div className="text-xs font-mono font-bold text-emerald-400">
                08033011052
              </div>
            </div>

            <a
              href="tel:08033011052"
              className="w-full py-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-950/50 transition-all hover:scale-102"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Police</span>
            </a>
          </div>

          {/* Official 3: NYSC National Distress Line */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 flex flex-col justify-between space-y-3 hover:border-red-500/40 transition-all">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
                National Distress Toll-Free
              </span>
              <h4 className="text-xs font-extrabold text-white">
                NYSC Headquarters SOS
              </h4>
              <div className="text-xs font-mono font-bold text-emerald-400">
                08033107873
              </div>
            </div>

            <a
              href="tel:08033107873"
              className="w-full py-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-950/50 transition-all hover:scale-102"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call National SOS</span>
            </a>
          </div>

          {/* Official 4 or Custom User Contact */}
          {emergencyContacts.filter(c => !c.is_default).length > 0 ? (
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 flex flex-col justify-between space-y-3 hover:border-red-500/40 transition-all">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                  {emergencyContacts.filter(c => !c.is_default)[0].role_title}
                </span>
                <h4 className="text-xs font-extrabold text-white truncate">
                  {emergencyContacts.filter(c => !c.is_default)[0].contact_name}
                </h4>
                <div className="text-xs font-mono font-bold text-emerald-400">
                  {emergencyContacts.filter(c => !c.is_default)[0].phone_number}
                </div>
              </div>

              <a
                href={`tel:${emergencyContacts.filter(c => !c.is_default)[0].phone_number.replace(/[^0-9]/g, '')}`}
                className="w-full py-2 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-102"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Saved Contact</span>
              </a>
            </div>
          ) : (
            <div
              onClick={() => setIsAddingContact(true)}
              className="p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-red-500/50 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition-all bg-slate-900/40 group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-red-500/20 text-slate-400 group-hover:text-red-400 flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-300">
                + Add Corpers Lodge / Roommate
              </div>
              <div className="text-[10px] text-slate-500">
                Save 1-tap trusted SOS contact
              </div>
            </div>
          )}

        </div>
      </div>

      {/* =========================================================================
          4. CLEARANCE & PPA TRANSIT SUMMARY CARDS
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Monthly Biometric Checklist Quick Overview */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#008751]" />
                <span>Monthly Biometric Clearance Checklist ({currentMonthKey})</span>
              </h3>
              <p className="text-xs text-slate-400">
                Thumbprint biometric clearance opens 1st - 25th monthly.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('hub')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Full Clearance Hub</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => toggleClearanceItem(currentMonthKey, 'ppa_letter_signed')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                currentClearance.ppa_letter_signed
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={currentClearance.ppa_letter_signed}
                onChange={() => {}}
                className="w-4 h-4 rounded text-[#008751] focus:ring-[#008751] cursor-pointer accent-[#008751]"
              />
              <div>
                <div className="text-xs font-bold text-white">1. PPA Evaluation Letter</div>
                <div className="text-[10px] text-slate-400">Signed & stamped by Principal/HR</div>
              </div>
            </div>

            <div
              onClick={() => toggleClearanceItem(currentMonthKey, 'lgi_approval')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                currentClearance.lgi_approval
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={currentClearance.lgi_approval}
                onChange={() => {}}
                className="w-4 h-4 rounded text-[#008751] focus:ring-[#008751] cursor-pointer accent-[#008751]"
              />
              <div>
                <div className="text-xs font-bold text-white">2. LGI Sign-Off</div>
                <div className="text-[10px] text-slate-400">Inspected by Local Inspector</div>
              </div>
            </div>

            <div
              onClick={() => toggleClearanceItem(currentMonthKey, 'biometrics_completed')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                currentClearance.biometrics_completed
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={currentClearance.biometrics_completed}
                onChange={() => {}}
                className="w-4 h-4 rounded text-[#008751] focus:ring-[#008751] cursor-pointer accent-[#008751]"
              />
              <div>
                <div className="text-xs font-bold text-white">3. Biometric Scan</div>
                <div className="text-[10px] text-slate-400">Fingerprint captured at LGA portal</div>
              </div>
            </div>

            <div
              onClick={() => toggleClearanceItem(currentMonthKey, 'payment_received')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                currentClearance.payment_received
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={currentClearance.payment_received}
                onChange={() => {}}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
              />
              <div>
                <div className="text-xs font-bold text-amber-300">4. Alawee Credited ₦77k</div>
                <div className="text-[10px] text-slate-400">Federal payment alert received!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: PPA & CDS Transit Fare Notes */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#008751]" />
              <span>Location & Transit Schedules</span>
            </h3>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1">
              <div className="text-[10px] font-bold text-emerald-400 uppercase">
                PPA Transit Note:
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                {locationSchedule.ppa_address_notes || 'Keke from Ikeja Underbridge ₦200 to Government Model College.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1">
              <div className="text-[10px] font-bold text-amber-400 uppercase">
                CDS Schedule & Fare:
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Every {locationSchedule.cds_meeting_day} @ {locationSchedule.cds_meeting_time || '09:00 AM'}.
                <br />
                <span className="text-slate-400 text-[11px]">{locationSchedule.transit_fare_notes}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('hub')}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <span>View CDS Meeting Logs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* =========================================================================
          MODALS: INFLOWS CONFIG, EXPENSE LOGGER, ADD CONTACT
         ========================================================================= */}

      {/* Inflows Config Modal */}
      {isEditingInflows && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#008751]" />
              <span>Multi-Source Inflow Inputs</span>
            </h3>
            <p className="text-xs text-slate-400">
              Customize your Federal alawee and monthly secondary income streams.
            </p>

            <form onSubmit={handleSaveInflows} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Federal Alawee (₦)
                </label>
                <input
                  type="number"
                  value={fedAlawee}
                  onChange={e => setFedAlawee(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#008751]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  State Government Allowance (₦)
                </label>
                <input
                  type="number"
                  value={stateAllow}
                  onChange={e => setStateAllow(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#008751]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  PPA Monthly Stipend (₦)
                </label>
                <input
                  type="number"
                  value={ppaStipend}
                  onChange={e => setPpaStipend(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#008751]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Side Hustles / Freelance (₦)
                </label>
                <input
                  type="number"
                  value={sideHustle}
                  onChange={e => setSideHustle(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#008751]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingInflows(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-bold shadow-md shadow-[#008751]/30"
                >
                  Save Inflows
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Logger Modal */}
      {isLoggingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#008751]" />
              <span>Log Monthly Expense</span>
            </h3>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Expense Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rice & Cooking Oil at local market"
                  value={expenseTitle}
                  onChange={e => setExpenseTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={e => setExpenseCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  >
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Rent">Rent</option>
                    <option value="Data">Data</option>
                    <option value="CDS Dues">CDS Dues</option>
                    <option value="Personal">Personal</option>
                    <option value="Other">Custom Category</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Amount (₦)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 4500"
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#008751]"
                    required
                  />
                </div>
              </div>

              {expenseCategory === 'Other' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Enter Custom Category Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Electronics, Medicals, Uniform"
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Expense Date
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={e => setExpenseDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLoggingExpense(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-bold shadow-md shadow-[#008751]/30"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Emergency Contact Modal */}
      {isAddingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-red-400" />
              <span>Save Emergency Contact</span>
            </h3>

            <form onSubmit={handleAddContactSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Contact Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Corpers Lodge President / Roommate"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lodge Security / Close Friend / Nurse"
                  value={contactRole}
                  onChange={e => setContactRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 08123456789"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingContact(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-950/50"
                >
                  Save SOS Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
