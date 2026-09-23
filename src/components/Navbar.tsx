import React, { useState, useEffect } from 'react';
import { Megaphone, Shield, Volume2, VolumeX, Search, Radio, Languages } from 'lucide-react';
import { AdminUser } from '../types';
import { AppLanguage, translations } from '../utils/translations';
import { cyberSound } from '../utils/audio';

interface NavbarProps {
  adminUser: AdminUser | null;
  activeView: 'student' | 'admin';
  lang: AppLanguage;
  onToggleLang: () => void;
  onSwitchView: (view: 'student' | 'admin') => void;
  onOpenAdminLogin: () => void;
  onOpenQuickTrack: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  adminUser,
  activeView,
  lang,
  onToggleLang,
  onSwitchView,
  onOpenAdminLogin,
  onOpenQuickTrack,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const t = translations[lang];

  useEffect(() => {
    setIsMuted(cyberSound.getIsMuted());
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    cyberSound.setMuted(next);
    if (!next) cyberSound.playPop();
  };

  const handleAdminClick = () => {
    cyberSound.playClick();
    if (activeView === 'admin') {
      onSwitchView('student');
    } else {
      if (adminUser) {
        onSwitchView('admin');
      } else {
        onOpenAdminLogin();
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand */}
        <div
          onClick={() => {
            cyberSound.playClick();
            onSwitchView('student');
          }}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-lg lg:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent font-sans">
                {t.brandName}
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                {t.versionBadge}
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold truncate max-w-[190px] sm:max-w-none">
              {t.brandSub}
            </p>
          </div>
        </div>

        {/* Right Nav controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Language Switcher [বাংলা | English] */}
          <button
            onClick={() => {
              cyberSound.playClick();
              onToggleLang();
            }}
            title={lang === 'bn' ? 'Switch to English' : 'বাংলা ভাষায় পরিবর্তন করুন'}
            className="px-2.5 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-950/60 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-cyan-950"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          {/* Quick Track Search Button */}
          <button
            onClick={() => {
              cyberSound.playClick();
              onOpenQuickTrack();
            }}
            title="Track Voice by ID"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{t.trackStatusBtn}</span>
          </button>

          {/* Sound FX Synthesizer Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 rounded-xl border border-slate-800 hover:border-cyan-500/40 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-cyan-300 text-xs transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* Live Indicator */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>{t.portalLive}</span>
          </div>

          {/* Admin Switcher Button */}
          <button
            onClick={handleAdminClick}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 via-cyan-600 to-teal-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>
              {activeView === 'admin'
                ? t.studentViewBtn
                : adminUser
                ? t.adminDashboardBtn
                : t.adminPortalBtn}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
};
