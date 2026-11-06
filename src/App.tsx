/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NyscProvider, useNysc } from './context/NyscContext';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Navbar } from './components/Navbar';
import { BottomTabBar, TabType } from './components/BottomTabBar';
import { DashboardView } from './components/DashboardView';
import { HubShellView } from './components/HubShellView';
import { NetworkShellView } from './components/NetworkShellView';
import { CareerShellView } from './components/CareerShellView';
import { PortalWebviewModal } from './components/PortalWebviewModal';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { SosModal } from './components/SosModal';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AuthScreen } from './components/auth/AuthScreen';
import { OnboardingWizard } from './components/auth/OnboardingWizard';
import { WifiOff, Download, Sparkles } from 'lucide-react';
import { usePWAInstall } from './hooks/usePWAInstall';

function AppContent() {
  const { isAuthenticated, isOnboarded } = useAuth();
  const { profile, brandingConfig } = useNysc();
  const { isOnline } = useOnlineStatus();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [dismissedNoticeIds, setDismissedNoticeIds] = useState<string[]>([]);

  // Hash & Path-based routing for /admin with strict is_admin verification
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isNavigatingAdmin =
      window.location.hash === '#/admin' ||
      window.location.hash === '#admin' ||
      window.location.pathname === '/admin';

    // Must be both authenticated and have is_admin === true
    if (isNavigatingAdmin && isAuthenticated && profile.is_admin) {
      return true;
    }
    return false;
  });

  // Strict route protection guard: immediately redirect standard corpers or unauthenticated users to /dashboard
  useEffect(() => {
    const enforceRouteProtection = () => {
      const isNavigatingAdmin =
        window.location.hash === '#/admin' ||
        window.location.hash === '#admin' ||
        window.location.pathname === '/admin';

      if (isNavigatingAdmin) {
        if (!isAuthenticated || !profile.is_admin) {
          // Immediately redirect unauthorized access to /dashboard
          if (window.location.pathname === '/admin') {
            window.history.replaceState(null, '', '/dashboard');
          }
          window.location.hash = '#/dashboard';
          setIsAdminView(false);
          setActiveTab('home');
        } else {
          setIsAdminView(true);
        }
      } else {
        if (isAdminView) {
          setIsAdminView(false);
        }
      }
    };

    enforceRouteProtection();
    window.addEventListener('hashchange', enforceRouteProtection);
    window.addEventListener('popstate', enforceRouteProtection);
    return () => {
      window.removeEventListener('hashchange', enforceRouteProtection);
      window.removeEventListener('popstate', enforceRouteProtection);
    };
  }, [isAuthenticated, profile.is_admin, isAdminView]);

  const openAdminView = () => {
    if (profile.is_admin) {
      window.location.hash = '#/admin';
      setIsAdminView(true);
    } else {
      window.location.hash = '#/dashboard';
      setIsAdminView(false);
    }
  };

  const closeAdminView = () => {
    window.location.hash = '#/dashboard';
    setIsAdminView(false);
    setActiveTab('home');
  };



  // Dark Mode support (default true)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nysc_dark_mode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nysc_dark_mode', JSON.stringify(isDarkMode));
    } catch {
      // safe fallback
    }
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // 1. Not Authenticated -> Show Sign In / Sign Up Flow
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // 2. Authenticated but haven't completed 15-second wizard -> Show Onboarding Wizard
  if (!isOnboarded) {
    return <OnboardingWizard onComplete={() => setActiveTab('home')} />;
  }

  // 3. Authenticated & Onboarded -> Render Full App Shell
  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDarkMode
          ? 'bg-[#0b0f19] text-slate-100 dark'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      


      {/* Header Navigation with Logo, Portal link, Sync Indicator, Settings Gear */}
      <Navbar
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSos={() => setIsSosOpen(true)}
        onOpenPortal={() => setIsPortalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAdmin={openAdminView}
        isAdminView={isAdminView}
      />

      {/* Offline Status Warning Bar when disconnected */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-md shrink-0">
          <WifiOff className="w-4 h-4 animate-bounce" />
          <span>
            🔴 Offline Mode: Operating with cached Local Storage. All clearance notes, vault items, and budget entries remain accessible.
          </span>
        </div>
      )}

      {/* Quick PWA In-App Install Banner (if installable and not already installed) */}
      {isInstallable && !isInstalled && !isAdminView && (
        <div className="bg-gradient-to-r from-[#005a36] to-[#008751] text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Install "My NYSC Companion" for fast offline access on your phone screen!</span>
          </div>
          <button
            onClick={install}
            className="px-3 py-1 rounded-lg bg-white text-[#008751] font-bold text-xs hover:bg-slate-100 transition-all shadow-sm flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        </div>
      )}

      {/* Active Broadcast Directives from Admin */}
      {!isAdminView && brandingConfig?.notices && (
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3 space-y-2">
          {brandingConfig.notices
            .filter(n => n.is_active && !dismissedNoticeIds.includes(n.id))
            .slice(0, 2)
            .map(n => {
              const bg =
                n.notice_type === 'urgent'
                  ? 'bg-red-500/15 border-red-500/40 text-red-200'
                  : n.notice_type === 'warning'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                  : n.notice_type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                  : 'bg-blue-500/15 border-blue-500/40 text-blue-200';

              return (
                <div
                  key={n.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs shadow-md ${bg}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-extrabold shrink-0">{n.title}:</span>
                    <span className="opacity-90 truncate">{n.message}</span>
                  </div>
                  <button
                    onClick={() => setDismissedNoticeIds(prev => [...prev, n.id])}
                    className="p-1 rounded-lg hover:bg-white/10 shrink-0 text-white/70 hover:text-white"
                    title="Dismiss notice"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 pb-28">
        {isAdminView ? (
          <AdminDashboardView onBackToApp={closeAdminView} />
        ) : (
          <>
            {activeTab === 'home' && (
              <DashboardView
                onNavigateTab={tabId => setActiveTab(tabId)}
                onOpenProfile={() => setIsProfileOpen(true)}
              />
            )}

            {activeTab === 'hub' && <HubShellView />}

            {activeTab === 'network' && <NetworkShellView />}

            {activeTab === 'career' && <CareerShellView />}
          </>
        )}
      </main>

      {/* Responsive Bottom Tab Bar with 4 Tabs: 🏠 Home, 🗺️ Hub, 👥 Network, 💼 Career (hidden in Admin mode) */}
      {!isAdminView && (
        <BottomTabBar
          activeTab={activeTab}
          onChangeTab={tab => setActiveTab(tab)}
        />
      )}

      {/* Modals */}
      <PortalWebviewModal
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onNavigateToAdmin={openAdminView}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NyscProvider>
        <AppContent />
      </NyscProvider>
    </AuthProvider>
  );
}
