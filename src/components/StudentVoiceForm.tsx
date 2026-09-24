import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Send, AlertCircle, EyeOff, UserCheck, Paperclip, X, Flame, Sparkles, CheckCircle2, Lock, ArrowRight, Shield } from 'lucide-react';
import { Department, PriorityLevel, VoiceRecord } from '../types';
import { addVoiceSubmission } from '../utils/storage';
import { AppLanguage, translations } from '../utils/translations';
import { AdminContactCard } from './AdminContactCard';

interface StudentVoiceFormProps {
  lang?: AppLanguage;
  onVoiceSubmitted: (entry: VoiceRecord) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const DEPARTMENTS: { value: Department; label: string }[] = [
  { value: 'CSE', label: 'Computer Science & Engineering (CSE)' },
  { value: 'ECE', label: 'Electronics & Communication Engg (ECE)' },
  { value: 'ME', label: 'Mechanical Engineering (ME)' },
  { value: 'EE', label: 'Electrical Engineering (EE)' },
  { value: 'Civil', label: 'Civil Engineering (CE)' },
];

const CATEGORIES = [
  'Lab & Infrastructure',
  'Wi-Fi & Connectivity',
  'Hostel & Mess Facilities',
  'Academic & Library',
  'Campus Security & Lighting',
  'Events & Extracurricular',
  'General Administration',
] as const;

const QUICK_IDEAS = [
  '⚡ High-speed Wi-Fi connectivity in Hostel study rooms',
  '📚 Digital library subscription & 2026 GATE textbooks',
  '🛠️ Workshop lathe machine servicing and safety gear',
  '💡 Solar LED street lamps along hostel connecting path',
];

export const StudentVoiceForm: React.FC<StudentVoiceFormProps> = ({
  lang = 'en',
  onVoiceSubmitted,
  onShowToast,
}) => {
  const t = translations[lang];

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [department, setDepartment] = useState<Department>('CSE');
  const [year, setYear] = useState<string>('3rd Year');
  const [category, setCategory] = useState<string>('Lab & Infrastructure');
  const [priority, setPriority] = useState<PriorityLevel>('Normal');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const [attachmentName, setAttachmentName] = useState<string>('');
  const [attachmentDataUrl, setAttachmentDataUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submittedRecord, setSubmittedRecord] = useState<VoiceRecord | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size must be under 5MB.');
      return;
    }

