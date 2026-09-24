import React from 'react';
import { Send, Search, MessageSquare, Sparkles, Flame, CheckCircle2, RotateCw, ExternalLink } from 'lucide-react';
import { VoiceRecord } from '../types';
import { AppLanguage } from '../utils/translations';

interface HeroSectionProps {
  voices: VoiceRecord[];
  lang?: AppLanguage;
  activeTab: 'browse' | 'submit' | 'track';
  onSelectTab: (tab: 'browse' | 'submit' | 'track') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  voices,
  lang = 'en',
  activeTab,
  onSelectTab,
}) => {
  const total = voices.length;
  const inProgress = voices.filter((v) => v.metadata.status === 'In Progress').length;
  const resolved = voices.filter((v) => v.metadata.status === 'Resolved').length;

  return (
    <section className="relative z-10 pt-10 pb-8 max-w-5xl mx-auto px-4 sm:px-6 text-center">
      
      {/* Radiant Glowing Pulsing Pill with link to official college portal */}
      <a
        href="https://cgec.org.in/"
        target="_blank"
        rel="noopener noreferrer"
        title="Visit Official CGEC Portal (https://cgec.org.in)"
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 via-amber-500/20 to-orange-500/15 border border-orange-500/40 text-orange-300 hover:text-white text-xs font-bold tracking-wide mb-5 shadow-[0_0_25px_rgba(249,115,22,0.3)] hover:border-orange-500/80 hover:shadow-[0_0_35px_rgba(249,115,22,0.5)] transition-all cursor-pointer group"
      >
        <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 group-hover:scale-110 transition-transform" />
        <span>Cooch Behar Government Engineering College</span>
        <span className="text-orange-500">•</span>
        <span className="text-amber-200 flex items-center gap-1">
          <span>cgec.org.in</span>
          <ExternalLink className="w-3 h-3 text-orange-400 group-hover:text-amber-300" />
        </span>
      </a>

      {/* Fiery High-Voltage Headline */}
      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
        {lang === 'bn' ? (
          <>
            আপনার ভয়েস, আপনার ক্যাম্পাস,{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(249,115,22,0.6)]">
              সরাসরি সমাধান।
            </span>
          </>
        ) : (
          <>
            Make Your Voice Heard.{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(249,115,22,0.6)]">
              Ignite Real Change.
            </span>
          </>
        )}
      </h2>

      {/* Subtitle with high contrast and clarity */}
      <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-4 leading-relaxed font-medium">
        {lang === 'bn'
          ? 'ল্যাব, হস্টেল, ওয়াই-ফাই, লাইব্রেরি বা ক্লাস সংক্রান্ত যেকোনো সমস্যা বা নতুন আইডিয়া জানান। কলেজ প্রশাসন সরাসরি পর্যালোচনা করবে।'
          : 'Express academic hurdles, hostel facilities, lab upgrades, or innovative proposals directly to CGEC Administration. Track live resolutions transparently.'}
      </p>

      {/* 3 High-Tech Glowing Metric Stat Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-xl mx-auto mt-8">
        
        {/* Total Voices */}
        <div className="relative group p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-orange-500/30 shadow-[0_0_25px_rgba(249,115,22,0.15)] hover:border-orange-500/60 transition-all">
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-center justify-center gap-1">
            <span>{total}</span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400/90 mt-1 block">
            {lang === 'bn' ? 'মোট ভয়েস' : 'Total Voices'}
          </span>
        </div>

        {/* In Progress */}
        <div className="relative group p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:border-amber-500/60 transition-all">
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight flex items-center justify-center gap-1.5">
            <RotateCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>{inProgress}</span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90 mt-1 block">
            {lang === 'bn' ? 'তদন্তাধীন' : 'Under Review'}
          </span>
        </div>

        {/* Resolved */}
        <div className="relative group p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:border-emerald-500/60 transition-all">
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{resolved}</span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/90 mt-1 block">
            {lang === 'bn' ? 'সমাধান সম্পন্ন' : 'Resolved'}
          </span>
        </div>

      </div>

      {/* Main Interactive Glowing Tab Selector Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <button
          onClick={() => onSelectTab('browse')}
          className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2.5 ${
            activeTab === 'browse'
              ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-slate-950 shadow-[0_0_30px_rgba(249,115,22,0.6)] scale-105'
              : 'bg-slate-950/80 border border-orange-500/30 text-slate-200 hover:text-white hover:border-orange-500/60 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{lang === 'bn' ? 'পাবলিক ভয়েস দেখুন' : 'Explore Public Voices'}</span>
        </button>

        <button
          onClick={() => onSelectTab('submit')}
          className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2.5 ${
            activeTab === 'submit'
              ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-slate-950 shadow-[0_0_30px_rgba(249,115,22,0.6)] scale-105'
              : 'bg-slate-950/80 border border-orange-500/30 text-slate-200 hover:text-white hover:border-orange-500/60 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{lang === 'bn' ? 'অভিযোগ বা আইডিয়া জানান' : 'Speak Up (Submit Issue)'}</span>
        </button>

        <button
          onClick={() => onSelectTab('track')}
          className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2.5 ${
            activeTab === 'track'
              ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-slate-950 shadow-[0_0_30px_rgba(249,115,22,0.6)] scale-105'
              : 'bg-slate-950/80 border border-orange-500/30 text-slate-200 hover:text-white hover:border-orange-500/60 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{lang === 'bn' ? 'স্ট্যাটাস ট্র্যাক করুন' : 'Track by Code'}</span>
        </button>
      </div>

    </section>
  );
};
