import React, { useState, useMemo } from 'react';
import {
  Inbox,
  Clock,
  RotateCw,
  CheckCircle2,
  FileSpreadsheet,
  FileCode,
  LogOut,
  Search,
  Eye,
  Trash2,
  Phone,
  Mail,
  ListFilter,
  Shield,
  Building,
  Edit3,
  X,
  Save,
  Printer,
  ThumbsUp,
  AlertTriangle
} from 'lucide-react';
import { VoiceRecord, AdminUser, VoiceStatus, PriorityLevel } from '../types';
import { exportVoicesCSV, exportVoicesJSON, updateVoiceStatusAndNotes, deleteVoiceRecord } from '../utils/storage';
import { AdminCharts } from './AdminCharts';
import { AppLanguage, translations } from '../utils/translations';
import { cyberSound } from '../utils/audio';

interface AdminDashboardProps {
  adminUser: AdminUser;
  voices: VoiceRecord[];
  lang?: AppLanguage;
  onVoicesUpdated: () => void;
  onLogout: () => void;
  onBackToStudentView: () => void;
  onInspectVoice: (voice: VoiceRecord) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  voices,
  lang = 'en',
  onVoicesUpdated,
  onLogout,
  onBackToStudentView,
  onInspectVoice,
  onShowToast,
}) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Quick Action / Remark Editor Modal state
  const [editingVoice, setEditingVoice] = useState<VoiceRecord | null>(null);
  const [modalStatus, setModalStatus] = useState<VoiceStatus>('Pending');
  const [modalPriority, setModalPriority] = useState<PriorityLevel>('Normal');
  const [modalNotes, setModalNotes] = useState<string>('');
  const [modalCell, setModalCell] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // KPI calculations
  const total = voices.length;
  const pending = voices.filter((v) => v.metadata.status === 'Pending').length;
  const inProgress = voices.filter((v) => v.metadata.status === 'In Progress').length;
  const resolved = voices.filter((v) => v.metadata.status === 'Resolved').length;
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Filtered voices for table
  const filteredVoices = useMemo(() => {
    return voices.filter((v) => {
      const matchDept = deptFilter === 'ALL' || v.studentDetails.department === deptFilter;
      const matchStatus = statusFilter === 'ALL' || v.metadata.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        v.submissionId.toLowerCase().includes(q) ||
        v.studentDetails.name.toLowerCase().includes(q) ||
        v.studentDetails.email.toLowerCase().includes(q) ||
        v.studentDetails.phone.toLowerCase().includes(q) ||
        v.content.subject.toLowerCase().includes(q);

      return matchDept && matchStatus && matchSearch;
    });
  }, [voices, deptFilter, statusFilter, searchQuery]);

  const handleOpenEdit = (voice: VoiceRecord) => {
    cyberSound.playClick();
    setEditingVoice(voice);
    setModalStatus(voice.metadata.status);
    setModalPriority(voice.metadata.priority || 'Normal');
    setModalNotes(voice.metadata.adminNotes || '');
    setModalCell(voice.metadata.assignedCell || '');
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoice) return;
    setIsSaving(true);
    cyberSound.playClick();

    setTimeout(() => {
      updateVoiceStatusAndNotes(
        editingVoice.submissionId,
        modalStatus,
        modalNotes,
        modalCell,
        modalPriority
      );
      cyberSound.playSuccess();
      setIsSaving(false);
      setEditingVoice(null);
      onVoicesUpdated();
      onShowToast(
        lang === 'bn'
          ? `ভয়েস #${editingVoice.submissionId}-এর প্রশাসনিক নোট সফলভাবে আপডেট করা হয়েছে!`
          : `Updated #${editingVoice.submissionId} with administrative action log!`,
        'success'
      );
    }, 400);
  };

  const handleDelete = (id: string) => {
    cyberSound.playError();
    const confirmMsg = lang === 'bn'
      ? `আপনি কি নিশ্চিত যে রেকর্ডটি (${id}) স্থায়ীভাবে মুছে ফেলতে চান?`
      : `Are you sure you want to permanently delete record ${id}?`;

    if (window.confirm(confirmMsg)) {
      deleteVoiceRecord(id);
      onVoicesUpdated();
      onShowToast(
        lang === 'bn' ? `রেকর্ড ${id} ভল্ট থেকে মুছে ফেলা হয়েছে।` : `Record ${id} removed from vault.`,
        'error'
      );
    }
  };

  const handlePrint = () => {
    cyberSound.playClick();
    window.print();
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
    <main className="relative z-10 flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Dashboard Top Header Banner */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border-l-4 border-l-cyan-500 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold tracking-widest uppercase border border-rose-500/20">
              {t.adminBadge}
            </span>
            <span className="text-xs text-slate-400 font-mono">CGEC 2026 PRO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 font-sans">
            {t.adminTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.loggedInAs} <strong className="text-cyan-300 font-mono">{adminUser.email}</strong> ({adminUser.role})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              cyberSound.playClick();
              exportVoicesCSV(voices);
              onShowToast('Exported DB as CSV', 'success');
            }}
            className="px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.exportCSV}</span>
          </button>

          <button
            onClick={() => {
              cyberSound.playClick();
              exportVoicesJSON(voices);
              onShowToast('Exported DB as JSON', 'success');
            }}
            className="px-3.5 py-2 rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-950/40 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t.exportJSON}</span>
          </button>

          <button
            onClick={handlePrint}
            title={t.printSummary}
            className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.printSummary}</span>
          </button>

          <button
            onClick={() => {
              cyberSound.playClick();
              onBackToStudentView();
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            {t.studentViewBtn}
          </button>

          <button
            onClick={() => {
              cyberSound.playClick();
              onLogout();
            }}
            className="px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Submissions */}
        <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/75 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t.kpiTotal}</span>
            <Inbox className="w-4 h-4 text-cyan-400" />
          </div>
          <h4 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {total}
          </h4>
          <span className="text-[10px] text-cyan-400 font-medium mt-1 block">
            {lang === 'bn' ? 'মোট নিবন্ধিত শিক্ষার্থী মতামত' : 'All logged student voices'}
          </span>
        </div>

        {/* Pending */}
        <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/75 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t.kpiPending}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <h4 className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
            {pending}
          </h4>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">
            {lang === 'bn' ? 'প্রাথমিক মূল্যায়নের অপেক্ষায়' : 'Requires initial review'}
          </span>
        </div>

        {/* In Progress */}
        <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/75 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t.kpiInProgress}</span>
            <RotateCw className="w-4 h-4 text-indigo-400 animate-spin" />
          </div>
          <h4 className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono tabular-nums">
            {inProgress}
          </h4>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">
            {lang === 'bn' ? 'সংশ্লিষ্ট সেল বা কমিটি তদন্তাধীন' : 'Active committee inquiries'}
          </span>
        </div>

        {/* Resolution Rate */}
        <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/75 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t.kpiResolvedRate}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <h4 className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
            {rate}%
          </h4>
          <span className="text-[10px] text-emerald-400/80 font-medium mt-1 block">
            {resolved} {lang === 'bn' ? 'টি সমস্যা সমাধান হয়েছে' : 'issues solved'}
          </span>
        </div>

      </div>

      {/* Visual Analytics Chart.js Section */}
      <AdminCharts voices={voices} />

      {/* Interactive Submissions Management Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl">
        
        {/* Table Filter Top Bar */}
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-bold text-white flex items-center gap-2 font-sans">
              <ListFilter className="w-4 h-4 text-cyan-400" />
              <span>{t.tableTitle}</span>
            </h4>
            <p className="text-xs text-slate-400">
              {t.tableSubtitle}
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none w-48 sm:w-60 font-sans"
              />
            </div>

            <select
              value={deptFilter}
              onChange={(e) => {
                cyberSound.playClick();
                setDeptFilter(e.target.value);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-sans"
            >
              <option value="ALL">{t.allDepts}</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="EE">EE</option>
              <option value="Civil">Civil</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                cyberSound.playClick();
                setStatusFilter(e.target.value);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-sans"
            >
              <option value="ALL">{lang === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
              <option value="Pending">{t.tabPending}</option>
              <option value="In Progress">{t.tabInProgress}</option>
              <option value="Resolved">{t.tabResolved}</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 uppercase text-[10px] font-bold tracking-wider text-slate-400 border-b border-slate-800 font-sans">
              <tr>
                <th className="py-3.5 px-4">{lang === 'bn' ? 'আইডি / সময়' : 'ID / Time'}</th>
                <th className="py-3.5 px-4">{lang === 'bn' ? 'শিক্ষার্থীর তথ্য' : 'Student Details'}</th>
                <th className="py-3.5 px-4">{lang === 'bn' ? 'ডিপার্টমেন্ট / বর্ষ' : 'Dept / Year'}</th>
                <th className="py-3.5 px-4">{lang === 'bn' ? 'ভয়েস বিষয়' : 'Voice Subject'}</th>
                <th className="py-3.5 px-4">{lang === 'bn' ? 'সমর্থন' : 'Support'}</th>
                <th className="py-3.5 px-4">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="py-3.5 px-4 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredVoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-xs">
                    {t.noVoicesFound}
                  </td>
                </tr>
              ) : (
                filteredVoices.map((item) => {
                  const dateStr = new Date(item.metadata.submittedAt).toLocaleTimeString(lang === 'bn' ? 'bn-IN' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={item.submissionId} className="hover:bg-slate-800/40 transition-colors">
                      {/* ID / Time */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="font-bold text-cyan-400 flex items-center gap-1">
                          <span>{item.submissionId}</span>
                          {item.metadata.priority === 'Urgent' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">{dateStr}</div>
                      </td>

                      {/* Student details */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span>{item.studentDetails.name}</span>
                          {item.studentDetails.isAnonymous && (
                            <span className="text-[9px] px-1.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                              {lang === 'bn' ? 'গোপন' : 'Shielded'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                          <span>{item.studentDetails.email}</span>
                          <span>•</span>
                          <span>{item.studentDetails.phone}</span>
                        </div>
                      </td>

                      {/* Dept / Year */}
                      <td className="py-3 px-4">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          {item.studentDetails.department}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.studentDetails.year}</div>
                      </td>

                      {/* Subject */}
                      <td className="py-3 px-4 max-w-xs">
                        <button
                          onClick={() => {
                            cyberSound.playClick();
                            onInspectVoice(item);
                          }}
                          className="font-medium text-slate-200 hover:text-cyan-400 transition-colors text-left truncate block w-full cursor-pointer"
                        >
                          {item.content.subject}
                        </button>
                        {item.metadata.adminNotes && (
                          <div className="text-[10px] text-emerald-400/90 truncate mt-0.5 italic">
                            {lang === 'bn' ? 'পদক্ষেপ:' : 'Action:'} "{item.metadata.adminNotes}"
                          </div>
                        )}
                      </td>

                      {/* Solidarity Upvotes */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-cyan-300">
                          <ThumbsUp className="w-3 h-3 text-cyan-400" />
                          <span>{item.metadata.upvotes || 0}</span>
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-xl font-bold uppercase border ${
                            item.metadata.status === 'Pending'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : item.metadata.status === 'In Progress'
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {getStatusLabel(item.metadata.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Quick Edit Action */}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title={lang === 'bn' ? 'স্ট্যাটাস ও প্রশাসনিক মন্তব্য আপডেট' : 'Update Status & Action Notes'}
                            className="p-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Inspect Modal */}
                          <button
                            onClick={() => {
                              cyberSound.playClick();
                              onInspectVoice(item);
                            }}
                            title={lang === 'bn' ? 'বিস্তারিত দেখুন' : 'Inspect Details'}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(item.submissionId)}
                            title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete Record'}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Admin Action & Official Remark Modal */}
      {editingVoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-cyan-500/40 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-cyan-950/80 overflow-hidden font-sans">
            
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400" />

            <button
              onClick={() => setEditingVoice(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <span className="font-mono text-xs font-bold text-cyan-400">
                {t.actionConsole} • {editingVoice.submissionId}
              </span>
              <h3 className="text-lg font-black text-white mt-1 leading-snug">
                {editingVoice.content.subject}
              </h3>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'bn' ? 'সমাধানের অগ্রগতি স্ট্যাটাস' : 'Redressal Status'}
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as VoiceStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Pending">{t.tabPending}</option>
                    <option value="In Progress">{t.tabInProgress}</option>
                    <option value="Resolved">{t.tabResolved}</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'bn' ? 'জরুরী মাত্রা' : 'Priority Escalation'}
                  </label>
                  <select
                    value={modalPriority}
                    onChange={(e) => setModalPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Normal">{lang === 'bn' ? 'স্বাভাবিক (Normal)' : 'Normal'}</option>
                    <option value="High">{lang === 'bn' ? 'উচ্চ অগ্রাধিকার (High)' : 'High Priority'}</option>
                    <option value="Urgent">{lang === 'bn' ? 'জরুরী জরুরী (Urgent)' : 'Urgent Emergency'}</option>
                  </select>
                </div>
              </div>

              {/* Committee / Cell Assignment */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'bn' ? 'দায়িত্বপ্রাপ্ত সেল / কমিটি নির্ধারণ' : 'Assign To Committee / Cell'}
                </label>
                <input
                  type="text"
                  value={modalCell}
                  onChange={(e) => setModalCell(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: ওয়ার্কশপ রক্ষণাবেক্ষণ ডেস্ক, অ্যান্টি-র‍্যাগিং সেল' : 'e.g. Workshop Maintenance Desk, Anti-Ragging Cell'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Official Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'bn' ? 'অফিশিয়াল প্রশাসনিক পদক্ষেপ মন্তব্য (শিক্ষার্থী দেখতে পাবে)' : 'Official Admin Action Remarks (Visible to Student)'}
                </label>
                <textarea
                  rows={3}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder={lang === 'bn' ? 'গৃহীত সুনির্দিষ্ট পদক্ষেপ লিখুন (যেমন: ল্যাবে নতুন রাউটার ইনস্টলেশন সম্পন্ন)।' : 'State the concrete action taken.'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVoice(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : t.saveRemarksBtn}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </main>
  );
};
