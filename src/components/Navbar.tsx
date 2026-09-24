import React from 'react';
import { Shield, Search, Send, List, Languages, Flame, Globe, ExternalLink } from 'lucide-react';
import { AdminUser } from '../types';
import { AppLanguage, translations } from '../utils/translations';

interface NavbarProps {
  adminUser: AdminUser | null;
  activeView: 'student' | 'admin';
  studentTab: 'browse' | 'submit' | 'track';
  lang: AppLanguage;
  onSelectTab: (tab: 'browse' | 'submit' | 'track') => void;
  onToggleLang: () => void;
  onSwitchView: (view: 'student' | 'admin') => void;
  onOpenAdminLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  adminUser,
  activeView,
  studentTab,
  lang,
  onSelectTab,
  onToggleLang,
  onSwitchView,
  onOpenAdminLogin,
}) => {
  const t = translations[lang];

  const handleAdminClick = () => {
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
    <header className="sticky top-0 z-40 bg-[#0B090D]/90 backdrop-blur-xl border-b border-orange-500/20 px-4 sm:px-6 lg:px-8 py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Glowing Brand */}
        <div
          onClick={() => {
            onSwitchView('student');
            onSelectTab('browse');
          }}
          className="flex items-center space-x-3 cursor-pointer select-none group"
        >
          <div className="relative">
            {/* Ambient Orange Glow Halo */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 opacity-70 blur-md group-hover:opacity-100 transition-opacity" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(249,115,22,0.6)]">
              <Flame className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-white group-hover:text-orange-300 transition-colors">
                CGEC <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">Campus Voice</span>
              </h1>
            </div>
            <p className="text-[11px] text-orange-200/60 font-medium truncate hidden sm:block">
              {t.brandSub}
            </p>
          </div>
        </div>

        {/* Center navigation tabs (Glowing pill container) */}
        {activeView === 'student' && (
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-950/80 border border-orange-500/25 p-1 rounded-2xl shadow-[0_0_25px_rgba(249,115,22,0.12)]">
            <button
              onClick={() => onSelectTab('submit')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                studentTab === 'submit'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(249,115,22,0.55)] scale-105'
                  : 'text-slate-300 hover:text-orange-300 hover:bg-orange-500/10'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'অভিযোগ জমা দিন' : 'Speak Up'}</span>
            </button>

            <button
              onClick={() => onSelectTab('browse')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                studentTab === 'browse'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(249,115,22,0.55)] scale-105'
                  : 'text-slate-300 hover:text-orange-300 hover:bg-orange-500/10'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'সকল ভয়েস' : 'Explore Public Voices'}</span>
            </button>

            <button
              onClick={() => onSelectTab('track')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                studentTab === 'track'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(249,115,22,0.55)] scale-105'
                  : 'text-slate-300 hover:text-orange-300 hover:bg-orange-500/10'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'স্ট্যাটাস ট্রেস করুন' : 'Trace by Code'}</span>
            </button>
          </nav>
        )}

        {/* Right controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* CGEC Official Site Link */}
          <a
            href="https://cgec.org.in/"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit Official CGEC Portal (https://cgec.org.in/)"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-orange-500/35 hover:border-orange-500/70 bg-orange-500/10 hover:bg-orange-500/20 text-orange-200 hover:text-white text-xs font-bold transition-all shadow-sm hover:shadow-[0_0_15px_rgba(249,115,22,0.25)]"
          >
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden md:inline">cgec.org.in</span>
            <ExternalLink className="w-3 h-3 text-orange-400" />
          </a>

          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            title="Toggle English / বাংলা"
            className="px-2.5 py-1.5 rounded-xl border border-orange-500/30 hover:border-orange-500/60 bg-slate-950/80 text-orange-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(249,115,22,0.25)]"
          >
            <Languages className="w-3.5 h-3.5 text-orange-400" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          {/* Admin Switcher / Discreet Institutional Access */}
          {adminUser ? (
            <button
              onClick={handleAdminClick}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 border border-orange-500/50 text-orange-300 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.2)]"
            >
              <Shield className="w-3.5 h-3.5 text-orange-400" />
              <span>
                {activeView === 'admin'
                  ? (lang === 'bn' ? 'শিক্ষার্থী ভিউ' : 'Student View')
                  : (lang === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel')}
              </span>
            </button>
          ) : (
            <button
              onClick={handleAdminClick}
              title="Institutional Portal Access (Press Alt + A)"
              aria-label="Institutional Portal Access"
              className="p-2 rounded-xl border border-slate-800/80 hover:border-orange-500/30 bg-slate-950/60 text-slate-400 hover:text-orange-400 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
