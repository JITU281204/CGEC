import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Send,
  Upload,
  Sparkles,
  AlertCircle,
  FileText,
  Check,
  X,
  Shield,
  EyeOff,
  UserCheck,
  Zap,
  Tag
} from 'lucide-react';
import { Department, LanguagePref, PriorityLevel, VoiceRecord } from '../types';
import { addVoiceSubmission } from '../utils/storage';
import { AppLanguage, translations } from '../utils/translations';
import { cyberSound } from '../utils/audio';

interface StudentVoiceFormProps {
  lang?: AppLanguage;
  onVoiceSubmitted: (entry: VoiceRecord) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const DEPARTMENTS_BN: { value: Department; label: string }[] = [
  { value: 'CSE', label: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (CSE)' },
  { value: 'ECE', label: 'ইলেকট্রনিক্স অ্যান্ড কমিউনিকেশন (ECE)' },
  { value: 'ME', label: 'মেকানিক্যাল ইঞ্জিনিয়ারিং (ME)' },
  { value: 'EE', label: 'ইলেকট্রিক্যাল ইঞ্জিনিয়ারিং (EE)' },
  { value: 'Civil', label: 'সিভিল ইঞ্জিনিয়ারিং (CE)' },
];

const DEPARTMENTS_EN: { value: Department; label: string }[] = [
  { value: 'CSE', label: 'Computer Science & Engineering (CSE)' },
  { value: 'ECE', label: 'Electronics & Communication Engg (ECE)' },
  { value: 'ME', label: 'Mechanical Engineering (ME)' },
  { value: 'EE', label: 'Electrical Engineering (EE)' },
  { value: 'Civil', label: 'Civil Engineering (CE)' },
];

const CATEGORIES_BN = [
  { value: 'Academic', label: 'অ্যাকাডেমিক ও সিলেবাস' },
  { value: 'Hostel & Mess', label: 'হস্টেল ও মেস পরিকাঠামো' },
  { value: 'Lab & Infrastructure', label: 'ল্যাব ও যন্ত্রপাতি সুবিধা' },
  { value: 'Wi-Fi & Network', label: 'ওয়াই-ফাই ও ইন্টারনেট সংযোগ' },
  { value: 'Campus Security', label: 'ক্যাম্পাস ও হস্টেল নিরাপত্তা' },
  { value: 'General', label: 'সাধারণ প্রস্তাবনা' },
];

const CATEGORIES_EN = [
  { value: 'Academic', label: 'Academic & Syllabus' },
  { value: 'Hostel & Mess', label: 'Hostel & Mess Facilities' },
  { value: 'Lab & Infrastructure', label: 'Lab & Equipment' },
  { value: 'Wi-Fi & Network', label: 'Wi-Fi & Internet Connectivity' },
  { value: 'Campus Security', label: 'Campus & Hostel Security' },
  { value: 'General', label: 'General Feedback' },
];

const BENGALI_SUGGESTIONS = [
  'কম্পিউটার ল্যাবে হাই-স্পিড ইন্টারনেট ও নতুন ল্যাব পিসি প্রয়োজন।',
  'সেন্ট্রাল লাইব্রেরিতে নতুন গেট (GATE) ২০২৬ সিলেবাসের বই আপডেট করা হোক।',
  'হোস্টেলের ওয়াটার পিউরিফায়ারের ফিল্টার পরিবর্তন ও সার্ভিসিং দরকার।',
  'ওয়ার্কশপের মেশিনারিগুলোর নিয়মিত সার্ভিসিং ও সুরক্ষা কিট প্রয়োজন।',
  'হোস্টেল থেকে প্রধান ভবনের রাস্তায় রাতে অতিরিক্ত এলইডি স্ট্রিট লাইট বসানো হোক।'
];

const ENGLISH_SUGGESTIONS = [
  'Requesting high-speed Wi-Fi router coverage in hostel study rooms.',
  'Need updated reference textbooks and digital subscriptions in Central Library.',
  'Hostel water purifier servicing and regular water quality inspection needed.',
  'Mechanical workshop lathe machine maintenance and safety gear allocation required.',
  'Night street lighting and security patrol requested along campus connecting road.'
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
  const [language, setLanguage] = useState<LanguagePref>('English');
  const [category, setCategory] = useState<string>('Lab & Infrastructure');
  const [priority, setPriority] = useState<PriorityLevel>('Normal');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const [attachmentName, setAttachmentName] = useState<string>('');
  const [attachmentDataUrl, setAttachmentDataUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const depts = lang === 'bn' ? DEPARTMENTS_BN : DEPARTMENTS_EN;
  const categories = lang === 'bn' ? CATEGORIES_BN : CATEGORIES_EN;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(lang === 'bn' ? 'ফাইলের আকার ৫ মেগাবাইটের (5MB) নিচে হতে হবে।' : 'File size must be under 5MB.');
      cyberSound.playError();
      return;
    }

    setAttachmentName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    cyberSound.playClick();
  };

  const handleAppendPrompt = (promptText: string) => {
    cyberSound.playClick();
    setMessage((prev) => (prev ? `${prev}\n${promptText}` : promptText));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।' : 'Please enter your student name.');
      cyberSound.playError();
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে সঠিক কলেজ ইমেইল অ্যাড্রেস লিখুন।' : 'Please provide a valid college email address.');
      cyberSound.playError();
      return;
    }

    if (!phone.trim()) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে মোবাইল নম্বর লিখুন।' : 'Please enter your phone number.');
      cyberSound.playError();
      return;
    }

