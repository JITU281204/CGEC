import React, { useState, useMemo } from 'react';
import { Search, ThumbsUp, MessageSquare, Check, Share2, Flame, Shield, ShieldCheck, ArrowUpRight, Lock, Eye, Mail, Phone, X } from 'lucide-react';
import { VoiceRecord } from '../types';
import { upvoteVoice, isVoiceUpvotedByUser } from '../utils/storage';
import { AppLanguage, translations } from '../utils/translations';
import { AdminContactCard, ADMIN_CONTACTS } from './AdminContactCard';

interface PublicVoiceFeedProps {
  voices: VoiceRecord[];
  isAdmin?: boolean;
  lang?: AppLanguage;
  onInspectVoice: (voice: VoiceRecord) => void;
  onVoicesUpdated: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PublicVoiceFeed: React.FC<PublicVoiceFeedProps> = ({
  voices,
  isAdmin = false,
  lang = 'en',
  onInspectVoice,
  onVoicesUpdated,
  onShowToast,
}) => {
  const t = translations[lang];
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [statusTab, setStatusTab] = useState<'ALL' | 'Pending' | 'In Progress' | 'Resolved'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showContactsModal, setShowContactsModal] = useState<boolean>(false);

  const filteredVoices = useMemo(() => {
    return voices.filter((item) => {
      const matchDept = deptFilter === 'ALL' || item.studentDetails.department === deptFilter;
      const matchStatus = statusTab === 'ALL' || item.metadata.status === statusTab;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.content.subject.toLowerCase().includes(q) ||
        item.content.message.toLowerCase().includes(q) ||
        item.submissionId.toLowerCase().includes(q) ||
        item.studentDetails.department.toLowerCase().includes(q);

      return matchDept && matchStatus && matchSearch;
    });
  }, [voices, deptFilter, statusTab, searchQuery]);

  const MAX_RECOMMENDED = 10;
  // If user is not an admin, recommend only the top 10 items to prevent clutter, keeping genuine counter
  const isCapped = !isAdmin && filteredVoices.length > MAX_RECOMMENDED;
  const displayedVoices = isCapped ? filteredVoices.slice(0, MAX_RECOMMENDED) : filteredVoices;

  const handleUpvote = (e: React.MouseEvent, submissionId: string) => {
    e.stopPropagation();
    const result = upvoteVoice(submissionId);
    if (result.success) {
      onVoicesUpdated();
    }
  };

  const handleShare = (e: React.MouseEvent, submissionId: string) => {
    e.stopPropagation();
    const shareText = `CGEC Campus Voice #${submissionId}: ${window.location.origin}`;
    navigator.clipboard.writeText(shareText);
    onShowToast('Direct link copied to clipboard!', 'success');
  };

  return (
    <section className="relative z-10 py-6 max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
      
      {/* Top Privacy & Content Protection Banner */}
      <div className="p-4 rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-950/40 via-[#0F0C12] to-orange-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_25px_rgba(249,115,22,0.12)]">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0 mt-0.5 sm:mt-0">
            <Shield className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-300">
            <span className="font-bold text-orange-300 block sm:inline">Student Privacy & Spam Protection: </span>
            <span>Raw descriptions are protected with privacy blur. Authorized committee and administrators have clearance to review.</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowContactsModal(true)}
          className="px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 hover:border-orange-500 text-orange-300 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto shrink-0 cursor-pointer shadow-sm"
        >
          <Phone className="w-3.5 h-3.5 text-orange-400" />
          <span>Connect Admin</span>
        </button>
      </div>

