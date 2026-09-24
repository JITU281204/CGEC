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
  Flame,
  AlertTriangle
} from 'lucide-react';
import { VoiceRecord, AdminUser, VoiceStatus, PriorityLevel } from '../types';
import { exportVoicesCSV, exportVoicesJSON, updateVoiceStatusAndNotes, deleteVoiceRecord } from '../utils/storage';
import { AdminCharts } from './AdminCharts';
import { AppLanguage, translations } from '../utils/translations';

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

    setTimeout(() => {
      updateVoiceStatusAndNotes(
        editingVoice.submissionId,
        modalStatus,
        modalNotes,
        modalCell,
        modalPriority
      );
      setIsSaving(false);
      setEditingVoice(null);
      onVoicesUpdated();
      onShowToast(`Updated #${editingVoice.submissionId} with administrative action log!`, 'success');
    }, 400);
  };

  // Deletion Modal state
  const [voiceToDelete, setVoiceToDelete] = useState<VoiceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleRequestDelete = (voice: VoiceRecord) => {
    setVoiceToDelete(voice);
  };

  const confirmDelete = () => {
    if (!voiceToDelete) return;
    setIsDeleting(true);
    const targetId = voiceToDelete.submissionId;
    const ok = deleteVoiceRecord(targetId);

    if (ok) {
      onVoicesUpdated();
      onShowToast(`Record #${targetId} has been permanently deleted from vault.`, 'error');
      if (editingVoice?.submissionId === targetId) {
        setEditingVoice(null);
      }
    } else {
      onShowToast(`Failed to delete record #${targetId}.`, 'error');
    }

    setIsDeleting(false);
    setVoiceToDelete(null);
  };

  return (
    <main className="relative z-10 flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Dashboard Top Glowing Header Banner */}
      <div className="p-6 rounded-3xl border border-orange-500/30 bg-[#0F0C12]/90 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border-l-4 border-l-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.2)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black tracking-widest uppercase border border-orange-500/40">
              Admin Control Room
            </span>
            <span className="text-xs text-orange-300/60 font-mono">CGEC 2026 PRO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1.5 flex items-center gap-2">
            <span>Executive Analytics & Ledger</span>
            <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Logged in as: <strong className="text-orange-300 font-mono">{adminUser.email}</strong> ({adminUser.role})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              exportVoicesCSV(voices);
              onShowToast('Exported DB as CSV', 'success');
            }}
            className="px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-950/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              exportVoicesJSON(voices);
              onShowToast('Exported DB as JSON', 'success');
            }}
            className="px-3.5 py-2 rounded-xl border border-orange-500/30 bg-orange-950/30 hover:bg-orange-950/60 text-orange-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-orange-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={onBackToStudentView}
            className="px-3.5 py-2 rounded-xl border border-orange-500/40 bg-slate-900 hover:bg-slate-800 text-orange-300 text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            Back to Student View
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 4 Glowing Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="p-5 rounded-3xl border border-orange-500/25 bg-[#0F0C12]/80 backdrop-blur-md shadow-[0_0_25px_rgba(249,115,22,0.1)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-300">Total Voices</span>
            <Inbox className="w-4 h-4 text-orange-400" />
          </div>
          <h4 className="text-2xl sm:text-3xl font-black text-white font-mono">{total}</h4>
          <span className="text-[10px] text-orange-400 font-bold mt-1 block">Logged records</span>
        </div>

        <div className="p-5 rounded-3xl border border-amber-500/25 bg-[#0F0C12]/80 backdrop-blur-md shadow-[0_0_25px_rgba(245,158,11,0.1)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-300">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <h4 className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{pending}</h4>
          <span className="text-[10px] text-amber-300 font-bold mt-1 block">Requires assessment</span>
        </div>

        <div className="p-5 rounded-3xl border border-orange-500/25 bg-[#0F0C12]/80 backdrop-blur-md shadow-[0_0_25px_rgba(249,115,22,0.1)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-300">Under Review</span>
            <RotateCw className="w-4 h-4 text-orange-400 animate-spin" />
          </div>
          <h4 className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">{inProgress}</h4>
          <span className="text-[10px] text-orange-300 font-bold mt-1 block">Active investigations</span>
        </div>

        <div className="p-5 rounded-3xl border border-emerald-500/25 bg-[#0F0C12]/80 backdrop-blur-md shadow-[0_0_25px_rgba(16,185,129,0.1)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-300">Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <h4 className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{rate}%</h4>
          <span className="text-[10px] text-emerald-400 font-bold mt-1 block">{resolved} issues resolved</span>
        </div>

      </div>

      {/* Visual Analytics Chart */}
      <AdminCharts voices={voices} />

      {/* Submissions Management Table */}
      <div className="rounded-3xl border border-orange-500/25 bg-[#0F0C12]/90 backdrop-blur-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        
        {/* Table Filter Bar */}
        <div className="p-5 border-b border-orange-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-orange-400" />
              <span>Student Submissions Ledger</span>
            </h4>
            <p className="text-xs text-slate-400">
              Update official redressal status, assign cells, and publish public remarks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-orange-400/80" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ledger..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-orange-500 focus:outline-none w-48 sm:w-60"
              />
            </div>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-orange-500 focus:outline-none"
            >
              <option value="ALL">All Depts</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="EE">EE</option>
              <option value="Civil">Civil</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-orange-500 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] font-bold tracking-wider text-orange-300/80 border-b border-orange-500/20">
              <tr>
                <th className="py-3.5 px-4">ID / Time</th>
                <th className="py-3.5 px-4">Student Details</th>
                <th className="py-3.5 px-4">Dept / Year</th>
                <th className="py-3.5 px-4">Voice Subject</th>
                <th className="py-3.5 px-4">Support</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredVoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-xs">
                    No voices match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredVoices.map((item) => (
                  <tr key={item.submissionId} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="font-bold text-orange-400">{item.submissionId}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(item.metadata.submittedAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{item.studentDetails.name}</span>
                        {item.studentDetails.isAnonymous && (
                          <span className="text-[9px] px-1.5 rounded bg-orange-950 text-orange-300 border border-orange-500/30 font-bold">
                            Shielded
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                        <span>{item.studentDetails.email}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="bg-slate-800 text-orange-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        {item.studentDetails.department}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.studentDetails.year}</div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <button
                        onClick={() => onInspectVoice(item)}
                        className="font-medium text-slate-200 hover:text-orange-400 transition-colors text-left truncate block w-full cursor-pointer"
                      >
                        {item.content.subject}
                      </button>
                      {item.metadata.adminNotes && (
                        <div className="text-[10px] text-amber-300 truncate mt-0.5 italic">
                          "{item.metadata.adminNotes}"
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-orange-300">
                        <ThumbsUp className="w-3 h-3 text-orange-400" />
                        <span>{item.metadata.upvotes || 0}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-xl font-bold uppercase ${
                          item.metadata.status === 'Pending'
                            ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                            : item.metadata.status === 'In Progress'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.metadata.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Update Status & Action Notes"
                          className="p-1.5 rounded-lg bg-orange-950/40 hover:bg-orange-500 text-orange-300 hover:text-slate-950 border border-orange-500/40 transition-all cursor-pointer shadow-sm"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onInspectVoice(item)}
                          title="Inspect Details"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleRequestDelete(item)}
                          title="Permanently Delete Submission"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Admin Action Modal */}
      {editingVoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-orange-500/40 bg-[#0F0C12] p-6 sm:p-8 shadow-[0_0_50px_rgba(249,115,22,0.3)] overflow-hidden">
            
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.8)]" />

            <button
              onClick={() => setEditingVoice(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <span className="font-mono text-xs font-black text-orange-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                <span>Action Console • {editingVoice.submissionId}</span>
              </span>
              <h3 className="text-lg font-black text-white mt-1 leading-snug">
                {editingVoice.content.subject}
              </h3>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs sm:text-sm">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Redressal Status
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as VoiceStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={modalPriority}
                    onChange={(e) => setModalPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Assign Committee / Department Cell
                </label>
                <input
                  type="text"
                  value={modalCell}
                  onChange={(e) => setModalCell(e.target.value)}
                  placeholder="e.g. Workshop Maintenance Desk, Anti-Ragging Cell"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Official Administrative Remarks (Visible to Student)
                </label>
                <textarea
                  rows={3}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="State the concrete action taken..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:border-orange-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const current = editingVoice;
                    setEditingVoice(null);
                    handleRequestDelete(current);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete Submission</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingVoice(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(249,115,22,0.6)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save & Publish Action'}</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {voiceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-rose-500/50 bg-[#120B0F] p-6 sm:p-7 shadow-[0_0_60px_rgba(244,63,94,0.35)] overflow-hidden">
            {/* Top Glowing Red Accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 shadow-[0_0_20px_rgba(244,63,94,0.8)]" />

            {/* Close button */}
            <button
              onClick={() => !isDeleting && setVoiceToDelete(null)}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[11px] font-bold text-rose-400 tracking-wider uppercase">
                  Permanent Removal • {voiceToDelete.submissionId}
                </span>
                <h3 className="text-lg font-black text-white mt-0.5 leading-snug">
                  Delete Voice Submission?
                </h3>
              </div>
            </div>

            {/* Details Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-500/25 space-y-2 mb-5 text-xs">
              <div className="font-bold text-slate-100 line-clamp-2">
                "{voiceToDelete.content.subject}"
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                <span>By: <strong className="text-slate-200">{voiceToDelete.studentDetails.isAnonymous ? 'Anonymous Student' : voiceToDelete.studentDetails.name}</strong></span>
                <span>•</span>
                <span>Dept: <strong className="text-orange-300">{voiceToDelete.studentDetails.department} ({voiceToDelete.studentDetails.year})</strong></span>
              </div>
              <p className="text-[11px] text-rose-300/80 pt-1 border-t border-slate-800/80">
                ⚠️ This will immediately purge this record from both the public student feed and the institutional ledger. This action cannot be reversed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setVoiceToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel / Keep
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-[0_0_25px_rgba(244,63,94,0.6)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
};
