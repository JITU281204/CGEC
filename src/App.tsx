import React, { useState, useEffect } from 'react';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { Navbar } from './components/Navbar';
import { LiveTicker } from './components/LiveTicker';
import { HeroSection } from './components/HeroSection';
import { StudentVoiceForm } from './components/StudentVoiceForm';
import { PublicVoiceFeed } from './components/PublicVoiceFeed';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { VoiceDetailModal } from './components/VoiceDetailModal';
import { QuickTrackModal } from './components/QuickTrackModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Footer } from './components/Footer';

import { VoiceRecord, AdminUser } from './types';
import { getStoredVoices, getAdminSession, clearAdminSession } from './utils/storage';
import { AppLanguage, getInitialLanguage, saveSelectedLanguage } from './utils/translations';
import { cyberSound } from './utils/audio';

export default function App() {
  const [lang, setLang] = useState<AppLanguage>('en');
  const [voices, setVoices] = useState<VoiceRecord[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [activeView, setActiveView] = useState<'student' | 'admin'>('student');

  // Modals & Inspection
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [inspectedVoice, setInspectedVoice] = useState<VoiceRecord | null>(null);
  const [isQuickTrackOpen, setIsQuickTrackOpen] = useState<boolean>(false);
  const [quickTrackInitialCode, setQuickTrackInitialCode] = useState<string>('');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    // Set default language to English
    const initialLang = getInitialLanguage();
    setLang(initialLang);
    setVoices(getStoredVoices());
    const existing = getAdminSession();
    if (existing) {
      setAdminUser(existing);
    }
  }, []);

  const handleToggleLang = () => {
    const nextLang: AppLanguage = lang === 'en' ? 'bn' : 'en';
    setLang(nextLang);
    saveSelectedLanguage(nextLang);
    showToast(
      nextLang === 'en' ? 'Language switched to English.' : 'ভাষা বাংলায় পরিবর্তিত হয়েছে।',
      'info'
    );
  };

  const refreshVoices = () => {
    setVoices(getStoredVoices());
  };

  const handleVoiceSubmitted = (newEntry: VoiceRecord) => {
    refreshVoices();
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setActiveView('admin');
    cyberSound.playSuccess();
    showToast(`Welcome ${user.name}! Admin Vault Unlocked.`, 'success');
  };

  const handleAdminLogout = () => {
    clearAdminSession();
    setAdminUser(null);
    setActiveView('student');
    cyberSound.playClick();
    showToast('Logged out from Admin Portal', 'info');
  };

  const handleOpenTrackWithCode = (code: string) => {
    setQuickTrackInitialCode(code);
    setIsQuickTrackOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* 3D Animated Constellation Particle Mesh Background */}
      <InteractiveCanvas />

      {/* Floating Glass Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navigation Header with Language Switcher */}
      <Navbar
        adminUser={adminUser}
        activeView={activeView}
        lang={lang}
        onToggleLang={handleToggleLang}
        onSwitchView={setActiveView}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenQuickTrack={() => {
          setQuickTrackInitialCode('');
          setIsQuickTrackOpen(true);
        }}
      />

      {/* Live Dynamic Updates Ticker */}
      <LiveTicker
        voices={voices}
        lang={lang}
        onSelectVoice={(v) => {
          cyberSound.playClick();
          setInspectedVoice(v);
        }}
      />

      {/* Main View Area: Admin Dashboard OR Student Portal */}
      {activeView === 'admin' && adminUser ? (
        <AdminDashboard
          adminUser={adminUser}
          voices={voices}
          lang={lang}
          onVoicesUpdated={refreshVoices}
          onLogout={handleAdminLogout}
          onBackToStudentView={() => setActiveView('student')}
          onInspectVoice={(v) => setInspectedVoice(v)}
          onShowToast={showToast}
        />
      ) : (
        <main className="flex-grow space-y-6">
          
          {/* Hero Section with Live Stats & Instant Track Input */}
          <HeroSection
            voices={voices}
            lang={lang}
            onScrollToForm={() => {
              document.getElementById('submit-voice')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onScrollToFeed={() => {
              document.getElementById('public-feed')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onQuickTrack={handleOpenTrackWithCode}
          />

          {/* Student Voice Submission Form Terminal */}
          <StudentVoiceForm
            lang={lang}
            onVoiceSubmitted={handleVoiceSubmitted}
            onShowToast={showToast}
          />

          {/* Public Campus Voices Feed with Live Filters */}
          <PublicVoiceFeed
            voices={voices}
            lang={lang}
            onInspectVoice={(v) => setInspectedVoice(v)}
            onVoicesUpdated={refreshVoices}
            onShowToast={showToast}
          />

        </main>
      )}

      {/* Footer */}
      <Footer onOpenAdminLogin={() => setIsAdminLoginOpen(true)} />

      {/* Detailed Voice Record Inspector Modal */}
      <VoiceDetailModal
        voice={inspectedVoice}
        isAdmin={Boolean(adminUser && activeView === 'admin')}
        lang={lang}
        onClose={() => setInspectedVoice(null)}
        onVoiceUpdated={refreshVoices}
      />

      {/* Quick Track Modal */}
      {isQuickTrackOpen && (
        <QuickTrackModal
          initialCode={quickTrackInitialCode}
          lang={lang}
          onClose={() => setIsQuickTrackOpen(false)}
          onInspectFull={(v) => setInspectedVoice(v)}
        />
      )}

      {/* Secure Admin Authentication Modal */}
      {isAdminLoginOpen && (
        <AdminLoginModal
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      )}

    </div>
  );
}