      {/* Search & Glowing Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0F0C12]/80 border border-orange-500/25 p-3 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.1)] backdrop-blur-xl">
        
        {/* Search Bar with Orange Focus */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-orange-400/80 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, subjects, ID (e.g. 001)..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:shadow-[0_0_15px_rgba(249,115,22,0.25)] transition-all"
          />
        </div>

        {/* Status Pills with Glowing Orange Active State */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'Pending', 'In Progress', 'Resolved'] as const).map((tab) => {
            const isActive = statusTab === tab;
            const count = tab === 'ALL' ? voices.length : voices.filter(v => v.metadata.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setStatusTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(249,115,22,0.6)]'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-orange-500/40'
                }`}
              >
                <span>{tab === 'ALL' ? 'All' : tab}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-slate-950/30 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Department Filter */}
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-orange-200 font-semibold focus:outline-none focus:border-orange-500 focus:shadow-[0_0_15px_rgba(249,115,22,0.25)] transition-all"
        >
          <option value="ALL">All Departments</option>
          <option value="CSE">CSE Dept</option>
          <option value="ECE">ECE Dept</option>
          <option value="ME">ME Dept</option>
          <option value="EE">EE Dept</option>
          <option value="Civil">Civil Dept</option>
        </select>
      </div>

      {/* Glowing Cards Feed */}
      {filteredVoices.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-orange-500/20 bg-[#0F0C12]/60 text-slate-400 text-xs shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <MessageSquare className="w-10 h-10 text-orange-500/40 mx-auto mb-3" />
          <span className="text-sm font-semibold text-slate-300">No campus voices match your current filter.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top Info Strip: Genuine count & Recommendation status */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1.5 pb-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-300 font-extrabold text-xs">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                <span>{lang === 'bn' ? 'শীর্ষ ১০টি রিকমেন্ডেড সমস্যা' : 'Top 10 Recommended Voices'}</span>
              </div>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-xs text-slate-300 font-medium">
                {lang === 'bn' ? (
                  <>মোট জেনুইন সাবমিশন: <strong className="font-mono text-orange-400">{voices.length}</strong> টি</>
                ) : (
                  <>Total Genuine Submissions: <strong className="font-mono text-orange-400">{voices.length}</strong></>
                )}
              </span>
            </div>

            {isCapped && (
              <div className="text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <span>
                  {lang === 'bn'
                    ? `১০টি প্রদর্শিত (বাকি ${filteredVoices.length - MAX_RECOMMENDED}টি আর্কাইভে)`
                    : `Showing 10 of ${filteredVoices.length} (Rest Archived)`}
                </span>
              </div>
            )}
          </div>

          {displayedVoices.map((item) => {
            const isUpvoted = isVoiceUpvotedByUser(item.submissionId);

            return (
              <div
                key={item.submissionId}
                onClick={() => onInspectVoice(item)}
                className="relative p-5 sm:p-6 rounded-3xl border border-orange-500/25 bg-[#0F0C12]/90 hover:bg-[#151019] hover:border-orange-500/80 shadow-[0_0_30px_rgba(0,0,0,0.7)] hover:shadow-[0_0_35px_rgba(249,115,22,0.28)] transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-5 group overflow-hidden"
              >
                {/* Subtle Amber Glow Accent on Left */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 via-amber-400 to-orange-600 opacity-60 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-2.5 flex-1 min-w-0 pl-1.5">
                  
                  {/* Metadata line */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-mono font-black text-orange-400 text-xs tracking-wider flex items-center gap-1">
                      <span>{item.submissionId}</span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="px-2 py-0.5 rounded-lg bg-orange-950/40 border border-orange-500/30 text-orange-300 font-bold text-[11px]">
                      {item.studentDetails.department}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] text-slate-400">
                      {item.studentDetails.year}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(item.metadata.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Subject Title */}
                  <h4 className="font-bold text-base sm:text-lg text-white group-hover:text-orange-300 transition-colors leading-snug flex items-center gap-1.5">
                    <span>{item.content.subject}</span>
                    <ArrowUpRight className="w-4 h-4 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </h4>

                  {/* Description preview with Privacy Protection Blur */}
                  <div className="relative mt-1">
                    {isAdmin ? (
                      <div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 mb-1">
                          <Eye className="w-3 h-3" />
                          <span>Admin Full Clearance View</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                          {item.content.message}
                        </p>
                      </div>
                    ) : (
                      <div className="relative overflow-hidden rounded-xl bg-black/40 border border-orange-500/20 p-2.5">
                        {/* Blurred Text */}
                        <p className="text-xs sm:text-sm text-slate-300 select-none filter blur-[4.5px] opacity-70 leading-relaxed pointer-events-none">
                          {item.content.message}
                        </p>

                        {/* Centered Privacy Badge */}
                        <div className="absolute inset-0 flex items-center justify-between px-3 bg-gradient-to-r from-black/85 via-black/75 to-black/85 backdrop-blur-[2px]">
                          <div className="flex items-center gap-1.5 text-[11px] font-black text-orange-300">
                            <Lock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            <span>Visible to connect Admin</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowContactsModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-orange-500/30 hover:bg-orange-500 border border-orange-500/60 hover:text-slate-950 text-orange-200 text-[10px] font-bold transition-all shadow-sm flex items-center gap-1 shrink-0"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Admin Contacts</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Official Action Note Preview */}
                  {item.metadata.adminNotes && (
                    <div className="text-xs text-amber-300 bg-amber-950/30 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 mt-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 shrink-0" />
                      <span className="truncate italic">Action Log: "{item.metadata.adminNotes}"</span>
                    </div>
                  )}
                </div>

                {/* Right controls: Status & Upvote */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-orange-500/15">
                  <span
                    className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                      item.metadata.status === 'Resolved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : item.metadata.status === 'In Progress'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                        : 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                    }`}
                  >
                    {item.metadata.status}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Upvote */}
                    <button
                      onClick={(e) => handleUpvote(e, item.submissionId)}
                      title="Support this issue"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isUpvoted
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(249,115,22,0.6)]'
                          : 'bg-slate-950 border border-orange-500/30 hover:border-orange-500 text-orange-300 hover:text-white hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-slate-950' : ''}`} />
                      <span>{item.metadata.upvotes || 0}</span>
                    </button>

                    {/* Share */}
                    <button
                      onClick={(e) => handleShare(e, item.submissionId)}
                      title="Share link"
                      className="p-1.5 rounded-xl bg-slate-950 border border-orange-500/30 hover:border-orange-500 text-slate-400 hover:text-orange-300 transition-all shadow-sm"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* "To see all connect admin" Recommended Card (When records > 10) */}
      {isCapped && (
        <div className="relative rounded-3xl border border-orange-500/40 bg-gradient-to-br from-[#1b0e06] via-[#0F0C12] to-[#140b17] p-6 sm:p-8 shadow-[0_0_40px_rgba(249,115,22,0.2)] overflow-hidden">
          {/* Top Radiant Glowing Edge */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.8)]" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2.5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                <span>Archive & Verification Policy</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
                <span>{lang === 'bn' ? 'সকল সমস্যা দেখতে অ্যাডমিনের সাথে যোগাযোগ করুন' : 'To See All Submissions, Connect Admin'}</span>
                <Flame className="w-5 h-5 text-orange-400 fill-orange-400 shrink-0" />
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {lang === 'bn'
                  ? `ক্যাম্পাসে মোট ${filteredVoices.length}টি সমস্যা ও প্রস্তাবনা জমা পড়েছে। শিক্ষার্থীদের পরিচ্ছন্ন ব্যবহারের সুবিধার্থে পাবলিক ফিডে শীর্ষ ১০টি রিকমেন্ডেড সমস্যা রাখা হয়েছে। বাকি ${filteredVoices.length - MAX_RECOMMENDED}টি সমস্যা সহ সম্পূর্ণ ডাটাবেজ দেখতে কলেজ অ্যাডমিনদের সাথে সরাসরি যোগাযোগ করুন।`
                  : `Currently ${filteredVoices.length} campus grievances & proposals are recorded. To ensure neat browsing and student safety, the public feed presents the top 10 recommended voices. To access all historical submissions and confidential updates, please connect with authorized administrators.`}
              </p>

              {/* Direct Administrators Hotline */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs text-orange-200">
                <span className="font-bold text-orange-300">
                  {lang === 'bn' ? 'অথরাইজড অ্যাডমিন হেল্পডেস্ক:' : 'Authorized Administrators:'}
                </span>
                <a
                  href="tel:8617489374"
                  className="font-mono bg-black/60 hover:bg-orange-500/20 px-2.5 py-1 rounded-xl border border-orange-500/30 text-slate-300 hover:text-orange-300 transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3 h-3 text-orange-400" />
                  <span>Jituraj: 8617489374</span>
                </a>
                <a
                  href="tel:6296154016"
                  className="font-mono bg-black/60 hover:bg-orange-500/20 px-2.5 py-1 rounded-xl border border-orange-500/30 text-slate-300 hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3 h-3 text-amber-400" />
                  <span>Niloy: 6296154016</span>
                </a>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="flex flex-col gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowContactsModal(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-sm transition-all shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-slate-950" />
                <span>{lang === 'bn' ? 'অ্যাডমিনের সাথে কানেক্ট করুন' : 'To See All Connect Admin'}</span>
              </button>

              <p className="text-center text-[10px] text-slate-400 font-medium">
                {lang === 'bn' ? 'অথবা Alt + A চেপে অ্যাডমিন পোর্টালে লগইন করুন' : 'Or press Alt + A for Institutional Login'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Contacts Modal */}
      {showContactsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-orange-500/50 bg-[#0F0C12] p-6 shadow-[0_0_60px_rgba(249,115,22,0.35)] overflow-hidden">
            {/* Top glowing orange line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.8)]" />

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowContactsModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <AdminContactCard
              title="Official Admin Contact Desk"
              subtitle="Connect directly with verified CGEC administrators to discuss sensitive matters, request unblur clearance, or resolve spam."
            />

            <div className="mt-4 pt-3 border-t border-orange-500/20 flex justify-end">
              <button
                type="button"
                onClick={() => setShowContactsModal(false)}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-sm"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
