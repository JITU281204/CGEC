import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, KeyRound, X, ShieldCheck, Flame, Shield, AlertTriangle } from 'lucide-react';
import { verifyAdminAuth, saveAdminSession } from '../utils/storage';
import { AdminUser } from '../types';

interface AdminLoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState<string>('');
  const [passcode, setPasscode] = useState<string>('');
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setErrorMsg('');
    setIsVerifying(true);

    try {
      const result = await verifyAdminAuth(email, passcode);

      if (!result.success) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 5) {
          setLockoutRemaining(45); // 45 seconds lockout
          setErrorMsg('Security lockout triggered: Too many invalid attempts. Try again after 45 seconds.');
        } else {
          setErrorMsg(result.message);
        }

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
    } catch (err) {
      console.error(err);
      setErrorMsg('Cryptographic authorization failed. Please retry.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        className={`relative w-full max-w-md rounded-3xl border border-orange-500/40 bg-[#0E0B12] p-6 sm:p-8 shadow-[0_0_60px_rgba(249,115,22,0.3)] overflow-hidden transition-transform ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Top Glowing Fiery Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.8)]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Secure Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 mx-auto flex items-center justify-center text-slate-950 shadow-[0_0_25px_rgba(249,115,22,0.5)]">
            <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">Institutional Admin Vault</h3>
          <p className="text-xs text-orange-200/70">
            Encrypted Administrative Access Gateway
          </p>
        </div>

        {/* Security Notice */}
        <div className="mb-5 p-3 rounded-2xl border border-orange-500/20 bg-orange-950/20 text-orange-200 text-[11px] flex items-center gap-2">
          <Lock className="w-4 h-4 text-orange-400 shrink-0" />
          <span>Restricted to designated CGEC authority cell members. All verification attempts are cryptographically hashed.</span>
        </div>

        {/* Error / Lockout Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl border border-rose-500/40 bg-rose-950/50 text-rose-300 text-xs flex items-start gap-2">
            {lockoutRemaining > 0 ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span>{errorMsg}</span>
              {lockoutRemaining > 0 && (
                <div className="mt-1 font-bold text-amber-300">
                  Cooldown timer: {lockoutRemaining}s remaining
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Admin Email (Zero pre-suggestions) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Designated Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-orange-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                disabled={lockoutRemaining > 0 || isVerifying}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter authorized administrator email"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Master Passcode (Zero pre-suggestions) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">
                Master Security Passcode
              </label>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-orange-400 absolute left-3 top-3.5" />
              <input
                type={showPasscode ? 'text' : 'password'}
                required
                disabled={lockoutRemaining > 0 || isVerifying}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter encrypted access key"
                autoComplete="new-password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono tracking-wider focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                title={showPasscode ? "Hide Passcode" : "Show Passcode"}
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isVerifying || lockoutRemaining > 0 || !email || !passcode}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Hashing & Verifying Credentials...</span>
              </>
            ) : lockoutRemaining > 0 ? (
              <span>Locked ({lockoutRemaining}s)</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Authenticate & Access Vault</span>
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-slate-500 pt-1">
            256-Bit Cryptographic Hash Protocol • Anti-Brute-Force Protected
          </p>

        </form>

      </div>
    </div>
  );
};