    if (!subject.trim()) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে অভিযোগ বা প্রস্তাবের শিরোনাম লিখুন।' : 'Please enter a voice subject / title.');
      cyberSound.playError();
      return;
    }

    if (!message.trim() || message.trim().length < 15) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে আপনার বক্তব্য অন্তত ১৫ অক্ষরে বিস্তারিত লিখুন।' : 'Please describe your grievance or proposal in at least 15 characters.');
      cyberSound.playError();
      return;
    }

    setIsSubmitting(true);
    cyberSound.playClick();

    setTimeout(() => {
      const createdRecord = addVoiceSubmission(
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          department,
          year,
          isAnonymous,
        },
        {
          language,
          subject: subject.trim(),
          message: message.trim(),
          category: category as any,
        },
        priority,
        attachmentName ? { name: attachmentName, dataUrl: attachmentDataUrl } : undefined
      );

      try {
        confetti({
          particleCount: 110,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch {
        // Fallback
      }

      cyberSound.playSuccess();
      setIsSubmitting(false);
      onVoiceSubmitted(createdRecord);
      onShowToast(
        lang === 'bn'
          ? `ভয়েস সফলভাবে জমা হয়েছে! ট্র্যাকিং আইডি: ${createdRecord.submissionId}`
          : `Voice Submitted! Tracking ID: ${createdRecord.submissionId}`,
        'success'
      );

      // Reset
      setSubject('');
      setMessage('');
      setAttachmentName('');
      setAttachmentDataUrl('');
    }, 500);
  };

  const currentSuggestions = language === 'Bengali' ? BENGALI_SUGGESTIONS : ENGLISH_SUGGESTIONS;

  return (
    <section id="submit-voice" className="relative z-10 py-10 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="relative rounded-3xl border border-slate-800 bg-slate-900/85 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl overflow-hidden p-6 sm:p-10">
        
        {/* Glow ambient spots */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.formBadge}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
            {t.formTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            {t.formSubtitle}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-2xl border border-rose-500/40 bg-rose-950/40 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Identity Confidentiality Toggle */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-white block">{t.identityMode}</span>
              <p className="text-[11px] text-slate-400">
                {isAnonymous ? t.identityModeDescShield : t.identityModeDescVerified}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  cyberSound.playClick();
                  setIsAnonymous(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  !isAnonymous ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{t.modeVerified}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  cyberSound.playClick();
                  setIsAnonymous(true);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isAnonymous ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>{t.modeShield}</span>
              </button>
            </div>
          </div>

          {/* Student details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.fieldName} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: শ্রীকান্ত মুখার্জী' : 'e.g. Srikanta Mukherjee'}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.fieldEmail} <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@cgec.ac.in"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.fieldPhone} <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.fieldDept} <span className="text-rose-400">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none transition-colors"
              >
                {depts.map((dept) => (
                  <option key={dept.value} value={dept.value} className="bg-slate-900">
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.fieldYear} <span className="text-rose-400">*</span>
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none transition-colors"
              >
                <option value="1st Year">{lang === 'bn' ? '১ম বর্ষ (সেমিস্টার ১/২)' : '1st Year (Semester 1/2)'}</option>
                <option value="2nd Year">{lang === 'bn' ? '২য় বর্ষ (সেমিস্টার ৩/৪)' : '2nd Year (Semester 3/4)'}</option>
                <option value="3rd Year">{lang === 'bn' ? '৩য় বর্ষ (সেমিস্টার ৫/৬)' : '3rd Year (Semester 5/6)'}</option>
                <option value="4th Year">{lang === 'bn' ? '৪র্থ বর্ষ (সেমিস্টার ৭/৮)' : '4th Year (Semester 7/8)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.fieldLang} <span className="text-rose-400">*</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguagePref)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none transition-colors"
              >
                <option value="Bengali">বাংলা (Bengali)</option>
                <option value="English">English</option>
              </select>
            </div>
          </div>

          {/* Category & Urgency level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.fieldCategory}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-slate-900">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.fieldPriority}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'Normal', labelBn: 'স্বাভাবিক', labelEn: 'Normal' },
                  { value: 'High', labelBn: 'উচ্চ', labelEn: 'High' },
                  { value: 'Urgent', labelBn: 'অতি জরুরী', labelEn: 'Urgent' }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      cyberSound.playClick();
                      setPriority(item.value as PriorityLevel);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      priority === item.value
                        ? item.value === 'Urgent'
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                          : item.value === 'High'
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950/80 border border-slate-700 text-slate-400'
                    }`}
                  >
                    {lang === 'bn' ? item.labelBn : item.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Voice Subject & Message */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.fieldSubject} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={
                  language === 'Bengali'
                    ? 'যেমন: মেকানিক্যাল ওয়ার্কশপে সুরক্ষা সরঞ্জাম ও টুলসের ঘাটতি'
                    : 'e.g. Wi-Fi router speed and bandwidth issues in Hostel Block 2'
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {t.fieldMessage} <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {message.length} {lang === 'bn' ? 'অক্ষর' : 'chars'}
                </span>
              </div>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  language === 'Bengali'
                    ? 'আপনার সমস্যা বা প্রস্তাব বিস্তারিত লিখুন... যা যা হয়েছে স্পষ্ট করে জানান।'
                    : 'Describe your grievance or suggestions clearly with specific room or equipment details...'
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:border-cyan-500 focus:outline-none transition-colors resize-y leading-relaxed font-sans"
              />

              {/* Suggestions */}
              <div className="mt-3">
                <span className="text-[11px] text-slate-400 block mb-1.5">
                  {t.quickAppendLabel}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentSuggestions.map((sugg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAppendPrompt(sugg)}
                      className="text-left text-[11px] px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer font-sans"
                    >
                      + {sugg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Optional Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.attachLabel}
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-950/60 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.attachBtn}</span>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {attachmentName && (
                <div className="flex items-center gap-2 text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-xl max-w-xs truncate">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
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

            {attachmentDataUrl && attachmentDataUrl.startsWith('data:image') && (
              <div className="mt-3">
                <img
                  src={attachmentDataUrl}
                  alt="Attachment preview"
                  className="h-20 w-auto rounded-xl border border-slate-700 object-cover"
                />
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-cyan-500/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98 font-sans"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.submittingBtn}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.submitBtn}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </section>
  );
};
