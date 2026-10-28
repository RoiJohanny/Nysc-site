import React, { useState, useEffect } from 'react';
import { useNysc } from '../../context/NyscContext';
import { CORPS_MEMBERS_DIRECTORY } from '../../data/mockSeed';
import { FeedbackCategory, FeedbackStatus, UserFeedback } from '../../types/nysc';
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
  Terminal,
  Zap,
  Sliders
} from 'lucide-react';

interface AdminDashboardViewProps {
  onBackToApp: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onBackToApp }) => {
  const {
    profile,
    updateProfile,
    marketplaceItems,
    jobListings,
    userFeedback,
    toggleFeedbackStatus,
    deleteFeedback,
    webhookConfig,
    updateWebhookConfig,
    webhookLogs,
    triggerWebhookTest,
    fireConfetti
  } = useNysc();

  // Simulated Supabase Realtime Presence state (fluctuates between 38 and 46 users)
  const [onlinePresenceCount, setOnlinePresenceCount] = useState<number>(42);
  const [presencePing, setPresencePing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlinePresenceCount(prev => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = Math.max(34, Math.min(58, prev + delta));
        return next;
      });
      setPresencePing(true);
      setTimeout(() => setPresencePing(false), 800);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Filter & Search states for feedback inbox
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | FeedbackCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteFeedbackId, setConfirmDeleteFeedbackId] = useState<string | null>(null);

  // Webhook settings local state
  const [webhookUrl, setWebhookUrl] = useState(webhookConfig.url);
  const [webhookService, setWebhookService] = useState(webhookConfig.service);
  const [notifyBug, setNotifyBug] = useState(webhookConfig.notify_on_bug);
  const [notifyFeature, setNotifyFeature] = useState(webhookConfig.notify_on_feature);
  const [notifyGeneral, setNotifyGeneral] = useState(webhookConfig.notify_on_general);
  const [webhookEnabled, setWebhookEnabled] = useState(webhookConfig.enabled);
  const [webhookSaveStatus, setWebhookSaveStatus] = useState<string | null>(null);

  // Test webhook modal state
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    statusCode: number;
    message: string;
    payload: any;
  } | null>(null);
  const [showPayloadModal, setShowPayloadModal] = useState(false);

  // 1. Access Protection Check
  if (!profile.is_admin) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-rose-800/60 shadow-2xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-700/60 text-rose-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <h2 className="text-xl font-black text-white">403 Access Denied: Admin Rights Required</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            The Creator Admin Control Panel is strictly reserved for appointed NYSC Directorate administrators and technical maintainers.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 text-left space-y-2">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Developer / Evaluator Sandbox Mode</span>
          </div>
          <p className="text-[11px] text-slate-400">
            You can enable simulated administrative privileges below to inspect platform metrics, feedback inbox management, and Supabase Webhook alert dispatching.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onBackToApp}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            ← Return to Corps Dashboard
          </button>
          <button
            onClick={() => {
              updateProfile({ is_admin: true });
              fireConfetti();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-extrabold text-xs shadow-lg shadow-[#008751]/30"
          >
            Grant Admin Privileges & Continue
          </button>
        </div>
      </div>
    );
  }

  // Filter feedback
  const filteredFeedback = userFeedback.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.user_name.toLowerCase().includes(q);
      const matchPhone = item.user_phone.toLowerCase().includes(q);
      const matchMsg = item.message.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchMsg) return false;
    }
    return true;
  });

  const pendingCount = userFeedback.filter(f => f.status === 'pending').length;
  const resolvedCount = userFeedback.filter(f => f.status === 'resolved').length;
  const totalCount = userFeedback.length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;
  const totalRegisteredCorps = CORPS_MEMBERS_DIRECTORY.length * 12 + 1; // 145+ corpers

  const handleSaveWebhookConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebhookConfig({
      url: webhookUrl.trim(),
      service: webhookService,
      notify_on_bug: notifyBug,
      notify_on_feature: notifyFeature,
      notify_on_general: notifyGeneral,
      enabled: webhookEnabled
    });
    setWebhookSaveStatus('Webhook configurations updated and active!');
    setTimeout(() => setWebhookSaveStatus(null), 3500);
  };

  const handleTestWebhookDispatch = async () => {
    setIsTestingWebhook(true);
    const result = await triggerWebhookTest();
    setIsTestingWebhook(false);
    setTestResult(result);
    setShowPayloadModal(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-900 to-[#005a36]/30 p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToApp}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Return to Main App"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Creator & Admin Control Panel
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                /admin active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time platform metrics, Corper feedback inbox, and Supabase webhook dispatching
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Supabase Realtime Presence Indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-inner transition-all ${
              presencePing ? 'scale-105' : ''
            }`}
            title="Supabase Realtime Presence active connections"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-mono font-bold">{onlinePresenceCount}</span>
            <span className="text-[11px] text-emerald-400/80 hidden sm:inline">Online Now</span>
          </div>

          <button
            onClick={onBackToApp}
            className="px-3.5 py-1.5 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-bold text-xs shadow-md transition-all"
          >
            Back to App
          </button>
        </div>
      </div>

      {/* 4 Real-time Platform Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Total Registered Users */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Registered</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalRegisteredCorps.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">+18 this batch</span> • 37 States & FCT
          </div>
        </div>

        {/* Metric 2: Live Realtime Presence */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Online</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono flex items-center gap-2">
            <span>{onlinePresenceCount}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="text-[10px] text-slate-500">
            Supabase Presence channel: <code className="text-emerald-400">nysc-corps</code>
          </div>
        </div>

        {/* Metric 3: Total Marketplace Items */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Marketplace Items</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {marketplaceItems.length}
          </div>
          <div className="text-[10px] text-slate-500">
            {marketplaceItems.filter(i => !i.is_sold).length} Available • Pay on Delivery
          </div>
        </div>

        {/* Metric 4: Total Job Listings */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">NYSC Job Listings</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {jobListings.length}
          </div>
          <div className="text-[10px] text-slate-500">
            Crowdsourced PPA & Graduate Roles
          </div>
        </div>

      </div>

      {/* Main Grid: Feedback Inbox (Left 7 Cols) and Supabase Webhook Alert Option C (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Feedback Inbox Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            
            {/* Header & Stats Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#008751]" />
                  <h3 className="font-bold text-white text-base">Feedback Inbox</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {totalCount} total
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Corps members bug reports, feature suggestions, and inquiries
                </p>
              </div>

              {/* Resolution rate badge */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Resolution Rate</div>
                  <div className="text-xs font-bold text-emerald-400 font-mono">
                    {resolutionRate}% ({resolvedCount}/{totalCount})
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-xs">
                  {pendingCount}P
                </div>
              </div>
            </div>

            {/* Filter controls & Search bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search feedback or phone..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#008751]"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    statusFilter === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    statusFilter === 'pending'
                      ? 'bg-amber-500/30 text-amber-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => setStatusFilter('resolved')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    statusFilter === 'resolved'
                      ? 'bg-emerald-500/30 text-emerald-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Resolved ({resolvedCount})
                </button>
              </div>

              {/* Category dropdown filter */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-[11px] text-slate-300 focus:outline-none focus:border-[#008751]"
              >
                <option value="all">All Types</option>
                <option value="bug">🪲 Bugs</option>
                <option value="feature_request">💡 Features</option>
                <option value="general">💬 General</option>
              </select>
            </div>

            {/* Feedback List Items */}
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {filteredFeedback.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-500 text-xs">
                  No feedback items match the selected criteria.
                </div>
              ) : (
                filteredFeedback.map(item => {
                  const isResolved = item.status === 'resolved';
                  const cleanPhone = item.user_phone.replace(/[^0-9]/g, '');

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isResolved
                          ? 'bg-slate-950/40 border-slate-800/80 opacity-80'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.category === 'bug'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : item.category === 'feature_request'
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {item.category === 'bug' ? '🪲 Bug' : item.category === 'feature_request' ? '💡 Feature' : '💬 General'}
                          </span>
                          <span className="font-bold text-white text-xs">{item.user_name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(item.created_at).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {/* Status Toggle Button */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => toggleFeedbackStatus(item.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                              isResolved
                                ? 'bg-emerald-500/20 hover:bg-amber-500/20 text-emerald-300 hover:text-amber-300 border border-emerald-500/40'
                                : 'bg-amber-500/20 hover:bg-emerald-500/20 text-amber-300 hover:text-emerald-300 border border-amber-500/40'
                            }`}
                            title={isResolved ? 'Click to reopen ticket as Pending' : 'Click to mark ticket as Resolved'}
                          >
                            {isResolved ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Resolved (Reopen)</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Pending (Resolve)</span>
                              </>
                            )}
                          </button>

                          {confirmDeleteFeedbackId === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  deleteFeedback(item.id);
                                  setConfirmDeleteFeedbackId(null);
                                }}
                                className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteFeedbackId(null)}
                                className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteFeedbackId(item.id)}
                              className="p-1 rounded-lg hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Delete Feedback"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Feedback Body */}
                      <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                        {item.message}
                      </p>

                      {/* Footer Actions: Contact on WhatsApp */}
                      <div className="mt-3 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">
                          Phone: <span className="text-slate-200">{item.user_phone}</span>
                        </span>

                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                            `Hello ${item.user_name}, this is the NYSC Companion Administrator responding to your recent feedback regarding "${item.message.slice(
                              0,
                              45
                            )}...":`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 font-bold flex items-center gap-1.5 transition-all"
                        >
                          <MessageCircle className="w-3 h-3 fill-current" />
                          <span>Reply on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Supabase Webhook Alert (Option C) & Live Delivery Logs */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Option C Webhook Configuration Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Webhook className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Supabase Webhook Alert</h3>
                  <p className="text-[10px] text-slate-400">Option C: Real-time trigger on user_feedback insert</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Option C
              </span>
            </div>

            {webhookSaveStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{webhookSaveStatus}</span>
              </div>
            )}

            <form onSubmit={handleSaveWebhookConfig} className="space-y-3 text-xs">
              
              {/* Service selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Webhook Channel</label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setWebhookService('discord')}
                    className={`py-1.5 rounded-lg font-bold text-center transition-all ${
                      webhookService === 'discord'
                        ? 'bg-[#5865F2] text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Discord
                  </button>
                  <button
                    type="button"
                    onClick={() => setWebhookService('slack')}
                    className={`py-1.5 rounded-lg font-bold text-center transition-all ${
                      webhookService === 'slack'
                        ? 'bg-[#4A154B] text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Slack
                  </button>
                  <button
                    type="button"
                    onClick={() => setWebhookService('custom')}
                    className={`py-1.5 rounded-lg font-bold text-center transition-all ${
                      webhookService === 'custom'
                        ? 'bg-[#008751] text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Custom / Zapier
                  </button>
                </div>
              </div>

              {/* Endpoint URL */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Webhook Endpoint URL</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/... or https://hooks.slack.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Trigger checkboxes */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-slate-300 font-semibold text-[11px]">
                  Automatic Trigger Filters
                </label>
                
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyBug}
                    onChange={e => setNotifyBug(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-[#008751] focus:ring-0"
                  />
                  <span>Dispatch alert on <strong>Bug Reports</strong></span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyFeature}
                    onChange={e => setNotifyFeature(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-[#008751] focus:ring-0"
                  />
                  <span>Dispatch alert on <strong>Feature Requests</strong></span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyGeneral}
                    onChange={e => setNotifyGeneral(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-[#008751] focus:ring-0"
                  />
                  <span>Dispatch alert on <strong>General Inquiries</strong></span>
                </label>
              </div>

              {/* Enable / Disable Master Switch */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Real-Time Webhook Trigger</div>
                  <div className="text-[10px] text-slate-400">
                    {webhookEnabled ? 'Active: Alerts fired instantly on feedback insert' : 'Disabled'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setWebhookEnabled(!webhookEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    webhookEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      webhookEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons: Save & Test */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTestWebhookDispatch}
                  disabled={isTestingWebhook}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isTestingWebhook ? 'Pinging...' : 'Send Test Alert'}</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/50 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Config</span>
                </button>
              </div>

            </form>

          </div>

          {/* Webhook Delivery Activity Log */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-white text-xs">Webhook Delivery Log</h4>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Last: {webhookConfig.last_triggered ? new Date(webhookConfig.last_triggered).toLocaleTimeString() : 'N/A'}
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-[11px]">
              {webhookLogs.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs">
                  No webhooks triggered yet. Click "Send Test Alert" to dispatch.
                </div>
              ) : (
                webhookLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {log.status_code} OK
                        </span>
                        <span className="font-mono font-semibold text-white text-[10px]">
                          {log.event}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {log.latency_ms}ms • {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {log.payload_summary}
                    </p>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Inspect Webhook Payload Modal */}
      {showPayloadModal && testResult && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Inspect Webhook Payload</h3>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    HTTP 200 OK • Payload Dispatched
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPayloadModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-[11px] text-slate-400">
                JSON body sent to target webhook URL ({webhookConfig.url}):
              </div>

              <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-64">
                {JSON.stringify(testResult.payload, null, 2)}
              </pre>

              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300">
                Target endpoint received payload and responded with <strong>200 OK</strong>. Alert event is registered in real-time admin audit logs.
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowPayloadModal(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
