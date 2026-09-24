import React, { useState, useEffect } from 'react';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StudentVoiceForm } from './components/StudentVoiceForm';
import { PublicVoiceFeed } from './components/PublicVoiceFeed';
import { TrackSection } from './components/TrackSection';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { VoiceDetailModal } from './components/VoiceDetailModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Footer } from './components/Footer';

import { VoiceRecord, AdminUser } from './types';
import { getStoredVoices, getAdminSession, clearAdminSession, deleteVoiceRecord } from './utils/storage';
import { AppLanguage, getInitialLanguage, saveSelectedLanguage } from './utils/translations';

export default function App() {
  const [lang, setLang] = useState<AppLanguage>('en');
  const [voices, setVoices] = useState<VoiceRecord[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [activeView, setActiveView] = useState<'student' | 'admin'>('student');
  const [studentTab, setStudentTab] = useState<'browse' | 'submit' | 'track'>('browse');

  // Modals & Inspection
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [inspectedVoice, setInspectedVoice] = useState<VoiceRecord | null>(null);

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
    const initialLang = getInitialLanguage();
    setLang(initialLang);
    setVoices(getStoredVoices());
    const existing = getAdminSession();
    if (existing) {
      setAdminUser(existing);
    }

    // Discreet keyboard shortcut for authorized administrators: Alt + A or Ctrl + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && (e.key === 'a' || e.key === 'A')) ||
          (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a'))) {
        e.preventDefault();
        setIsAdminLoginOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    setStudentTab('browse');
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setActiveView('admin');
    showToast(`Welcome ${user.name}! Admin Vault Unlocked.`, 'success');
  };

  const handleAdminLogout = () => {
    clearAdminSession();
    setAdminUser(null);
    setActiveView('student');
    showToast('Logged out from Admin Portal', 'info');
  };

  const handleDeleteVoice = (submissionId: string) => {
    const ok = deleteVoiceRecord(submissionId);
    if (ok) {
      refreshVoices();
      setInspectedVoice(null);
      showToast(`Record #${submissionId} has been permanently deleted.`, 'error');
    } else {
      showToast(`Could not delete record #${submissionId}.`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#08070A] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* Radiant Glowing Orange Embers & Ambient Lighting */}
      <InteractiveCanvas />

      {/* Floating Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Glowing Top Navigation Header */}
      <Navbar
        adminUser={adminUser}
        activeView={activeView}
        studentTab={studentTab}
        lang={lang}
        onSelectTab={setStudentTab}
        onToggleLang={handleToggleLang}
        onSwitchView={setActiveView}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
      />

      {/* Main View Area: Admin Dashboard OR Clean Glowing Student Views */}
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
          
          {/* Hero Section with Glowing Orange Headline & Tab Switchers */}
          <HeroSection
            voices={voices}
            lang={lang}
            activeTab={studentTab}
            onSelectTab={setStudentTab}
          />

          {/* Tab 1: Explore Public Voices */}
          {studentTab === 'browse' && (
            <PublicVoiceFeed
              voices={voices}
              isAdmin={Boolean(adminUser)}
              lang={lang}
              onInspectVoice={(v) => setInspectedVoice(v)}
              onVoicesUpdated={refreshVoices}
              onShowToast={showToast}
            />
          )}

          {/* Tab 2: Speak Up / Submit Issue */}
          {studentTab === 'submit' && (
            <StudentVoiceForm
              lang={lang}
              onVoiceSubmitted={handleVoiceSubmitted}
              onShowToast={showToast}
            />
          )}

          {/* Tab 3: Track by ID */}
          {studentTab === 'track' && (
            <TrackSection
              lang={lang}
              onInspectVoice={(v) => setInspectedVoice(v)}
            />
          )}

        </main>
      )}

      {/* Footer */}
      <Footer onOpenAdminLogin={() => setIsAdminLoginOpen(true)} />

      {/* Detailed Voice Record Inspector Modal */}
      <VoiceDetailModal
        voice={inspectedVoice}
        isAdmin={Boolean(adminUser)}
        lang={lang}
        onClose={() => setInspectedVoice(null)}
        onVoiceUpdated={refreshVoices}
        onDeleteVoice={handleDeleteVoice}
      />

      {/* Admin Authentication Modal */}
      {isAdminLoginOpen && (
        <AdminLoginModal
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      )}

    </div>
  );
}
