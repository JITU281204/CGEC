import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, KeyRound, Check, X, ShieldCheck, Info } from 'lucide-react';
import { verifyAdminAuth, saveAdminSession, AUTHORIZED_ADMIN_EMAILS, VALID_MASTER_PASSCODES } from '../utils/storage';
import { AdminUser } from '../types';

interface AdminLoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState<string>('jituraj19cse@gmail.com');
  const [passcode, setPasscode] = useState<string>('');
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  const displayPasscode = 'CGEC#Voice2026!Xk9';

  const handleQuickFill = (targetEmail: string) => {
    setEmail(targetEmail);
    setPasscode(displayPasscode);
    setErrorMsg('');
  };

  const handleCopyPasscode = () => {
    navigator.clipboard.writeText(displayPasscode);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsVerifying(true);

    setTimeout(() => {
      const result = verifyAdminAuth(email, passcode);

      if (!result.success) {
        setErrorMsg(result.message);
        setIsVerifying(false);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      if (result.adminUser) {
        saveAdminSession(result.adminUser);
        onLoginSuccess(result.adminUser);
        onClose();
      }
      setIsVerifying(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div
        className={`relative w-full max-w-md rounded-3xl border border-cyan-500/40 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-cyan-950/80 overflow-hidden transition-all ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Top security accent line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-rose-500" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with badge */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 mx-auto flex items-center justify-center text-xl text-white shadow-lg shadow-cyan-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">CGEC Admin Authentication</h3>
          <p className="text-xs text-slate-400">Enter authorized admin email & master passcode.</p>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl border border-rose-500/40 bg-rose-950/40 text-rose-300 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Select / Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Authorized Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <select
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-slate-100 text-xs focus:border-cyan-500 focus:outline-none"
              >
                <option value="jituraj19cse@gmail.com">jituraj19cse@gmail.com (Lead Admin)</option>
                <option value="royniloy1235@gmail.com">royniloy1235@gmail.com (Executive Admin)</option>
              </select>
            </div>
          </div>

          {/* Master Passcode */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                16-Digit Master Passcode
              </label>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPasscode ? 'text' : 'password'}
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="CGEC#Voice2026!Xk9"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-slate-100 text-xs font-mono tracking-wider focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Helper */}
          <div className="p-3.5 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 text-xs text-slate-300">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Master Passcode:</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="font-mono text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-cyan-300 font-bold">
                  {displayPasscode}
                </code>
                <button
                  type="button"
                  onClick={handleCopyPasscode}
                  className="text-slate-400 hover:text-white"
                  title="Copy passcode"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <KeyRound className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-cyan-900/30 text-[11px] text-slate-400">
              <span>Quick Login:</span>
              <button
                type="button"
                onClick={() => handleQuickFill('jituraj19cse@gmail.com')}
                className="text-cyan-400 underline hover:text-cyan-300"
              >
                jituraj19cse
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => handleQuickFill('royniloy1235@gmail.com')}
                className="text-cyan-400 underline hover:text-cyan-300"
              >
                royniloy1235
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Authenticate & Unlock Portal</span>
              </>
            )}
          </button>

        </form>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <Info className="w-3 h-3 text-cyan-400" />
            <span>Strict Role-Based Access Control (RBAC) Active</span>
          </p>
        </div>

      </div>
    </div>
  );
};
