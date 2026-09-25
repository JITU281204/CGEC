import React from 'react';
import { Lock, Mail, Phone, ShieldCheck, Flame, Globe, ExternalLink } from 'lucide-react';
import { ADMIN_CONTACTS } from './AdminContactCard';

interface FooterProps {
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminLogin }) => {
  return (
    <footer className="relative z-20 border-t border-orange-500/20 bg-slate-950/95 backdrop-blur-xl pt-8 pb-6 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Verified Administrative Contact Strip */}
        <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-950/40 via-black to-orange-950/30 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-orange-300">
                  Direct Institutional Admin Desk
                </span>
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              </div>
              <p className="text-[11px] text-slate-300">
                To connect with administrators or request unblur/action clearance:
              </p>
            </div>
          </div>

          {/* Quick contact pills + Official Portal Button */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <a
              href="https://cgec.org.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 border border-orange-500/40 text-orange-200 hover:text-white font-bold text-[11px] transition-all shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:scale-105"
              title="Visit Cooch Behar Government Engineering College Official Portal"
            >
              <Globe className="w-3.5 h-3.5 text-orange-400" />
              <span>Official Site: cgec.org.in</span>
              <ExternalLink className="w-3 h-3 text-orange-300" />
            </a>

            {ADMIN_CONTACTS.map((adm, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/80 border border-orange-500/30 text-[11px]"
              >
                <span className="font-bold text-orange-200">{adm.name}:</span>
                <a
                  href={`mailto:${adm.email}`}
                  className="text-slate-300 hover:text-orange-400 font-mono transition-colors flex items-center gap-1"
                >
                  <Mail className="w-3 h-3 text-orange-400" />
                  <span>{adm.email}</span>
                </a>
                <span className="text-slate-600">|</span>
                <a
                  href={`tel:${adm.phone}`}
                  className="text-slate-300 hover:text-amber-300 font-mono transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-amber-400" />
                  <span>{adm.phoneDisplay}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright line with Cloud DB status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 pt-2 border-t border-slate-900">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-200">CGEC Campus Voice System</span> &copy; 2026.
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Firebase Live: cgec-campus-voice</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px]">
            <span className="text-slate-400">Official Portal:</span>
            <a
              href="https://cgec.org.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-300 hover:text-white font-bold bg-orange-500/15 hover:bg-orange-500/25 px-2.5 py-1 rounded-lg border border-orange-500/40 transition-all flex items-center gap-1 shadow-[0_0_12px_rgba(249,115,22,0.2)]"
            >
              <Globe className="w-3.5 h-3.5 text-orange-400" />
              <span>https://cgec.org.in/</span>
              <ExternalLink className="w-3 h-3 text-orange-400" />
            </a>
            <span className="text-slate-600">•</span>
            <button
              onClick={onOpenAdminLogin}
              title="Institutional Authorized Portal (Alt + A)"
              className="text-slate-500 hover:text-orange-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span className="text-[10px]">Cell Portal</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

