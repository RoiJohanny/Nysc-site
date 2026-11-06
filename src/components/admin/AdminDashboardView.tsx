import React, { useState, useEffect } from 'react';
import { useNysc } from '../../context/NyscContext';
import { NIGERIAN_STATES, NIGERIAN_STATE_LGAS } from '../../data/mockSeed';
import {
  BroadcastNotice,
  FeedbackCategory,
  FeedbackStatus,
  MarketplaceItem,
  CorperDirectoryMember,
  AdminUserRecord,
  SosEmergencyLog
} from '../../types/nysc';
import {
  ShieldAlert,
  Users,
  Activity,
  ShoppingBag,
  Briefcase,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  Webhook,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  ArrowLeft,
  Settings,
  Flame,
  Radio,
  FileCode,
  Zap,
  Sliders,
  Lock,
  ShieldCheck,
  Megaphone,
  Palette,
  SlidersHorizontal,
  Ban,
  Trash2,
  Plus,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Phone,
  MapPin,
  Calendar,
  AlertOctagon
} from 'lucide-react';

interface AdminDashboardViewProps {
  onBackToApp: () => void;
}

type AdminTab = 'branding' | 'tracker' | 'moderation' | 'security';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onBackToApp }) => {
  const {
    profile,
    marketplaceItems,
    toggleMarketplaceTakedown,
    directoryMembers,
    toggleDirectorySuspension,
    userFeedback,
    toggleFeedbackStatus,
    deleteFeedback,
    webhookConfig,
    updateWebhookConfig,
    webhookLogs,
    triggerWebhookTest,
    fireConfetti,
    brandingConfig,
    updateBrandingConfig,
    addBroadcastNotice,
    updateBroadcastNotice,
    deleteBroadcastNotice,
    trackerConfig,
    updateTrackerConfig,
    sosEmergencyLogs,
    addSosEmergencyLog,
    updateSosEmergencyLog,
    adminUsers,
    toggleUserBan,
    toggleUserAdminRole,
    resetToDefaultData
  } = useNysc();

  // Strict Protection: If not admin, immediately redirect back to main app
  useEffect(() => {
    if (!profile.is_admin) {
      if (typeof window !== 'undefined') {
        window.location.hash = '#/dashboard';
      }
      onBackToApp();
    }
  }, [profile.is_admin, onBackToApp]);

  // Active Tab: 1. Branding, 2. Tracker Config, 3. Content Moderation, 4. Security & Users
  const [activeTab, setActiveTab] = useState<AdminTab>('branding');

  // Simulated Realtime Operations counter
  const [onlinePresenceCount, setOnlinePresenceCount] = useState<number>(42);
  const [presencePing, setPresencePing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlinePresenceCount(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(34, Math.min(58, prev + delta));
      });
      setPresencePing(true);
      setTimeout(() => setPresencePing(false), 800);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Toast / feedback status
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // --------------------------------------------------------------------------
  // TAB 1: BRANDING (Logo upload & Notices)
  // --------------------------------------------------------------------------
  const [logoInputUrl, setLogoInputUrl] = useState(brandingConfig.app_logo_url);
  const [appNameInput, setAppNameInput] = useState(brandingConfig.app_name);
  const [taglineInput, setTaglineInput] = useState(brandingConfig.custom_tagline || '');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandingConfig({
      app_logo_url: logoInputUrl.trim() || '/icon.svg',
      app_name: appNameInput.trim() || 'My NYSC Companion',
      custom_tagline: taglineInput.trim()
    });
    showToast('Branding settings saved successfully!');
    fireConfetti();
  };

  const handleFileLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Logo file size must be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogoInputUrl(result);
        updateBrandingConfig({ app_logo_url: result });
        showToast('Custom logo uploaded & applied!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefaultLogo = () => {
    setLogoInputUrl('/icon.svg');
    setAppNameInput('My NYSC Companion');
    setTaglineInput('Under The Sun or In The Rain, Service To The Fatherland');
    updateBrandingConfig({
      app_logo_url: '/icon.svg',
      app_name: 'My NYSC Companion',
      custom_tagline: 'Under The Sun or In The Rain, Service To The Fatherland'
    });
    showToast('Branding reset to default.');
  };

  // Broadcast Notice Form State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeType, setNoticeType] = useState<BroadcastNotice['notice_type']>('urgent');
  const [noticeAudience, setNoticeAudience] = useState<BroadcastNotice['target_audience']>('all');
  const [noticeIsActive, setNoticeIsActive] = useState(true);

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeMessage.trim()) return;

    addBroadcastNotice({
      title: noticeTitle.trim(),
      message: noticeMessage.trim(),
      notice_type: noticeType,
      target_audience: noticeAudience,
      is_active: noticeIsActive,
      author: profile.full_name || 'NYSC Directorate'
    });

    setNoticeTitle('');
    setNoticeMessage('');
    showToast('Broadcast notice published to all active corps members!');
    fireConfetti();
  };

  // --------------------------------------------------------------------------
  // TAB 2: TRACKER CONFIG (Clearance milestones & Default values)
  // --------------------------------------------------------------------------
  const [bioStartDay, setBioStartDay] = useState(trackerConfig.biometric_start_day);
  const [bioEndDay, setBioEndDay] = useState(trackerConfig.biometric_deadline_day);
  const [reqPpaLetter, setReqPpaLetter] = useState(trackerConfig.require_ppa_letter);
  const [reqLgiApproval, setReqLgiApproval] = useState(trackerConfig.require_lgi_approval);
  const [minCdsMeetings, setMinCdsMeetings] = useState(trackerConfig.min_monthly_cds_attendance);
  const [cdsDues, setCdsDues] = useState(trackerConfig.standard_cds_dues);
  const [cdsDay, setCdsDay] = useState(trackerConfig.default_cds_meeting_day);
  const [cdsTime, setCdsTime] = useState(trackerConfig.default_cds_meeting_time);
  const [fedAlawee, setFedAlawee] = useState(trackerConfig.default_federal_alawee);

  // State allowance overrides
  const [stateAllowances, setStateAllowances] = useState<Record<string, number>>(
    trackerConfig.state_allowances || {}
  );
  const [newAllowanceState, setNewAllowanceState] = useState('Rivers');
  const [newAllowanceAmount, setNewAllowanceAmount] = useState('10000');

  // Batch Streams
  const [batchStreams, setBatchStreams] = useState<string[]>(trackerConfig.batch_streams || []);
  const [newBatchStreamInput, setNewBatchStreamInput] = useState('');

  const handleSaveTrackerConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateTrackerConfig({
      biometric_start_day: Number(bioStartDay) || 1,
      biometric_deadline_day: Number(bioEndDay) || 25,
      require_ppa_letter: reqPpaLetter,
      require_lgi_approval: reqLgiApproval,
      min_monthly_cds_attendance: Number(minCdsMeetings) || 4,
      standard_cds_dues: Number(cdsDues) || 1000,
      default_cds_meeting_day: cdsDay,
      default_cds_meeting_time: cdsTime,
      default_federal_alawee: Number(fedAlawee) || 77000,
      state_allowances: stateAllowances,
      batch_streams: batchStreams
    });
    showToast('Clearance milestones and tracker defaults saved!');
    fireConfetti();
  };

  const handleAddStateAllowance = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(newAllowanceAmount);
    if (isNaN(amt) || amt < 0) return;
    setStateAllowances(prev => ({
      ...prev,
      [newAllowanceState]: amt
    }));
    showToast(`Saved ${newAllowanceState} State Allowance as ₦${amt.toLocaleString()}`);
  };

  const handleRemoveStateAllowance = (stateName: string) => {
    setStateAllowances(prev => {
      const copy = { ...prev };
      delete copy[stateName];
      return copy;
    });
  };

  const handleAddBatchStream = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBatchStreamInput.trim();
    if (!trimmed || batchStreams.includes(trimmed)) return;
    setBatchStreams(prev => [...prev, trimmed]);
    setNewBatchStreamInput('');
    showToast(`Added batch stream: ${trimmed}`);
  };

  const handleRemoveBatchStream = (streamName: string) => {
    setBatchStreams(prev => prev.filter(s => s !== streamName));
  };

  // --------------------------------------------------------------------------
  // TAB 3: CONTENT MODERATION (Marketplace & Directory takedowns)
  // --------------------------------------------------------------------------
  const [mktSearch, setMktSearch] = useState('');
  const [mktStatusFilter, setMktStatusFilter] = useState<'all' | 'active' | 'taken_down'>('all');
  const [takedownReasonModalItem, setTakedownReasonModalItem] = useState<MarketplaceItem | null>(null);
  const [takedownReasonInput, setTakedownReasonInput] = useState('Violated marketplace condition guidelines');

  const filteredMarketplace = marketplaceItems.filter(item => {
    if (mktStatusFilter === 'active' && item.is_taken_down) return false;
    if (mktStatusFilter === 'taken_down' && !item.is_taken_down) return false;
    if (mktSearch.trim()) {
      const q = mktSearch.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSeller = item.seller_name.toLowerCase().includes(q);
      const matchState = item.state.toLowerCase().includes(q);
      const matchLga = item.lga.toLowerCase().includes(q);
      return matchTitle || matchSeller || matchState || matchLga;
    }
    return true;
  });

  const handleConfirmTakedown = () => {
    if (!takedownReasonModalItem) return;
    toggleMarketplaceTakedown(takedownReasonModalItem.id, takedownReasonInput);
    setTakedownReasonModalItem(null);
    showToast(`Listing "${takedownReasonModalItem.title}" taken down from public view.`);
  };

  // Directory moderation
  const [dirSearch, setDirSearch] = useState('');
  const [dirStatusFilter, setDirStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [suspendMemberModalItem, setSuspendMemberModalItem] = useState<CorperDirectoryMember | null>(null);
  const [suspendReasonInput, setSuspendReasonInput] = useState('Unverified profile / code of conduct review');

  const filteredDirectory = directoryMembers.filter(member => {
    if (dirStatusFilter === 'active' && member.is_suspended) return false;
    if (dirStatusFilter === 'suspended' && !member.is_suspended) return false;
    if (dirSearch.trim()) {
      const q = dirSearch.toLowerCase().trim();
      return (
        member.full_name.toLowerCase().includes(q) ||
        member.state_code.toLowerCase().includes(q) ||
        member.state.toLowerCase().includes(q) ||
        member.lga.toLowerCase().includes(q) ||
        member.ppa.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConfirmSuspendMember = () => {
    if (!suspendMemberModalItem) return;
    toggleDirectorySuspension(suspendMemberModalItem.id, suspendReasonInput);
    setSuspendMemberModalItem(null);
    showToast(`Corper "${suspendMemberModalItem.full_name}" directory visibility suspended.`);
  };

  // --------------------------------------------------------------------------
  // TAB 4: SECURITY & USERS (Banning, Feedback queue, and Emergency SOS log)
  // --------------------------------------------------------------------------
  const [userSearch, setUserSearch] = useState('');
  const [banReasonModalUser, setBanReasonModalUser] = useState<AdminUserRecord | null>(null);
  const [banReasonInput, setBanReasonInput] = useState('Severe violation of NYSC National Bye-laws');

  const filteredUsers = adminUsers.filter(u => {
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase().trim();
      return (
        u.full_name.toLowerCase().includes(q) ||
        (u.state_code || '').toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.state_of_deployment.toLowerCase().includes(q) ||
        u.lga.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConfirmBanUser = () => {
    if (!banReasonModalUser) return;
    toggleUserBan(banReasonModalUser.id, banReasonInput);
    setBanReasonModalUser(null);
    showToast(`User ${banReasonModalUser.full_name} account ban status updated.`);
  };

  // Feedback queue
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<'all' | FeedbackCategory>('all');
  const [feedbackSearch, setFeedbackSearch] = useState('');

  const filteredFeedback = userFeedback.filter(fb => {
    if (feedbackStatusFilter !== 'all' && fb.status !== feedbackStatusFilter) return false;
    if (feedbackCategoryFilter !== 'all' && fb.category !== feedbackCategoryFilter) return false;
    if (feedbackSearch.trim()) {
      const q = feedbackSearch.toLowerCase().trim();
      return (
        fb.user_name.toLowerCase().includes(q) ||
        fb.message.toLowerCase().includes(q) ||
        fb.user_phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Emergency SOS Drill simulation
  const handleSimulateEmergencySos = () => {
    const drillLogs: Omit<SosEmergencyLog, 'id' | 'created_at'> = {
      user_id: `drill-user-${Date.now()}`,
      user_name: 'Blessing Chukwuma (Drill Test)',
      user_phone: '+234 802 888 7766',
      state_code: 'RV/26A/7710',
      state: profile.state_of_deployment || 'Rivers',
      lga: profile.lga || 'Port Harcourt',
      emergency_type: 'transit_accident',
      latitude: 4.8156,
      longitude: 7.0498,
      details: 'DRILL SIMULATION: Broken down transit bus near Obio-Akpor junction. Testing fast dispatch response.',
      status: 'active'
    };
    addSosEmergencyLog(drillLogs);
    showToast('🚨 Emergency SOS Drill simulated! Distress alert logged.');
    fireConfetti();
  };

  const handleDispatchSos = (logId: string) => {
    updateSosEmergencyLog(logId, {
      status: 'dispatched',
      dispatch_notes: `Patrol response vehicle dispatched by ${profile.full_name} at ${new Date().toLocaleTimeString()}`
    });
    showToast('Emergency assistance dispatched!');
  };

  const handleResolveSos = (logId: string) => {
    updateSosEmergencyLog(logId, {
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      dispatch_notes: 'Distress incident fully attended and resolved by local authorities.'
    });
    showToast('Emergency SOS marked as RESOLVED.');
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Banner / Navigation Return Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToApp}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-500/50 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Return to Corper Companion App"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Back to App</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] uppercase font-bold border border-amber-500/30">
                  Restricted /admin
                </span>
                <span className="text-xs text-slate-400">
                  Welcome, Director <strong className="text-slate-200">{profile.full_name}</strong>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                <span>NYSC Directorate Admin Panel</span>
              </h1>
            </div>
          </div>

          {/* Quick Metrics & Live Status */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${presencePing ? 'bg-amber-400 scale-125' : 'bg-emerald-400'} transition-all duration-300`} />
              <span className="text-slate-400">Active Corpers:</span>
              <span className="font-mono font-bold text-white">{onlinePresenceCount}</span>
            </div>

            <button
              onClick={resetToDefaultData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
              title="Reset sample data back to standard demo values"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>

        {/* Action Toast Alert */}
        {actionSuccessMsg && (
          <div className="mt-4 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* 4 Dedicated Tabs Navigation */}
        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            
            {/* Tab 1: Branding */}
            <button
              onClick={() => setActiveTab('branding')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'branding'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-102'
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>1. Branding & Notices</span>
            </button>

            {/* Tab 2: Tracker Config */}
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'tracker'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-102'
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>2. Tracker Config</span>
            </button>

            {/* Tab 3: Content Moderation */}
            <button
              onClick={() => setActiveTab('moderation')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'moderation'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-102'
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>3. Moderation</span>
            </button>

            {/* Tab 4: Security & Users */}
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'security'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-102'
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>4. Security & Users</span>
            </button>

          </div>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: BRANDING (Logo upload & Notices)
      ===================================================================== */}
      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Logo & Identity Customization */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">App Logo & Brand Identity</h2>
              </div>
              <p className="text-xs text-slate-400 mb-5">
                Customize the visual emblem, application title, and official motto shown on the navigation bar, login screens, and PWA manifest.
              </p>

              {/* Logo Preview Mockup */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={logoInputUrl || '/icon.svg'}
                    alt="App Logo Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/icon.svg';
                    }}
                  />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white">
                    {appNameInput || 'My NYSC Companion'}
                  </div>
                  <div className="text-[11px] text-amber-400 italic">
                    {taglineInput || 'Under The Sun or In The Rain'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Dimensions: 1:1 Square (Vector SVG or PNG supported)
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveBranding} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Upload Logo File
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleFileLogoUpload}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Choose Image File</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDefaultLogo}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
                      title="Reset to default icon.svg"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Or Direct Logo Image URL
                  </label>
                  <input
                    type="text"
                    value={logoInputUrl}
                    onChange={(e) => setLogoInputUrl(e.target.value)}
                    placeholder="https://... or /icon.svg"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    App Display Name
                  </label>
                  <input
                    type="text"
                    value={appNameInput}
                    onChange={(e) => setAppNameInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Official Tagline / Motto
                  </label>
                  <input
                    type="text"
                    value={taglineInput}
                    onChange={(e) => setTaglineInput(e.target.value)}
                    placeholder="e.g. Under The Sun or In The Rain"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Branding Identity</span>
                </button>
              </form>
            </div>
          </div>

          {/* Broadcast Notices Manager */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">Broadcast Notices & Directives</h2>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {brandingConfig.notices.length} notices
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-5">
                Issue live administrative notices displayed at the top of every serving corper's dashboard.
              </p>

              {/* Create Notice Form */}
              <form onSubmit={handleCreateNotice} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 mb-6">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Draft New Broadcast Notice</span>
                </div>

                <div>
                  <input
                    type="text"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="Notice Headline (e.g. 🚨 Biometrics Closes Nov 25th)"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <textarea
                    value={noticeMessage}
                    onChange={(e) => setNoticeMessage(e.target.value)}
                    placeholder="Directive details, LGA instructions, or alawee payment update..."
                    rows={2}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Urgency Priority
                    </label>
                    <select
                      value={noticeType}
                      onChange={(e) => setNoticeType(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none"
                    >
                      <option value="urgent">🔴 Urgent Warning</option>
                      <option value="warning">🟡 Security Warning</option>
                      <option value="info">🔵 General Directive</option>
                      <option value="success">🟢 Success / Announcement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Target Audience
                    </label>
                    <select
                      value={noticeAudience}
                      onChange={(e) => setNoticeAudience(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none"
                    >
                      <option value="all">👥 All Corpers</option>
                      <option value="active">💼 Serving Corpers (PPA)</option>
                      <option value="camp">🏕️ Orientation Camp</option>
                      <option value="pcm">🎓 Prospective (PCMs)</option>
                      <option value="pop">🎉 Passing Out (POP)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2">
                      <input
                        type="checkbox"
                        checked={noticeIsActive}
                        onChange={(e) => setNoticeIsActive(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-xs font-semibold text-slate-200">
                        Publish Active
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Broadcast Directive</span>
                </button>
              </form>

              {/* Existing Notices List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Directives ({brandingConfig.notices.length})
                </div>

                {brandingConfig.notices.map((n) => {
                  const badgeColor =
                    n.notice_type === 'urgent'
                      ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : n.notice_type === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : n.notice_type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30';

                  return (
                    <div
                      key={n.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        n.is_active
                          ? 'bg-slate-950/90 border-slate-800'
                          : 'bg-slate-950/40 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${badgeColor}`}>
                              {n.notice_type}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Target: {n.target_audience.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {n.message}
                          </p>
                          <div className="text-[10px] text-slate-500">
                            Issued by {n.author} • {new Date(n.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => updateBroadcastNotice(n.id, { is_active: !n.is_active })}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                              n.is_active
                                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                            title={n.is_active ? 'Click to deactivate' : 'Click to activate'}
                          >
                            {n.is_active ? 'Active' : 'Draft'}
                          </button>
                          <button
                            onClick={() => deleteBroadcastNotice(n.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                            title="Delete notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* =====================================================================
          TAB 2: TRACKER CONFIG (Clearance milestones & Default values)
      ===================================================================== */}
      {activeTab === 'tracker' && (
        <form onSubmit={handleSaveTrackerConfig} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Clearance Milestones Configuration */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Monthly Clearance Milestones</h2>
              </div>
              <p className="text-xs text-slate-400">
                Configure calendar dates and mandatory prerequisite uploads required for corpers to achieve monthly biometric sign-off.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Biometric Window Starts (Day of Month)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={bioStartDay}
                    onChange={(e) => setBioStartDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500">e.g. 1st of every month</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Biometric Deadline (Day of Month)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={bioEndDay}
                    onChange={(e) => setBioEndDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono font-bold text-amber-400"
                  />
                  <span className="text-[10px] text-slate-500">e.g. 25th of month cutoff</span>
                </div>
              </div>

              {/* Clearance Prerequisite Toggles */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-white">Require PPA Monthly Clearance Letter</div>
                    <div className="text-[10px] text-slate-400">Corps members must upload signed employer letter before clearance unlocks</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={reqPpaLetter}
                    onChange={(e) => setReqPpaLetter(e.target.checked)}
                    className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500"
                  />
                </label>

                <div className="border-t border-slate-800 pt-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-white">Require LGI Digital Stamp & Approval</div>
                      <div className="text-[10px] text-slate-400">Local Government Inspector sign-off required for alawee dispatch</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={reqLgiApproval}
                      onChange={(e) => setReqLgiApproval(e.target.checked)}
                      className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500"
                    />
                  </label>
                </div>
              </div>

              {/* CDS Milestones */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Min CDS Attendances / Mo
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={minCdsMeetings}
                    onChange={(e) => setMinCdsMeetings(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Standard CDS Dues (₦)
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={cdsDues}
                    onChange={(e) => setCdsDues(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Default CDS Meeting Day
                  </label>
                  <select
                    value={cdsDay}
                    onChange={(e) => setCdsDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Default Meeting Time
                  </label>
                  <input
                    type="text"
                    value={cdsTime}
                    onChange={(e) => setCdsTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Default Values & State Allowances */}
            <div className="space-y-6">
              
              {/* Federal Alawee Default */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">Default Values & Alawee Scale</h2>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    National Federal Allowance Baseline (Alawee)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-emerald-400">₦</span>
                    <input
                      type="number"
                      step="1000"
                      value={fedAlawee}
                      onChange={(e) => setFedAlawee(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono font-bold"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Statutory Federal Monthly Allowance (Standard: ₦77,000 for 2026/2027)
                  </span>
                </div>
              </div>

              {/* State Allowance Overrides */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>State Monthly Allowance Overrides</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {Object.keys(stateAllowances).length} states
                  </span>
                </div>

                {/* Add or update state allowance */}
                <div className="flex gap-2">
                  <select
                    value={newAllowanceState}
                    onChange={(e) => setNewAllowanceState(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none"
                  >
                    {NIGERIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="500"
                    placeholder="Amount (₦)"
                    value={newAllowanceAmount}
                    onChange={(e) => setNewAllowanceAmount(e.target.value)}
                    className="w-28 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddStateAllowance}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700"
                  >
                    Save
                  </button>
                </div>

                {/* Table of state allowances */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {Object.entries(stateAllowances).map(([stName, stAmt]) => (
                    <div
                      key={stName}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                    >
                      <span className="font-semibold text-slate-200">{stName} State</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400 font-bold">
                          ₦{stAmt.toLocaleString()}/mo
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStateAllowance(stName)}
                          className="p-1 text-slate-500 hover:text-red-400"
                          title="Remove override"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Batch & Stream Registry */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Batch & Stream Registry</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 2026 Batch C Stream 1"
                    value={newBatchStreamInput}
                    onChange={(e) => setNewBatchStreamInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddBatchStream}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {batchStreams.map((bs) => (
                    <span
                      key={bs}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[11px] flex items-center gap-1.5"
                    >
                      <span>{bs}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBatchStream(bs)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="py-3 px-8 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-black flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Save All Tracker Configurations</span>
            </button>
          </div>
        </form>
      )}

      {/* =====================================================================
          TAB 3: CONTENT MODERATION (Marketplace & Directory takedowns)
      ===================================================================== */}
      {activeTab === 'moderation' && (
        <div className="space-y-8">
          
          {/* Section 1: Marketplace Moderation */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">Marketplace Content Moderation</h2>
                </div>
                <p className="text-xs text-slate-400">
                  Review corper gear listings. Take down prohibited items, fraudulent pricing, or policy violations.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search listing or seller..."
                    value={mktSearch}
                    onChange={(e) => setMktSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none w-44"
                  />
                </div>

                <div className="flex rounded-xl bg-slate-950 p-0.5 border border-slate-800 text-xs">
                  <button
                    onClick={() => setMktStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-semibold ${
                      mktStatusFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    All ({marketplaceItems.length})
                  </button>
                  <button
                    onClick={() => setMktStatusFilter('active')}
                    className={`px-2.5 py-1 rounded-lg font-semibold ${
                      mktStatusFilter === 'active' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setMktStatusFilter('taken_down')}
                    className={`px-2.5 py-1 rounded-lg font-semibold ${
                      mktStatusFilter === 'taken_down' ? 'bg-red-500 text-white' : 'text-slate-400'
                    }`}
                  >
                    Taken Down ({marketplaceItems.filter(i => i.is_taken_down).length})
                  </button>
                </div>
              </div>
            </div>

            {/* Marketplace Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMarketplace.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.is_taken_down
                      ? 'bg-red-950/20 border-red-500/40 opacity-80'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=200&q=80'}
                      alt={item.title}
                      className="w-20 h-20 rounded-xl object-cover bg-slate-900 shrink-0 border border-slate-800"
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.is_taken_down
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {item.is_taken_down ? 'Taken Down' : 'Active'}
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          ₦{item.price.toLocaleString()}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white truncate" title={item.title}>
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.state} • {item.lga} LGA
                      </p>
                      <div className="text-[10px] text-slate-500">
                        Seller: {item.seller_name} ({item.seller_phone})
                      </div>
                    </div>
                  </div>

                  {item.is_taken_down && item.takedown_reason && (
                    <div className="mt-2.5 p-2 rounded-lg bg-red-950/40 border border-red-900/60 text-[11px] text-red-300">
                      <strong>Takedown Reason:</strong> {item.takedown_reason}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">ID: {item.id}</span>
                    {item.is_taken_down ? (
                      <button
                        onClick={() => toggleMarketplaceTakedown(item.id)}
                        className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-all border border-emerald-500/30"
                      >
                        Restore Listing
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setTakedownReasonModalItem(item);
                          setTakedownReasonInput('Violated marketplace condition guidelines');
                        }}
                        className="px-3 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold transition-all border border-red-500/30"
                      >
                        Take Down
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Corper Directory Moderation */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">Corpers Directory Moderation & Visibility</h2>
                </div>
                <p className="text-xs text-slate-400">
                  Suspend impersonators or abusive accounts from the public Corper Directory.
                </p>
              </div>

              {/* Directory search & filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name or state code..."
                    value={dirSearch}
                    onChange={(e) => setDirSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none w-48"
                  />
                </div>

                <div className="flex rounded-xl bg-slate-950 p-0.5 border border-slate-800 text-xs">
                  <button
                    onClick={() => setDirStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-semibold ${
                      dirStatusFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    All ({directoryMembers.length})
                  </button>
                  <button
                    onClick={() => setDirStatusFilter('active')}
                    className={`px-2.5 py-1 rounded-lg font-semibold ${
                      dirStatusFilter === 'active' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setDirStatusFilter('suspended')}
                    className={`px-2.5 py-1 rounded-lg font-semibold ${
                      dirStatusFilter === 'suspended' ? 'bg-red-500 text-white' : 'text-slate-400'
                    }`}
                  >
                    Suspended ({directoryMembers.filter(m => m.is_suspended).length})
                  </button>
                </div>
              </div>
            </div>

            {/* Directory Members Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Corper</th>
                    <th className="py-2.5 px-3">State Code</th>
                    <th className="py-2.5 px-3">Deployment</th>
                    <th className="py-2.5 px-3">PPA & CDS</th>
                    <th className="py-2.5 px-3">Directory Status</th>
                    <th className="py-2.5 px-3 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredDirectory.map((m) => (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        m.is_suspended ? 'bg-red-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={m.avatar}
                            alt={m.full_name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white">{m.full_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{m.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-amber-400 font-bold">
                        {m.state_code}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {m.state} State ({m.lga} LGA)
                      </td>
                      <td className="py-3 px-3 text-slate-300 max-w-xs truncate">
                        <div>{m.ppa}</div>
                        <div className="text-[10px] text-slate-500">{m.cds}</div>
                      </td>
                      <td className="py-3 px-3">
                        {m.is_suspended ? (
                          <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
                            Suspended: {m.suspension_reason || 'Under review'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            Visible
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {m.is_suspended ? (
                          <button
                            onClick={() => toggleDirectorySuspension(m.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSuspendMemberModalItem(m);
                              setSuspendReasonInput('Unverified profile or spam behavior');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* =====================================================================
          TAB 4: SECURITY & USERS (Banning, Feedback queue, and Emergency SOS log)
      ===================================================================== */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          
          {/* Section 1: User Accounts & Banning */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">Registered Corpers & Access Governance</h2>
                </div>
                <p className="text-xs text-slate-400">
                  Manage user accounts, ban non-compliant corpers, and manage administrator privilege elevation.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user, phone, state..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none w-56"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Corper Account</th>
                    <th className="py-2.5 px-3">State Code</th>
                    <th className="py-2.5 px-3">Deployment</th>
                    <th className="py-2.5 px-3">Batch / Stream</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        u.is_banned ? 'bg-red-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{u.full_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {u.phone} • {u.email}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-400 font-bold">
                        {u.state_code || 'UNASSIGNED'}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {u.state_of_deployment} ({u.lga} LGA)
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {u.batch_stream}
                      </td>
                      <td className="py-3 px-3">
                        {u.is_admin ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            DIRECTOR / ADMIN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-semibold">
                            Corper
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {u.is_banned ? (
                          <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
                            BANNED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleUserAdminRole(u.id)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold"
                            title={u.is_admin ? 'Demote from Admin' : 'Elevate to Admin'}
                          >
                            {u.is_admin ? 'Demote' : 'Make Admin'}
                          </button>

                          {u.is_banned ? (
                            <button
                              onClick={() => toggleUserBan(u.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold"
                            >
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setBanReasonModalUser(u);
                                setBanReasonInput('Severe violation of NYSC National Bye-laws');
                              }}
                              className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px] font-bold"
                            >
                              Ban
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Emergency SOS Dispatch Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
                  <h2 className="text-lg font-bold text-white">Emergency SOS Incident Log & Dispatch Queue</h2>
                </div>
                <p className="text-xs text-slate-400">
                  Real-time distress broadcasts initiated by corps members across all 36 States & FCT Abuja.
                </p>
              </div>

              <button
                onClick={handleSimulateEmergencySos}
                className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <AlertOctagon className="w-4 h-4 text-red-400" />
                <span>Simulate SOS Distress Drill</span>
              </button>
            </div>

            <div className="space-y-3">
              {sosEmergencyLogs.map((log) => {
                const isUrgent = log.status === 'active';
                const statusColor =
                  log.status === 'active'
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : log.status === 'dispatched'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                return (
                  <div
                    key={log.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isUrgent
                        ? 'bg-red-950/30 border-red-500/50 shadow-md shadow-red-500/10'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${statusColor}`}>
                            {log.status}
                          </span>
                          <span className="text-sm font-black text-white">
                            {log.user_name}
                          </span>
                          <span className="text-xs text-amber-400 font-mono font-bold">
                            {log.state_code}
                          </span>
                          <span className="text-xs text-slate-400">
                            📍 {log.state} State ({log.lga} LGA)
                          </span>
                        </div>

                        <p className="text-xs text-slate-200">
                          <strong>Incident:</strong> {log.details || 'Emergency distress trigger'}
                        </p>

                        <div className="text-[11px] text-slate-400 flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            {log.user_phone}
                          </span>
                          {log.latitude && log.longitude && (
                            <span className="font-mono text-[10px] text-slate-500">
                              Coords: {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                            </span>
                          )}
                          <span className="text-slate-500">
                            Triggered: {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>

                        {log.dispatch_notes && (
                          <div className="mt-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                            <strong>Dispatch Log:</strong> {log.dispatch_notes}
                          </div>
                        )}
                      </div>

                      {/* Dispatch Actions */}
                      <div className="flex sm:flex-col items-center gap-2 shrink-0">
                        {log.status === 'active' && (
                          <button
                            onClick={() => handleDispatchSos(log.id)}
                            className="w-full px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all"
                          >
                            Dispatch Patrol
                          </button>
                        )}
                        {log.status !== 'resolved' && (
                          <button
                            onClick={() => handleResolveSos(log.id)}
                            className="w-full px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Feedback & Webhooks */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">Corper Feedback & Bug Triage Queue</h2>
                </div>
                <p className="text-xs text-slate-400">
                  Review corper feature requests, camp bug tickets, and general Directorate feedback.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search feedback..."
                    value={feedbackSearch}
                    onChange={(e) => setFeedbackSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none w-44"
                  />
                </div>

                <div className="flex rounded-xl bg-slate-950 p-0.5 border border-slate-800 text-xs">
                  <button
                    onClick={() => setFeedbackStatusFilter('all')}
                    className={`px-2 py-1 rounded-lg font-semibold ${
                      feedbackStatusFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFeedbackStatusFilter('pending')}
                    className={`px-2 py-1 rounded-lg font-semibold ${
                      feedbackStatusFilter === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFeedbackStatusFilter('resolved')}
                    className={`px-2 py-1 rounded-lg font-semibold ${
                      feedbackStatusFilter === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>
            </div>

            {/* Feedback List */}
            <div className="space-y-3">
              {filteredFeedback.map((fb) => (
                <div
                  key={fb.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    fb.status === 'resolved'
                      ? 'bg-slate-950/40 border-slate-900 opacity-70'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          fb.category === 'bug'
                            ? 'bg-red-500/20 text-red-300'
                            : fb.category === 'feature_request'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {fb.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {fb.user_name}
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono">
                          {fb.user_phone}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(fb.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {fb.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleFeedbackStatus(fb.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                          fb.status === 'resolved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title="Toggle status"
                      >
                        {fb.status === 'resolved' ? 'Resolved ✓' : 'Mark Done'}
                      </button>
                      <button
                        onClick={() => deleteFeedback(fb.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                        title="Delete feedback"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* =====================================================================
          MODALS FOR TAKEDOWNS / SUSPENSIONS / BANNING
      ===================================================================== */}
      {/* Marketplace Takedown Modal */}
      {takedownReasonModalItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Take Down Marketplace Listing</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove <strong>"{takedownReasonModalItem.title}"</strong> (₦{takedownReasonModalItem.price.toLocaleString()}) from public view?
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Reason for Takedown
              </label>
              <textarea
                value={takedownReasonInput}
                onChange={(e) => setTakedownReasonInput(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTakedownReasonModalItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTakedown}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Confirm Takedown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Directory Suspend Member Modal */}
      {suspendMemberModalItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-2 text-red-400">
              <Ban className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Suspend Corper Directory Profile</h3>
            </div>
            <p className="text-xs text-slate-300">
              Suspend directory visibility for <strong>{suspendMemberModalItem.full_name}</strong> ({suspendMemberModalItem.state_code}).
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Reason for Suspension
              </label>
              <textarea
                value={suspendReasonInput}
                onChange={(e) => setSuspendReasonInput(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSuspendMemberModalItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspendMember}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Ban Modal */}
      {banReasonModalUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-2 text-red-400">
              <Ban className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Ban Corper Account</h3>
            </div>
            <p className="text-xs text-slate-300">
              Ban account access for <strong>{banReasonModalUser.full_name}</strong> ({banReasonModalUser.phone}).
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Formal Reason for Ban
              </label>
              <textarea
                value={banReasonInput}
                onChange={(e) => setBanReasonInput(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBanReasonModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBanUser}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Confirm Account Ban
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
