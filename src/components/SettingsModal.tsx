import React, { useState } from 'react';
import { useNysc } from '../context/NyscContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { NIGERIAN_STATES, CDS_GROUPS } from '../data/mockSeed';
import { NyscPhase, FeedbackCategory } from '../types/nysc';
import { useAuth } from '../context/AuthContext';
import { PrivacyPolicyModal, TermsOfServiceModal } from './legal/ComplianceModals';
import {
  Settings,
  X,
  User,
  KeyRound,
  MessageSquare,
  Shield,
  Trash2,
  Moon,
  Sun,
  Download,
  Database,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Sparkles,
  Smartphone,
  LogOut,
  Send,
  MessageCircle,
  Calendar,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Eye,
  EyeOff,
  Check,
  Building,
  MapPin,
  Clock
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNavigateToAdmin?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleTheme,
  onNavigateToAdmin
}) => {
  const {
    profile,
    updateProfile,
    resetToDefaultData,
    expenses,
    clearances,
    cdsLogs,
    vaultDocuments,
    userFeedback,
    addUserFeedback,
    deleteUserAccountAndData,
    fireConfetti
  } = useNysc();

  const { isOnline, lastSynced } = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { signOut, setNewPassword } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<
    'profile' | 'dates' | 'security' | 'feedback' | 'privacy' | 'pwa' | 'danger'
  >('profile');

  // Legal modals
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone);
  const [stateCode, setStateCode] = useState(profile.state_code || 'LA/26A/4819');
  const [callUpNo, setCallUpNo] = useState(profile.call_up_no || 'NYSC/UAM/2026/049102');
  const [stateDeployment, setStateDeployment] = useState(profile.state_of_deployment);
  const [lga, setLga] = useState(profile.lga);
  const [batchStream, setBatchStream] = useState(profile.batch_stream);
  const [phase, setPhase] = useState<NyscPhase>(profile.current_phase);
  const [ppaName, setPpaName] = useState(profile.ppa_name);
  const [ppaAddress, setPpaAddress] = useState(profile.ppa_address || '');
  const [cdsGroup, setCdsGroup] = useState(profile.cds_group);

  // Dates
  const [swearingInDate, setSwearingInDate] = useState(profile.swearing_in_date || '2026-03-25');
  const [popDate, setPopDate] = useState(profile.pop_date || '2027-02-28');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPasswordInput] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Feedback fields
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>('feature_request');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmittedTicket, setFeedbackSubmittedTicket] = useState<string | null>(null);

  // Delete account confirmation
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Inline confirmations and messages (replacing window.confirm / alert for iframe safety)
  const [datesStatusMessage, setDatesStatusMessage] = useState<string | null>(null);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName.trim(),
      phone: phone.trim(),
      state_code: stateCode.trim(),
      call_up_no: callUpNo.trim(),
      state_of_deployment: stateDeployment,
      lga: lga.trim(),
      batch_stream: batchStream.trim(),
      current_phase: phase,
      ppa_name: ppaName.trim(),
      ppa_address: ppaAddress.trim(),
      cds_group: cdsGroup,
      swearing_in_date: swearingInDate,
      pop_date: popDate
    });
    fireConfetti();
    onClose();
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match. Please verify.' });
      return;
    }

    setIsUpdatingPassword(true);
    const res = await setNewPassword(newPassword);
    setIsUpdatingPassword(false);

    if (res.success) {
      setPasswordStatus({ type: 'success', message: 'Password updated successfully! Keep your new credentials safe.' });
      setCurrentPassword('');
      setNewPasswordInput('');
      setConfirmPassword('');
      fireConfetti();
    } else {
      setPasswordStatus({ type: 'error', message: res.error || 'Failed to update password.' });
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    setIsSubmittingFeedback(true);
    try {
      const item = await addUserFeedback({
        user_id: profile.id,
        user_name: profile.full_name,
        user_phone: profile.phone,
        category: feedbackCategory,
        message: feedbackMessage.trim(),
        status: 'pending'
      });
      setIsSubmittingFeedback(false);
      setFeedbackSubmittedTicket(item.id);
      setFeedbackMessage('');
    } catch {
      setIsSubmittingFeedback(false);
    }
  };

  const totalCachedRecords = expenses.length + clearances.length + cdsLogs.length + vaultDocuments.length;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#008751]/20 text-[#008751] border border-[#008751]/40 flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    Settings & Companion Preferences
                  </h2>
                  {profile.is_admin && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Admin Access
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Manage profile, dates, feedback, privacy, and account security
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Admin Banner if user is admin */}
          {profile.is_admin && onNavigateToAdmin && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-amber-950/40 border border-amber-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>You have Admin Privileges enabled on this device.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToAdmin();
                }}
                className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-102"
              >
                <span>Open Admin Panel (/admin)</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Navigation Sub-Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto no-scrollbar gap-1">
            <button
              onClick={() => setActiveSubTab('profile')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSubTab === 'profile'
                  ? 'bg-[#008751] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveSubTab('dates')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSubTab === 'dates'
                  ? 'bg-[#008751] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Dates</span>
            </button>

            <button
              onClick={() => setActiveSubTab('security')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSubTab === 'security'
                  ? 'bg-[#008751] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>

            <button
              onClick={() => setActiveSubTab('feedback')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSubTab === 'feedback'
                  ? 'bg-[#008751] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Feedback & Help</span>
            </button>

            <button
              onClick={() => setActiveSubTab('privacy')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSubTab === 'privacy'
                  ? 'bg-[#008751] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Privacy & Theme</span>
            </button>

            <button
              onClick={() => setActiveSubTab('danger')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSubTab === 'danger'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-400/80 hover:text-rose-300'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Account Wipe</span>
            </button>
          </div>

          {/* Sub-Tab 1: Corps Profile */}
          {activeSubTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Official State Code</label>
                  <input
                    type="text"
                    value={stateCode}
                    onChange={e => setStateCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#008751] uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number (WhatsApp Active)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#008751]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Call-Up Number</label>
                  <input
                    type="text"
                    value={callUpNo}
                    onChange={e => setCallUpNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#008751] uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">State of Deployment</label>
                  <select
                    value={stateDeployment}
                    onChange={e => setStateDeployment(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  >
                    {NIGERIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">LGA of Deployment</label>
                  <input
                    type="text"
                    value={lga}
                    onChange={e => setLga(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Service Phase</label>
                  <select
                    value={phase}
                    onChange={e => setPhase(e.target.value as NyscPhase)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  >
                    <option value="PCM">PCM (Prospective Corps Member)</option>
                    <option value="CAMP">CAMP (Orientation 21 Days)</option>
                    <option value="ACTIVE">ACTIVE (PPA & CDS Primary)</option>
                    <option value="POP">POP (Passing Out Parade)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Batch & Stream</label>
                  <input
                    type="text"
                    value={batchStream}
                    onChange={e => setBatchStream(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Place of Primary Assignment (PPA Name)</label>
                <input
                  type="text"
                  value={ppaName}
                  onChange={e => setPpaName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">PPA Address & Landmark</label>
                <input
                  type="text"
                  value={ppaAddress}
                  onChange={e => setPpaAddress(e.target.value)}
                  placeholder="e.g. Oba Akinjobi Way, Ikeja GRA, Lagos"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">CDS Group</label>
                <select
                  value={cdsGroup}
                  onChange={e => setCdsGroup(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                >
                  {CDS_GROUPS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
                {confirmSignOut ? (
                  <div className="flex items-center gap-2">
                    <span className="text-rose-300 text-xs font-medium">Sign out?</span>
                    <button
                      type="button"
                      onClick={async () => {
                        await signOut();
                        setConfirmSignOut(false);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                    >
                      Yes, Sign Out
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmSignOut(false)}
                      className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmSignOut(true)}
                    className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 font-semibold flex items-center gap-1.5 transition-all text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-bold shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Sub-Tab 2: Swearing-In & POP Dates */}
          {activeSubTab === 'dates' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                <div className="flex items-center gap-2.5 text-white font-bold">
                  <Calendar className="w-4 h-4 text-[#008751]" />
                  <span>Key NYSC Milestone & Service Year Dates</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Setting your exact swearing-in date and Passing Out Parade (POP) date powers the dynamic countdown ring on your dashboard and calculates accurate days remaining.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Camp Swearing-In Date
                    </label>
                    <input
                      type="date"
                      value={swearingInDate}
                      onChange={e => setSwearingInDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Usually Day 3 or Day 4 of orientation camp.
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Expected POP (Passing Out Parade) Date
                    </label>
                    <input
                      type="date"
                      value={popDate}
                      onChange={e => setPopDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Exactly 1 calendar year from mobilization.
                    </span>
                  </div>
                </div>

                {datesStatusMessage && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
                    <span>✓ {datesStatusMessage}</span>
                    <button
                      type="button"
                      onClick={() => setDatesStatusMessage(null)}
                      className="text-slate-400 hover:text-white ml-2 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-[#008751]/10 border border-[#008751]/30 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white">Calculated Service Duration</div>
                    <div className="text-[11px] text-emerald-300">
                      From {new Date(swearingInDate).toLocaleDateString()} to {new Date(popDate).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateProfile({ swearing_in_date: swearingInDate, pop_date: popDate });
                      fireConfetti();
                      setDatesStatusMessage('Service milestone dates successfully updated!');
                      setTimeout(() => setDatesStatusMessage(null), 4000);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-bold shadow-md transition-all"
                  >
                    Apply Dates
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Change Password */}
          {activeSubTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold">
                  <KeyRound className="w-4 h-4 text-[#008751]" />
                  <span>Update Account Credentials</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Ensure your account is protected against unauthorized access. Use a strong password containing letters, numbers, and symbols.
                </p>

                {passwordStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      passwordStatus.type === 'success'
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {passwordStatus.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span>{passwordStatus.message}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPasswordInput(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="px-5 py-2.5 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    {isUpdatingPassword ? (
                      <span>Updating...</span>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Sub-Tab 4: Feedback & Support */}
          {activeSubTab === 'feedback' && (
            <div className="space-y-4 text-xs">
              
              {/* Option B: Direct WhatsApp Support */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-emerald-900/30 to-emerald-950/40 border border-[#008751]/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#008751] text-white flex items-center justify-center shrink-0">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Direct WhatsApp Support Desk</h4>
                      <p className="text-[11px] text-emerald-300/80">
                        Chat directly with NYSC Companion creator & local admin
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#008751]/20 text-[#008751] border border-[#008751]/30">
                    Option B
                  </span>
                </div>

                <p className="text-[11px] text-slate-300">
                  Have an urgent deployment or biometric issue? Connect directly with our developer team on WhatsApp (+234 814 592 0184).
                </p>

                <a
                  href={`https://wa.me/2348145920184?text=${encodeURIComponent(
                    `Hello NYSC Companion Admin, my name is ${profile.full_name} (${profile.state_code || 'Corps Member'}). I need assistance regarding:`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-102"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Chat with Admin on WhatsApp (+234 814 592 0184)</span>
                </a>
              </div>

              {/* In-App Feedback Form */}
              <form onSubmit={handleFeedbackSubmit} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Send className="w-4 h-4 text-[#008751]" />
                    <span>In-App Feedback & Bug Reporter</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Saves to <code className="text-[#008751] font-mono">user_feedback</code> table
                  </span>
                </div>

                {feedbackSubmittedTicket && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Feedback ticket recorded successfully! (Ref: <strong className="font-mono">{feedbackSubmittedTicket}</strong>)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFeedbackSubmittedTicket(null)}
                      className="text-emerald-400 hover:text-white text-[11px] underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Feedback Category</label>
                  <select
                    value={feedbackCategory}
                    onChange={e => setFeedbackCategory(e.target.value as FeedbackCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                  >
                    <option value="bug">🪲 Bug Report (Something is broken or not responding)</option>
                    <option value="feature_request">💡 Feature Request (Suggest a new tool or calculation)</option>
                    <option value="general">💬 General Feedback / Encouragement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Describe your experience or suggestion
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackMessage}
                    onChange={e => setFeedbackMessage(e.target.value)}
                    placeholder="Give details on what happened or what feature you would love to see..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#008751]"
                    required
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>Your name & phone ({profile.phone}) will be attached for administrative follow-up.</span>
                    <span>{feedbackMessage.length} characters</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSubmittingFeedback || !feedbackMessage.trim()}
                    className="px-5 py-2 rounded-xl bg-[#008751] hover:bg-[#005a36] disabled:opacity-50 text-white font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit to Admin</span>
                  </button>
                </div>
              </form>

              {/* User's recent feedback submissions list */}
              {userFeedback.filter(f => f.user_id === profile.id).length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-2.5">
                  <div className="font-bold text-white text-xs">Your Previous Tickets</div>
                  <div className="space-y-2">
                    {userFeedback
                      .filter(f => f.user_id === profile.id)
                      .slice(0, 3)
                      .map(item => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                item.category === 'bug'
                                  ? 'bg-red-500/20 text-red-300'
                                  : item.category === 'feature_request'
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}>
                                {item.category.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                              {item.message}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              item.status === 'resolved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {item.status === 'resolved' ? 'Resolved' : 'Pending'}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Sub-Tab 5: Privacy & Theme */}
          {activeSubTab === 'privacy' && (
            <div className="space-y-4 text-xs">
              
              {/* Directory Visibility Toggles */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3.5">
                <div className="flex items-center gap-2 font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-[#008751]" />
                  <span>Corper Directory Privacy Controls</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Control how your contact details appear to peer corps members searching for comrades in your state or PPA.
                </p>

                {/* Toggle 1: Directory Visible */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5 pr-2">
                    <div className="font-bold text-white">Show Profile in Corper Directory</div>
                    <div className="text-[11px] text-slate-400">
                      Allows corps members in {profile.state_of_deployment} to discover you by skills or CDS group.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateProfile({ is_directory_visible: !profile.is_directory_visible })}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                      profile.is_directory_visible ? 'bg-[#008751]' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        profile.is_directory_visible ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 2: Show Phone in Directory */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5 pr-2">
                    <div className="font-bold text-white">Display Phone Number in Directory</div>
                    <div className="text-[11px] text-slate-400">
                      When enabled, allows direct WhatsApp messaging buttons on your card. If disabled, phone is redacted.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateProfile({ show_phone_in_directory: !profile.show_phone_in_directory })}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                      profile.show_phone_in_directory ? 'bg-[#008751]' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        profile.show_phone_in_directory ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Theme mode toggle */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    {isDarkMode ? <Moon className="w-5 h-5 text-amber-300" /> : <Sun className="w-5 h-5 text-amber-400" />}
                  </div>
                  <div>
                    <div className="font-bold text-white">Appearance & Theme</div>
                    <div className="text-[11px] text-slate-400">
                      {isDarkMode ? 'Dark Mode (Military Olive Slate)' : 'Light Theme Mode'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onToggleTheme}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold transition-all"
                >
                  Switch to {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>

              {/* Compliance & Legal Documents */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
                <div className="font-bold text-white">Compliance & Official Policies</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsPrivacyOpen(true)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                        Privacy Policy
                      </div>
                      <div className="text-[10px] text-slate-400">NDPR & Encrypted Storage</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsTermsOpen(true)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-amber-400 transition-colors">
                        Terms of Service
                      </div>
                      <div className="text-[10px] text-slate-400">NYSC Bye-Laws & POD Rules</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Sub-Tab 6: Danger Zone & Total Wipe */}
          {activeSubTab === 'danger' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 space-y-3">
                <div className="flex items-center gap-2 text-rose-300 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Account Erasure & Data Wipe (NDPR Right to Erasure)</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Permanently wipe all locally cached documents, financial records, clearance signatures, SAED notes, and credentials from this browser session.
                </p>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-rose-400/90 space-y-1">
                  <p>• Your profile will be purged from the directory.</p>
                  <p>• All {totalCachedRecords} stored local records will be deleted immediately.</p>
                  <p>• This action is non-reversible.</p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirmModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition-all hover:scale-102"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete My Account & Data</span>
                  </button>
                </div>
              </div>

              {/* Reset seed demo data option */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-white text-xs">Reset to Standard Demo Seed</div>
                  <div className="text-[11px] text-slate-400">
                    Restores initial 2026 Batch A sample records without signing out.
                  </div>
                </div>
                {confirmReset ? (
                  <div className="flex items-center gap-2">
                    <span className="text-amber-300 text-xs font-medium">Reset records?</span>
                    <button
                      type="button"
                      onClick={() => {
                        resetToDefaultData();
                        setConfirmReset(false);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all"
                    >
                      Yes, Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all text-xs"
                  >
                    Reset Records
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-800/80 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 font-bold text-base">
              <AlertTriangle className="w-6 h-6 text-rose-500 animate-bounce" />
              <span>Confirm Total Account Wipe</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you completely sure you want to delete your NYSC account? To confirm, please type <strong className="text-white font-mono">DELETE</strong> in the box below:
            </p>

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={e => setDeleteConfirmationText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full bg-slate-950 border border-rose-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500 uppercase"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setDeleteConfirmationText('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  deleteUserAccountAndData();
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-rose-950/60 transition-all"
              >
                Permanently Wipe All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Modals */}
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <TermsOfServiceModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </>
  );
};
