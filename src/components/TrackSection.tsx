import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, Building, ArrowRight, Shield, AlertCircle, Flame } from 'lucide-react';
import { VoiceRecord } from '../types';
import { findVoiceByCode } from '../utils/storage';
import { AppLanguage } from '../utils/translations';

interface TrackSectionProps {
  lang?: AppLanguage;
  onInspectVoice: (voice: VoiceRecord) => void;
}

export const TrackSection: React.FC<TrackSectionProps> = ({
  lang = 'en',
  onInspectVoice,
}) => {
  const [query, setQuery] = useState<string>('');
  const [result, setResult] = useState<VoiceRecord | null | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const found = findVoiceByCode(query.trim());
    setResult(found);
    setHasSearched(true);
  };

  const handleQuickSample = (sampleId: string) => {
    setQuery(sampleId);
    const found = findVoiceByCode(sampleId);
    setResult(found);
    setHasSearched(true);
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="relative rounded-3xl bg-[#0F0C12]/90 border border-orange-500/40 p-6 sm:p-8 shadow-[0_0_40px_rgba(249,115,22,0.2)] backdrop-blur-xl overflow-hidden">
        
        {/* Top Glow Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.8)]" />

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <Flame className="w-6 h-6 text-orange-400 fill-orange-400" />
          </div>
          <h3 className="text-2xl font-black text-white">
            {lang === 'bn' ? 'অভিযোগের অগ্রগতি ট্র্যাক করুন' : 'Real-Time Grievance Tracker'}
          </h3>
          <p className="text-xs text-orange-200/70 mt-1">
            {lang === 'bn'
              ? 'আপনার দেওয়া ট্র্যাকিং কোড দিয়ে বর্তমান অবস্থা ও সমাধান জানুন।'
              : 'Enter your assigned tracking code to view committee decisions & live progress.'}
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder="e.g. CGEC-2026-001"
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700/80 text-sm font-mono uppercase text-orange-300 placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs shadow-[0_0_25px_rgba(249,115,22,0.5)] transition-all cursor-pointer shrink-0"
          >
            {lang === 'bn' ? 'খুঁজুন' : 'Track Status'}
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-6 flex-wrap">
          <span>Quick samples:</span>
          {['CGEC-2026-001', 'CGEC-2026-002', 'CGEC-2026-005'].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => handleQuickSample(id)}
              className="text-orange-400 hover:text-amber-300 font-mono underline font-bold cursor-pointer"
            >
              {id}
            </button>
          ))}
        </div>

        {/* Result Area */}
        {hasSearched && (
          <div>
            {result ? (
              <div className="p-5 rounded-2xl border border-orange-500/40 bg-slate-950/90 space-y-3.5 shadow-[0_0_25px_rgba(249,115,22,0.15)]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-orange-400 tracking-wider">
                    {result.submissionId}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black uppercase ${
                      result.metadata.status === 'Resolved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : result.metadata.status === 'In Progress'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                    }`}
                  >
                    {result.metadata.status}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-white leading-snug">
                  {result.content.subject}
                </h4>

                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="text-orange-300 font-semibold">{result.studentDetails.department}</span>
                  <span>•</span>
                  <span>{result.studentDetails.year}</span>
                  <span>•</span>
                  <span>{new Date(result.metadata.submittedAt).toLocaleDateString()}</span>
                </div>

                {/* Admin notes */}
                {result.metadata.adminNotes ? (
                  <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-500/35 text-xs text-orange-100 shadow-sm">
                    <div className="text-orange-400 font-bold mb-1 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-orange-400" />
                      <span>Official Administrative Action Log:</span>
                    </div>
                    <p className="italic leading-relaxed">"{result.metadata.adminNotes}"</p>
                    {result.metadata.assignedCell && (
                      <span className="block mt-2 text-[11px] text-amber-300 font-semibold">
                        Assigned Cell: <strong>{result.metadata.assignedCell}</strong>
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 italic bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    Your report is queued for committee assignment. Official updates will appear here.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => onInspectVoice(result)}
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500 hover:to-amber-500 text-orange-300 hover:text-slate-950 border border-orange-500/40 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>View Full Timeline & Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/30 text-center text-xs text-rose-300">
                <AlertCircle className="w-5 h-5 mx-auto mb-1 text-rose-400" />
                <span>No record found with ID "{query}". Please check your code.</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
