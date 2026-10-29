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
  const { profile } = useNysc();
  const { isOnline } = useOnlineStatus();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);

  // Hash-based routing for /admin
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    return (
      typeof window !== 'undefined' &&
      (window.location.hash === '#/admin' || window.location.hash === '#admin')
    );
  });

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminView(
        window.location.hash === '#/admin' || window.location.hash === '#admin'
      );
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const openAdminView = () => {
    window.location.hash = '#/admin';
    setIsAdminView(true);
  };

  const closeAdminView = () => {
    window.location.hash = '';
    setIsAdminView(false);
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
