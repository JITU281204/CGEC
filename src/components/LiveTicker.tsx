import React from 'react';
import { Radio, Sparkles } from 'lucide-react';
import { VoiceRecord } from '../types';
import { AppLanguage, translations } from '../utils/translations';

interface LiveTickerProps {
  voices: VoiceRecord[];
  lang?: AppLanguage;
  onSelectVoice: (voice: VoiceRecord) => void;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ voices, lang = 'en', onSelectVoice }) => {
  if (!voices || voices.length === 0) return null;

  const tickerItems = voices.slice(0, 8);
  const t = translations[lang];

  const getStatusLabel = (status: string) => {
    if (lang === 'bn') {
      if (status === 'Resolved') return 'সমাধান সম্পন্ন';
      if (status === 'In Progress') return 'পর্যালোচনাধীন';
      return 'অপেক্ষমান';
    }
    return status;
  };

  return (
    <div className="relative z-30 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md overflow-hidden py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center">
        
        {/* Left Ticker Badge */}
        <div className="flex items-center gap-1.5 shrink-0 bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-1 rounded-full text-cyan-400 text-xs font-bold mr-3 z-10 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="uppercase tracking-wider text-[10px] sm:text-xs">{t.liveUpdates}</span>
        </div>

        {/* Scrolling items marquee container */}
        <div className="overflow-hidden relative w-full mask-edges">
          <div className="flex gap-8 items-center whitespace-nowrap animate-marquee hover:pause-marquee cursor-pointer">
            {tickerItems.concat(tickerItems).map((voice, idx) => (
              <div
                key={`${voice.submissionId}-${idx}`}
                onClick={() => onSelectVoice(voice)}
                className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-cyan-300 transition-colors group"
              >
                <span className="font-mono text-cyan-400 font-bold text-[11px]">
                  [{voice.studentDetails.department}]
                </span>
                <span className="max-w-xs truncate font-medium text-slate-200 group-hover:underline">
                  {voice.content.subject}
                </span>
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                    voice.metadata.status === 'Resolved'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : voice.metadata.status === 'In Progress'
                      ? 'bg-indigo-500/15 text-indigo-400'
                      : 'bg-amber-500/15 text-amber-400'
                  }`}
                >
                  {getStatusLabel(voice.metadata.status)}
                </span>
                <span className="text-slate-600 ml-2">•</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
