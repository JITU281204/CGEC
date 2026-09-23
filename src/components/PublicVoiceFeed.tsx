import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Eye,
  ThumbsUp,
  Share2,
  Check,
  LayoutGrid,
  List,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { VoiceRecord } from '../types';
import { upvoteVoice, isVoiceUpvotedByUser } from '../utils/storage';
import { AppLanguage, translations } from '../utils/translations';
import { cyberSound } from '../utils/audio';

interface PublicVoiceFeedProps {
  voices: VoiceRecord[];
  lang?: AppLanguage;
  onInspectVoice: (voice: VoiceRecord) => void;
  onVoicesUpdated: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PublicVoiceFeed: React.FC<PublicVoiceFeedProps> = ({
  voices,
  lang = 'en',
  onInspectVoice,
  onVoicesUpdated,
  onShowToast,
}) => {
  const t = translations[lang];
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [statusTab, setStatusTab] = useState<'ALL' | 'Pending' | 'In Progress' | 'Resolved'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleUpvote = (e: React.MouseEvent, submissionId: string) => {
    e.stopPropagation();
    cyberSound.playPop();
    const result = upvoteVoice(submissionId);
    if (result.success) {
      onVoicesUpdated();
    }
  };

  const handleShare = (e: React.MouseEvent, submissionId: string) => {
    e.stopPropagation();
    cyberSound.playClick();
    const shareText = `CGEC Campus Voice #${submissionId}: ${window.location.origin}`;
    navigator.clipboard.writeText(shareText);
    setCopiedId(submissionId);
    onShowToast(t.copiedToast, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusLabel = (status: string) => {
    if (lang === 'bn') {
      if (status === 'Resolved') return 'সমাধান সম্পন্ন';
      if (status === 'In Progress') return 'পর্যালোচনাধীন';
      return 'অপেক্ষমান';
    }
    return status;
  };

  const tabs = [
    { key: 'ALL', label: t.tabAll },
    { key: 'Pending', label: t.tabPending },
    { key: 'In Progress', label: t.tabInProgress },
    { key: 'Resolved', label: t.tabResolved },
  ] as const;

  return (
    <section id="public-feed" className="relative z-10 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header with Title & Status Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold tracking-wider uppercase border border-cyan-500/20">
              {t.feedBadge}
            </span>
            <span className="text-xs text-slate-500 font-mono">CGEC 2026</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight mt-1 font-sans">
            <MessageSquare className="w-6 h-6 text-cyan-400" />
            <span>{t.feedTitle}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {t.feedSubtitle}
          </p>
        </div>

        {/* Quick Filter Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 flex-wrap sm:flex-nowrap">
          {tabs.map((tab) => {
            const count = tab.key === 'ALL' ? voices.length : voices.filter((v) => v.metadata.status === tab.key).length;
            const isActive = statusTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  cyberSound.playClick();
                  setStatusTab(tab.key);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer font-sans ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Second Filter Bar: Search, Dept Filter, View Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/80">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none font-sans"
          />
        </div>

        {/* Dept & View toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={deptFilter}
            onChange={(e) => {
              cyberSound.playClick();
              setDeptFilter(e.target.value);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none font-sans"
          >
            <option value="ALL">{t.allDepts}</option>
            <option value="CSE">CSE Dept</option>
            <option value="ECE">ECE Dept</option>
            <option value="ME">ME Dept</option>
            <option value="EE">EE Dept</option>
            <option value="Civil">Civil Dept</option>
          </select>

          {/* Grid / List toggle */}
          <div className="flex items-center bg-slate-950/80 border border-slate-700/80 rounded-xl p-0.5">
            <button
              onClick={() => {
                cyberSound.playClick();
                setViewMode('grid');
              }}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                cyberSound.playClick();
                setViewMode('list');
              }}
              title="List View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {(deptFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setDeptFilter('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-cyan-400 hover:underline px-1 font-sans"
            >
              {lang === 'bn' ? 'রিসেট' : 'Reset'}
            </button>
          )}
        </div>

      </div>

      {/* Cards Display */}
      {filteredVoices.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-sans">{t.noVoicesFound}</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVoices.map((item) => {
            const isUpvoted = isVoiceUpvotedByUser(item.submissionId);

            let statusClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            if (item.metadata.status === 'In Progress') {
              statusClass = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            } else if (item.metadata.status === 'Resolved') {
              statusClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            }

            return (
              <div
                key={item.submissionId}
                onClick={() => {
                  cyberSound.playClick();
                  onInspectVoice(item);
                }}
                className="rounded-3xl p-5 border border-slate-800/90 hover:border-cyan-500/50 bg-slate-900/70 hover:bg-slate-900/95 backdrop-blur-md transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer group shadow-xl hover:shadow-cyan-950/40 relative overflow-hidden"
              >
                {/* Priority Glow Indicator */}
                {item.metadata.priority === 'Urgent' && (
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
                    <span className="absolute transform rotate-45 bg-rose-500 text-white font-bold text-[8px] py-0.5 right-[-35px] top-[18px] w-[120px] text-center shadow-md">
                      {lang === 'bn' ? 'জরুরী' : 'URGENT'}
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wider uppercase border ${statusClass}`}>
                      {getStatusLabel(item.metadata.status)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.submissionId}
                    </span>
                  </div>

                  {/* Subject Title */}
                  <h4 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug font-sans">
                    {item.content.subject}
                  </h4>

                  {/* Message */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 font-sans">
                    {item.content.message}
                  </p>
                </div>

                {/* Bottom Bar: Solidarity Upvotes & Meta */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span className="font-semibold text-slate-300">{item.studentDetails.department}</span>
                    <span>• {item.studentDetails.year}</span>
                  </div>

                  {/* Actions: Upvote & Share */}
                  <div className="flex items-center gap-2">
                    {/* Upvote / Me Too */}
                    <button
                      onClick={(e) => handleUpvote(e, item.submissionId)}
                      title={lang === 'bn' ? 'আমিও এই সমস্যা সমর্থন করি' : 'Support this issue'}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isUpvoted
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400'
                      }`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${isUpvoted ? 'fill-slate-950' : ''}`} />
                      <span>{item.metadata.upvotes || 0}</span>
                    </button>

                    {/* Share */}
                    <button
                      onClick={(e) => handleShare(e, item.submissionId)}
                      title={t.shareBtn}
                      className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      {copiedId === item.submissionId ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Compact List Layout */
        <div className="divide-y divide-slate-800/80 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden">
          {filteredVoices.map((item) => {
            const isUpvoted = isVoiceUpvotedByUser(item.submissionId);
            return (
              <div
                key={item.submissionId}
                onClick={() => {
                  cyberSound.playClick();
                  onInspectVoice(item);
                }}
                className="p-4 sm:p-5 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {item.submissionId}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 font-semibold text-slate-300">
                      {item.studentDetails.department} ({item.studentDetails.year})
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400 font-sans">
                      {new Date(item.metadata.submittedAt).toLocaleDateString(lang === 'bn' ? 'bn-IN' : 'en-US')}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors truncate font-sans">
                    {item.content.subject}
                  </h4>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                      item.metadata.status === 'Resolved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : item.metadata.status === 'In Progress'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {getStatusLabel(item.metadata.status)}
                  </span>

                  <button
                    onClick={(e) => handleUpvote(e, item.submissionId)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                      isUpvoted ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{item.metadata.upvotes || 0}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};