    setAttachmentName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyQuickIdea = (idea: string) => {
    const clean = idea.replace(/^[^\s]+\s/, '');
    setSubject(clean);
    if (!message) {
      setMessage(`Regarding ${clean.toLowerCase()} at CGEC campus. Kindly review and take necessary action.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid college email address.');
      return;
    }

    if (!subject.trim()) {
      setErrorMsg('Please provide a clear subject / title for your voice.');
      return;
    }

    if (!message.trim() || message.trim().length < 10) {
      setErrorMsg('Please describe your grievance or suggestion in at least 10 characters.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const createdRecord = addVoiceSubmission(
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || 'N/A',
          department,
          year,
          isAnonymous,
        },
        {
          language: lang === 'bn' ? 'Bengali' : 'English',
          subject: subject.trim(),
          message: message.trim(),
          category: category as any,
        },
        priority,
        attachmentName ? { name: attachmentName, dataUrl: attachmentDataUrl } : undefined
      );

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f97316', '#f59e0b', '#fbbf24', '#ff7a00'],
        });
      } catch {
        // Fallback
      }

      setIsSubmitting(false);
      setSubmittedRecord(createdRecord);
      onVoiceSubmitted(createdRecord);
      onShowToast(
        lang === 'bn'
          ? `ভয়েস সফলভাবে সংরক্ষিত! ট্র্যাকিং আইডি: ${createdRecord.submissionId}`
          : `Voice Transmitted! Tracking ID: ${createdRecord.submissionId}`,
        'success'
      );

      // Reset
      setSubject('');
      setMessage('');
      setAttachmentName('');
      setAttachmentDataUrl('');
    }, 450);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {submittedRecord ? (
        <div className="relative rounded-3xl bg-[#0F0C12]/95 border border-orange-500/50 p-6 sm:p-10 shadow-[0_0_60px_rgba(249,115,22,0.3)] backdrop-blur-xl overflow-hidden animate-in fade-in space-y-6">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.8)]" />

          {/* Success header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto text-slate-950 shadow-[0_0_25px_rgba(249,115,22,0.6)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider inline-block">
              Successfully Transmitted to Vault
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {lang === 'bn' ? 'আপনার ভয়েস সংরক্ষিত হয়েছে!' : 'Grievance Registered Successfully'}
            </h3>
            <p className="text-xs text-orange-200/80 max-w-md mx-auto">
              Your tracking ID is <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-orange-500/20 border border-orange-500/40">{submittedRecord.submissionId}</span>. Use this code anytime to monitor redressal progress.
            </p>
          </div>

          {/* Privacy Protection Notice & Blurred Preview */}
          <div className="rounded-2xl border border-orange-500/40 bg-black/60 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-orange-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-white">
                  Privacy & Anti-Spam Protection Mode: <span className="text-emerald-400">ACTIVE</span>
                </span>
              </div>
              <span className="text-[10px] font-mono text-orange-300">
                {submittedRecord.submissionId}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-bold block mb-1">Subject:</span>
              <p className="text-sm font-bold text-white">{submittedRecord.content.subject}</p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-bold block mb-1">Public Display Preview:</span>
              
              {/* Blurred Message Box */}
              <div className="relative overflow-hidden rounded-xl bg-black/80 border border-orange-500/30 p-4">
                <p className="text-xs sm:text-sm text-slate-300 filter blur-[5px] select-none pointer-events-none opacity-60 leading-relaxed">
                  {submittedRecord.content.message}
                </p>

                {/* Visible to connect Admin strip */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-gradient-to-b from-black/85 via-black/75 to-black/90 backdrop-blur-[2px] text-center">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3 py-1.5 rounded-xl shadow-sm">
                    <Lock className="w-3.5 h-3.5 text-orange-400" />
                    <span>Visible to connect Admin</span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1">
                    Your description has been shielded so unauthorized users cannot spam or misquote your submission.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Official Admin Contacts */}
          <AdminContactCard
            title="Official Admin Contact for Fast-Track Review"
            subtitle="Connect directly with verified administrators for quick investigation or queries."
          />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSubmittedRecord(null)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-orange-500/40 bg-slate-950 hover:bg-orange-950/30 text-orange-200 text-xs font-bold transition-all cursor-pointer"
            >
              Submit Another Grievance
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.querySelector('button[aria-label="Institutional Portal Access"]');
                setSubmittedRecord(null);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2"
            >
              <span>Back to Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
      <div className="relative rounded-3xl bg-[#0F0C12]/90 border border-orange-500/40 p-6 sm:p-10 shadow-[0_0_50px_rgba(249,115,22,0.22)] backdrop-blur-xl overflow-hidden">
        
        {/* Top Radiant Orange Border Gradient Strip */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.8)]" />

        {/* Clean Header */}
        <div className="mb-6 pb-5 border-b border-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/40">
                Direct Dispatch Vault
              </span>
              <span className="text-xs text-orange-300/60 font-mono">CGEC 2026</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1.5 flex items-center gap-2">
              <span>{lang === 'bn' ? 'অভিযোগ বা প্রস্তাব প্রেরণ করুন' : 'Submit Your Voice'}</span>
              <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {lang === 'bn'
                ? 'আপনার বার্তা এনক্রিপ্ট হয়ে সরাসরি সিজিএসসি কর্তৃপক্ষের কাছে পৌঁছাবে এবং ট্র্যাকিং কোড জেনারেট হবে।'
                : 'Directly logged for executive review. You will receive an official reference code to track resolution.'}
            </p>
          </div>

          {/* Quick Identity Shield Switcher */}
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 border ${
              isAnonymous
                ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {isAnonymous ? <EyeOff className="w-4 h-4 text-orange-400" /> : <UserCheck className="w-4 h-4 text-slate-500" />}
            <span>{isAnonymous ? 'Identity Shielded (Anonymous)' : 'Identity: Public Name'}</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-2xl border border-rose-500/40 bg-rose-950/40 text-rose-300 text-xs flex items-center gap-2.5 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Inspiration Chips */}
        <div className="mb-6">
          <span className="text-[11px] font-bold text-orange-300/80 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tap to autofill common campus issues:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_IDEAS.map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyQuickIdea(idea)}
                className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-orange-500/30 hover:border-orange-500 text-xs text-orange-200/90 hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] text-left"
              >
                {idea}
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
          
          {/* Row 1: Student details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-200 font-semibold text-xs mb-1.5">
                {lang === 'bn' ? 'শিক্ষার্থীর নাম' : 'Full Name'} <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Srikanta Mukherjee"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/90 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-semibold text-xs mb-1.5">
                {lang === 'bn' ? 'কলেজ ইমেইল' : 'College Email'} <span className="text-orange-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student.cse26@cgec.org.in"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/90 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-semibold text-xs mb-1.5">
                {lang === 'bn' ? 'ডিপার্টমেন্ট' : 'Academic Department'} <span className="text-orange-400">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/90 text-white text-xs focus:outline-none focus:border-orange-500 focus:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.value} value={d.value} className="bg-slate-900">
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-200 font-semibold text-xs mb-1.5">
                {lang === 'bn' ? 'অ্যাকাডেমিক বর্ষ' : 'Academic Year'} <span className="text-orange-400">*</span>
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/90 text-white text-xs focus:outline-none focus:border-orange-500 focus:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
              >
                <option value="1st Year">1st Year (Freshers)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Final Year)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Subject & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-200 font-semibold text-xs mb-1.5">
                {lang === 'bn' ? 'বিষয় / সারসংক্ষেপ' : 'Subject / Issue Title'} <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Wi-Fi router connectivity issues in Hostel Block 2"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/90 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-semibold text-xs mb-1.5">
                {lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/90 text-white text-xs focus:outline-none focus:border-orange-500 focus:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-200 font-semibold text-xs">
                {lang === 'bn' ? 'বিস্তারিত বর্ণনা' : 'Detailed Grievance or Proposal'} <span className="text-orange-400">*</span>
              </label>
              <span className="text-[11px] text-orange-400 font-mono">{message.length} chars</span>
            </div>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="State the classroom number, lab machine, hostel block, or detailed suggestion clearly so the cell can address it quickly..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/90 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all resize-y leading-relaxed"
            />
          </div>

          {/* Attachment */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-orange-500/30 hover:border-orange-500 bg-slate-950 text-xs font-semibold text-orange-300 hover:text-white transition-all shadow-sm">
                <Paperclip className="w-3.5 h-3.5 text-orange-400" />
                <span>{attachmentName ? 'Change Attachment' : 'Attach Photo/Proof (Optional)'}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {attachmentName && (
                <div className="flex items-center gap-2 text-xs text-orange-300 bg-orange-950/40 border border-orange-500/40 px-3 py-1.5 rounded-xl max-w-xs truncate shadow-sm">
                  <span className="truncate">{attachmentName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentName('');
                      setAttachmentDataUrl('');
                    }}
                    className="text-slate-400 hover:text-rose-400 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Magnetic Glowing Orange Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-[0_0_35px_rgba(249,115,22,0.6)] hover:shadow-[0_0_50px_rgba(249,115,22,0.85)] transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer transform hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Encrypting & Dispatching to Vault...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>Transmit Voice Submission</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
      )}
    </div>
  );
};
