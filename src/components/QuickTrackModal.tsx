import React, { useState } from 'react';
import { Search, X, CheckCircle2, Clock, AlertTriangle, ArrowRight, Shield, Building, Tag } from 'lucide-react';
import { VoiceRecord } from '../types';
import { findVoiceByCode } from '../utils/storage';
import { AppLanguage, translations } from '../utils/translations';
import { cyberSound } from '../utils/audio';

interface QuickTrackModalProps {
  initialCode?: string;
  lang?: AppLanguage;
  onClose: () => void;
  onInspectFull: (voice: VoiceRecord) => void;
}

export const QuickTrackModal: React.FC<QuickTrackModalProps> = ({
  initialCode = '',
  lang = 'en',
  onClose,
  onInspectFull,
}) => {
  const t = translations[lang];
  const [codeInput, setCodeInput] = useState<string>(initialCode);
  const [result, setResult] = useState<VoiceRecord | null | undefined>(
    initialCode ? findVoiceByCode(initialCode) : undefined
  );
  const [hasSearched, setHasSearched] = useState<boolean>(!!initialCode);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;

    cyberSound.playClick();
    const found = findVoiceByCode(codeInput.trim());
    setResult(found);
    setHasSearched(true);
    if (found) {
      cyberSound.playSuccess();
    } else {
      cyberSound.playError();
    }
  };

  const getStatusLabel = (status: string) => {
    if (lang === 'bn') {
      if (status === 'Resolved') return 'সমাধান সম্পন্ন';
      if (status === 'In Progress') return 'পর্যালোচনাধীন';
      return 'অপেক্ষমান';
    }
    return status;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-cyan-500/40 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-cyan-950/80 overflow-hidden">
        
        {/* Accent strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight font-sans">
              {t.trackModalTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {t.trackModalSub}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-5">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder={t.trackInputPlaceholder}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-slate-100 text-xs sm:text-sm font-mono tracking-wider focus:border-cyan-500 focus:outline-none uppercase"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer font-sans"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{t.checkStatusBtn}</span>
          </button>
        </form>

        {/* Result Area */}
        {hasSearched && (
          <div>
            {result ? (
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {result.submissionId}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      result.metadata.status === 'Resolved'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : result.metadata.status === 'In Progress'
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {getStatusLabel(result.metadata.status)}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug font-sans">
                  {result.content.subject}
                </h4>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-sans">
                  <span className="flex items-center gap-1">
                    <Building className="w-3 h-3 text-cyan-400" />
                    {result.studentDetails.department}
                  </span>
                  <span>•</span>
                  <span>{result.studentDetails.year}</span>
                  <span>•</span>
                  <span>{new Date(result.metadata.submittedAt).toLocaleDateString(lang === 'bn' ? 'bn-IN' : 'en-US')}</span>
                </div>

                {/* Admin notes */}
                {result.metadata.adminNotes ? (
                  <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-slate-200 font-sans">
                    <div className="text-indigo-400 font-semibold mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>{lang === 'bn' ? 'অফিশিয়াল পদক্ষেপ গ্রহণ করা হয়েছে:' : 'Official Action Logged:'}</span>
                    </div>
                    <p className="italic">"{result.metadata.adminNotes}"</p>
                    {result.metadata.assignedCell && (
                      <span className="block mt-1 text-[11px] text-indigo-300">
                        {lang === 'bn' ? 'দায়িত্বপ্রাপ্ত সেল:' : 'Assigned Cell:'} <strong>{result.metadata.assignedCell}</strong>
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-sans">
                    {lang === 'bn'
                      ? 'আপনার আবেদনটি সংশ্লিষ্ট কমিটির পর্যালোচনার জন্য সারিবদ্ধ রয়েছে। পদক্ষেপ গৃহীত হলে এখানে আপডেট হবে।'
                      : 'Your report is queued for committee assignment. Official updates will appear here.'}
                  </div>
                )}

                <button
                  onClick={() => {
                    onClose();
                    onInspectFull(result);
                  }}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-sans"
                >
                  <span>{t.fullTimelineBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-center space-y-1.5 font-sans">
                <AlertTriangle className="w-7 h-7 text-rose-400 mx-auto" />
                <p className="text-sm font-bold text-rose-300">{t.notFoundTitle} "{codeInput}"</p>
                <p className="text-xs text-slate-400">
                  {t.notFoundSub}
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
