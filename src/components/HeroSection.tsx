import React, { useState } from 'react';
import {
  Shield,
  Send,
  ListFilter,
  GraduationCap,
  CheckCircle2,
  Search,
  Sparkles,
  ArrowRight,
  Radio
} from 'lucide-react';
import { VoiceRecord } from '../types';
import { AppLanguage, translations } from '../utils/translations';
import { cyberSound } from '../utils/audio';

interface HeroSectionProps {
  voices: VoiceRecord[];
  lang?: AppLanguage;
  onScrollToForm: () => void;
  onScrollToFeed: () => void;
  onQuickTrack: (code: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  voices,
  lang = 'en',
  onScrollToForm,
  onScrollToFeed,
  onQuickTrack,
}) => {
  const [heroTrackCode, setHeroTrackCode] = useState<string>('');
  const t = translations[lang];

  const total = voices.length;
  const resolved = voices.filter((v) => v.metadata.status === 'Resolved').length;

  const handleHeroTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroTrackCode.trim()) return;
    cyberSound.playClick();
    onQuickTrack(heroTrackCode.trim());
    setHeroTrackCode('');
  };

  return (
    <section className="relative z-10 py-8 lg:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Col: Main Banner copy */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.heroBadge}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-mono">
              <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              <span>{t.academicSession}</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.2] text-white">
            {t.heroTitle1} <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              {t.heroTitle2}
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            {t.heroDesc}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3.5 pt-1">
            <button
              onClick={() => {
                cyberSound.playClick();
                onScrollToForm();
              }}
              className="bg-gradient-to-r from-cyan-500 via-indigo-600 to-teal-500 hover:opacity-95 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-cyan-500/25 flex items-center gap-2 text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{t.submitVoiceBtn}</span>
            </button>

            <button
              onClick={() => {
                cyberSound.playClick();
                onScrollToFeed();
              }}
              className="px-6 py-3.5 rounded-2xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 hover:border-cyan-500/40 text-slate-200 font-semibold flex items-center gap-2 text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
            >
              <ListFilter className="w-4 h-4 text-cyan-400" />
              <span>{t.exploreFeedBtn}</span>
            </button>
          </div>

          {/* Inline Quick Track Box */}
          <div className="pt-3 max-w-lg">
            <form onSubmit={handleHeroTrackSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={heroTrackCode}
                  onChange={(e) => setHeroTrackCode(e.target.value.toUpperCase())}
                  placeholder={t.heroTrackPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs font-mono text-cyan-300 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none tracking-wider uppercase"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 border border-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t.trackBtn}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Right Col: Dynamic Floating Stat Cards */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          
          {/* Total Voices */}
          <div className="p-5 sm:p-6 rounded-3xl border border-cyan-500/25 bg-slate-900/75 backdrop-blur-xl space-y-2 shadow-2xl hover:border-cyan-500/50 transition-all group">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-3xl sm:text-4xl text-white font-mono tabular-nums tracking-tight">
              {total}
            </h3>
            <p className="text-xs text-slate-400 font-medium">{t.statTotalVoices}</p>
          </div>

          {/* Issues Resolved */}
          <div className="p-5 sm:p-6 rounded-3xl border border-emerald-500/25 bg-slate-900/75 backdrop-blur-xl space-y-2 shadow-2xl hover:border-emerald-500/50 transition-all group">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-3xl sm:text-4xl text-white font-mono tabular-nums tracking-tight">
              {resolved}
            </h3>
            <p className="text-xs text-slate-400 font-medium">{t.statResolvedIssues}</p>
          </div>

          {/* Multi-lingual Support Banner */}
          <div className="p-5 sm:p-6 rounded-3xl border border-indigo-500/25 bg-slate-900/75 backdrop-blur-xl space-y-2 col-span-2 shadow-2xl hover:border-indigo-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.multilingualBannerTitle}</span>
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono border border-slate-700">
                বাংলা ও English
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              {t.multilingualBannerText}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
