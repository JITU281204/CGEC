import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  Building,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ThumbsUp,
  Share2,
  Check,
  Printer,
  AlertTriangle
} from 'lucide-react';
import { VoiceRecord } from '../types';
import { upvoteVoice, isVoiceUpvotedByUser } from '../utils/storage';
import { AppLanguage, translations } from '../utils/translations';
import { cyberSound } from '../utils/audio';

interface VoiceDetailModalProps {
  voice: VoiceRecord | null;
  isAdmin: boolean;
  lang?: AppLanguage;
  onClose: () => void;
  onVoiceUpdated?: () => void;
}

export const VoiceDetailModal: React.FC<VoiceDetailModalProps> = ({
  voice,
  isAdmin,
  lang = 'en',
  onClose,
  onVoiceUpdated,
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState<boolean>(false);

  if (!voice) return null;

  const isUpvoted = isVoiceUpvotedByUser(voice.submissionId);

  const handleUpvote = () => {
    cyberSound.playPop();
    upvoteVoice(voice.submissionId);
    if (onVoiceUpdated) onVoiceUpdated();
  };

  const handleCopyLink = () => {
    cyberSound.playClick();
    navigator.clipboard.writeText(
      `CGEC Campus Voice #${voice.submissionId} - ${voice.content.subject} (${window.location.origin})`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusLabel = (status: string) => {
    if (lang === 'bn') {
      if (status === 'Resolved') return 'সমাধান সম্পন্ন';
      if (status === 'In Progress') return 'পর্যালোচনাধীন';
      return 'অপেক্ষমান';
    }
    return status;
  };

  let statusClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  if (voice.metadata.status === 'In Progress') {
    statusClass = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
  } else if (voice.metadata.status === 'Resolved') {
    statusClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  }

  const dateStr = new Date(voice.metadata.submittedAt).toLocaleString(lang === 'bn' ? 'bn-IN' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const steps = [
    {
      title: t.step1,
      done: true,
      desc: lang === 'bn' ? 'ভল্টে সংরক্ষিত হয়েছে' : 'Voice logged into vault'
    },
    {
      title: t.step2,
      done: voice.metadata.status !== 'Pending',
      desc: voice.metadata.assignedCell || (lang === 'bn' ? 'কমিটি বরাদ্দ' : 'Assigned to Cell')
    },
    {
      title: t.step3,
      done: voice.metadata.status === 'In Progress' || voice.metadata.status === 'Resolved',
      desc: lang === 'bn' ? 'কার্যকর সমাধান প্রক্রিয়া' : 'Active execution'
    },
    {
      title: t.step4,
      done: voice.metadata.status === 'Resolved',
      desc: lang === 'bn' ? 'পদক্ষেপ সমাপ্ত' : 'Resolution recorded'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-700/80 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-cyan-950/80 overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Top accent glow line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 font-bold tracking-wider">
                {voice.submissionId}
              </span>
              {voice.metadata.priority === 'Urgent' && (
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                  {lang === 'bn' ? 'অতি জরুরী' : 'URGENT'}
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-white mt-1 leading-snug font-sans">
              {voice.content.subject}
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border ${statusClass}`}>
            {getStatusLabel(voice.metadata.status)}
          </span>
        </div>

        {/* 4-Step Redressal Roadmap Timeline */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3 font-sans">
            {t.detailModalRoadmap}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-start space-y-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step.done
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {step.done ? '✓' : idx + 1}
                  </div>
                  <span className={`text-xs font-bold ${step.done ? 'text-white' : 'text-slate-500'}`}>
                    {step.title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 pl-6 leading-tight">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Student metadata box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs mb-5 font-sans">
          <div>
            <span className="text-slate-500 block mb-0.5">{lang === 'bn' ? 'ডিপার্টমেন্ট' : 'Department'}</span>
            <strong className="text-slate-200">{voice.studentDetails.department}</strong>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">{lang === 'bn' ? 'অ্যাকাডেমিক বর্ষ' : 'Academic Year'}</span>
            <strong className="text-slate-200">{voice.studentDetails.year}</strong>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">{lang === 'bn' ? 'ভাষা' : 'Language'}</span>
            <strong className="text-slate-200">{voice.content.language}</strong>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">{lang === 'bn' ? 'জমা দেওয়ার সময়' : 'Date Submitted'}</span>
            <strong className="text-slate-200">{dateStr}</strong>
          </div>
        </div>

        {/* If Admin, show student contact details */}
        {isAdmin && (
          <div className="mb-5 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
            <div>
              <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                {t.adminClearance}
              </span>
              <div className="text-slate-200 space-y-0.5">
                <div>{lang === 'bn' ? 'নাম:' : 'Name:'} <strong className="text-white">{voice.studentDetails.name}</strong></div>
                <div>Email: <span className="font-mono text-cyan-300">{voice.studentDetails.email}</span></div>
                <div>{lang === 'bn' ? 'ফোন:' : 'Phone:'} <span className="font-mono text-slate-300">{voice.studentDetails.phone}</span></div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`mailto:${voice.studentDetails.email}?subject=Regarding CGEC Campus Voice ${voice.submissionId}`}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{t.emailStudent}</span>
              </a>
              <a
                href={`tel:${voice.studentDetails.phone}`}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.callStudent}</span>
              </a>
            </div>
          </div>
        )}

        {/* Detailed Message */}
        <div className="space-y-2 mb-5 font-sans">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {lang === 'bn' ? 'অভিযোগ/প্রস্তাবের বিবরণ' : 'Voice Description'} ({voice.content.language})
          </span>
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
            {voice.content.message}
          </div>
        </div>

        {/* Official Admin Notes / Redressal Status */}
        {voice.metadata.adminNotes && (
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1 mb-5 font-sans">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.officialActionRemarks}</span>
            </div>
            <p className="text-slate-200 text-sm leading-relaxed pl-5 font-sans">
              "{voice.metadata.adminNotes}"
            </p>
            {voice.metadata.assignedCell && (
              <div className="pl-5 pt-1 text-[11px] text-slate-400 font-sans">
                {t.assignedCommittee} <strong className="text-emerald-300">{voice.metadata.assignedCell}</strong>
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions: Support / Upvote, Share, Print */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs font-sans">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpvote}
              className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isUpvoted
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{isUpvoted ? t.supportedBtn : t.supportBtn} ({voice.metadata.upvotes || 0})</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? t.copiedToast : t.shareBtn}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            {t.closeInspector}
          </button>
        </div>

      </div>
    </div>
  );
};
