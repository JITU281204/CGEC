import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  ThumbsUp,
  Share2,
  Check,
  Flame,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Lock,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { VoiceRecord } from '../types';
import { upvoteVoice, isVoiceUpvotedByUser } from '../utils/storage';
import { AppLanguage, translations } from '../utils/translations';
import { AdminContactCard } from './AdminContactCard';

interface VoiceDetailModalProps {
  voice: VoiceRecord | null;
  isAdmin: boolean;
  lang?: AppLanguage;
  onClose: () => void;
  onVoiceUpdated?: () => void;
  onDeleteVoice?: (id: string) => void;
}

export const VoiceDetailModal: React.FC<VoiceDetailModalProps> = ({
  voice,
  isAdmin,
  lang = 'en',
  onClose,
  onVoiceUpdated,
  onDeleteVoice,
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  if (!voice) return null;

  const isUpvoted = isVoiceUpvotedByUser(voice.submissionId);

  const handleUpvote = () => {
    upvoteVoice(voice.submissionId);
    if (onVoiceUpdated) onVoiceUpdated();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `CGEC Campus Voice #${voice.submissionId} - ${voice.content.subject} (${window.location.origin})`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dateStr = new Date(voice.metadata.submittedAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const steps = [
    {
      title: 'Logged',
      done: true,
      desc: 'Recorded into Vault'
    },
    {
      title: 'Assigned',
      done: voice.metadata.status !== 'Pending',
      desc: voice.metadata.assignedCell || 'Assigned to Cell'
    },
    {
      title: 'Action',
      done: voice.metadata.status === 'In Progress' || voice.metadata.status === 'Resolved',
      desc: 'Committee Execution'
    },
    {
      title: 'Resolved',
      done: voice.metadata.status === 'Resolved',
      desc: 'Verified & Closed'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-orange-500/50 bg-[#0F0C12] p-6 sm:p-8 shadow-[0_0_60px_rgba(249,115,22,0.35)] overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Top glowing orange strip */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.8)]" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-500/20 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-orange-400 font-black tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                <span>{voice.submissionId}</span>
              </span>
              {voice.metadata.priority === 'Urgent' && (
                <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-400 text-[10px] font-bold border border-rose-500/40">
                  URGENT PRIORITY
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1 leading-snug">
              {voice.content.subject}
            </h3>
          </div>
          <span
            className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
              voice.metadata.status === 'Resolved'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : voice.metadata.status === 'In Progress'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
            }`}
          >
            {voice.metadata.status}
          </span>
        </div>

        {/* 4-Step Glowing Roadmap Timeline */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-950/80 border border-orange-500/25">
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-300/80 block mb-3">
            Redressal Roadmap & Progress
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-start space-y-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      step.done
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(249,115,22,0.6)]'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
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

        {/* Student metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs mb-5">
          <div>
            <span className="text-slate-400 block mb-0.5">Department</span>
            <strong className="text-orange-300 font-bold">{voice.studentDetails.department}</strong>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Academic Year</span>
            <strong className="text-white font-bold">{voice.studentDetails.year}</strong>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Language</span>
            <strong className="text-white font-bold">{voice.content.language}</strong>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Submitted On</span>
            <strong className="text-white font-bold">{dateStr}</strong>
          </div>
        </div>

        {/* If Admin, show student clearance */}
        {isAdmin && (
          <div className="mb-5 p-4 rounded-2xl bg-orange-950/25 border border-orange-500/40 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-orange-400 font-black uppercase tracking-wider text-[10px] block mb-1">
                Student Contact Identity (Admin Clearance)
              </span>
              <div className="text-slate-200 space-y-0.5">
                <div>Name: <strong className="text-white">{voice.studentDetails.name}</strong></div>
                <div>Email: <span className="font-mono text-orange-300">{voice.studentDetails.email}</span></div>
                <div>Phone: <span className="font-mono text-slate-300">{voice.studentDetails.phone}</span></div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`mailto:${voice.studentDetails.email}?subject=Regarding CGEC Campus Voice ${voice.submissionId}`}
                className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Student</span>
              </a>
              <a
                href={`tel:${voice.studentDetails.phone}`}
                className="px-3.5 py-1.5 rounded-xl border border-orange-500/30 bg-slate-900 hover:bg-slate-800 text-orange-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-orange-400" />
                <span>Call</span>
              </a>
            </div>
          </div>
        )}

        {/* Detailed Message with Privacy Protection */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-300/80 uppercase tracking-wider">
              Voice Description
            </span>
            {isAdmin && (
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>Admin Full Clearance View</span>
              </span>
            )}
          </div>

          {isAdmin ? (
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              {voice.content.message}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl bg-black/60 border border-orange-500/30 p-5 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
              {/* Blurred Message */}
              <div className="text-sm text-slate-300 select-none filter blur-[5px] opacity-60 leading-relaxed whitespace-pre-wrap pointer-events-none min-h-[60px]">
                {voice.content.message}
              </div>

              {/* Glowing Privacy Protection Callout Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-black/85 via-black/80 to-black/90 backdrop-blur-[3px] text-center">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 mb-2 shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                  <Lock className="w-5 h-5 text-orange-400" />
                </div>
                <h5 className="text-xs sm:text-sm font-black text-orange-300 tracking-wide uppercase">
                  Protected for Student Privacy & Anti-Spam
                </h5>
                <p className="text-[11px] text-slate-300 max-w-sm mt-0.5">
                  Content is shielded to protect identities. To inspect full grievance details, please connect directly with administration:
                </p>
                <div className="mt-2 text-[11px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-xl">
                  Visible to connect Admin
                </div>
              </div>
            </div>
          )}
        </div>

        {/* If not Admin, show Direct Admin Connect Desk */}
        {!isAdmin && (
          <div className="mb-5">
            <AdminContactCard
              compact
              title="Connect with Admin to Inspect or Verify"
              subtitle="Contact either administrator directly via email, call, or WhatsApp."
            />
          </div>
        )}

        {/* Official Admin Notes */}
        {voice.metadata.adminNotes && (
          <div className="p-4 rounded-2xl bg-orange-950/20 border border-orange-500/30 text-xs space-y-1 mb-5">
            <div className="flex items-center gap-1.5 text-orange-400 font-bold">
              <CheckCircle2 className="w-4 h-4 text-orange-400" />
              <span>Official Admin Action & Resolution Remarks:</span>
            </div>
            <p className="text-slate-100 text-sm leading-relaxed pl-5 italic">
              "{voice.metadata.adminNotes}"
            </p>
            {voice.metadata.assignedCell && (
              <div className="pl-5 pt-1 text-[11px] text-amber-300 font-medium">
                Assigned Committee: <strong>{voice.metadata.assignedCell}</strong>
              </div>
            )}
          </div>
        )}

        {/* Admin Delete Confirmation Strip */}
        {isAdmin && onDeleteVoice && confirmDelete && (
          <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 mb-4 flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Permanently delete this submission from database?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteVoice(voice.submissionId);
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.5)]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-orange-500/20 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpvote}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isUpvoted
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(249,115,22,0.6)]'
                  : 'bg-slate-950 border border-orange-500/30 text-orange-300 hover:text-white'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{isUpvoted ? 'Supported' : 'Support'} ({voice.metadata.upvotes || 0})</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/40 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Share Voice'}</span>
            </button>

            {isAdmin && onDeleteVoice && !confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-3 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Delete this record"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
