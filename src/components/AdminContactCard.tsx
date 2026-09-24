import React from 'react';
import { Mail, Phone, ShieldCheck, Flame, ExternalLink, MessageCircle, Globe } from 'lucide-react';

export const ADMIN_CONTACTS = [
  {
    name: 'Jituraj',
    title: 'Lead Administrator & System Head',
    email: 'jituraj19cse@gmail.com',
    phone: '8617489374',
    phoneDisplay: '+91 86174 89374',
  },
  {
    name: 'Niloy Roy',
    title: 'Executive Co-Admin & Grievance Cell',
    email: 'royniloy1235@gmail.com',
    phone: '6296154016',
    phoneDisplay: '+91 62961 54016',
  }
];

interface AdminContactCardProps {
  compact?: boolean;
  title?: string;
  subtitle?: string;
}

export const AdminContactCard: React.FC<AdminContactCardProps> = ({
  compact = false,
  title = 'Official Administrative Cell & Verification',
  subtitle = 'To protect student privacy and prevent spam, details are kept confidential. Contact the verified administrators below for queries or fast-track verification.',
}) => {
  return (
    <div className={`rounded-2xl border border-orange-500/40 bg-gradient-to-b from-[#180e07] via-[#0F0C12] to-[#0A070E] shadow-[0_0_35px_rgba(249,115,22,0.18)] ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)]">
          <ShieldCheck className="w-4 h-4 text-orange-400" />
        </div>
        <div>
          <h4 className="text-sm font-black text-white flex items-center gap-1.5">
            <span>{title}</span>
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 shrink-0" />
          </h4>
          {subtitle && (
            <p className="text-[11px] text-orange-200/70 leading-tight mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Admin list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        {ADMIN_CONTACTS.map((adm, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-black/60 border border-orange-500/30 hover:border-orange-500/60 transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-xs font-black text-orange-300 block group-hover:text-white transition-colors">
                  {adm.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {adm.title}
                </span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold uppercase">
                Admin
              </span>
            </div>

            {/* Quick Actions */}
            <div className="space-y-1.5 pt-1.5 border-t border-orange-500/15 text-xs">
              <a
                href={`mailto:${adm.email}`}
                className="flex items-center gap-2 text-slate-300 hover:text-orange-300 transition-colors truncate"
              >
                <Mail className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="font-mono text-[11px] truncate">{adm.email}</span>
              </a>

              <div className="flex items-center justify-between gap-2">
                <a
                  href={`tel:${adm.phone}`}
                  className="flex items-center gap-2 text-slate-300 hover:text-amber-300 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-mono text-[11px] font-semibold">{adm.phoneDisplay}</span>
                </a>

                <a
                  href={`https://wa.me/91${adm.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Chat on WhatsApp"
                  className="px-2 py-0.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 transition-all"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-400" />
                  <span>Chat</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Official College Portal Link */}
      <div className="mt-3 pt-2.5 border-t border-orange-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[11px] text-orange-200/70 font-medium">Cooch Behar Govt. Engineering College:</span>
        <a
          href="https://cgec.org.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 hover:text-white font-bold text-[11px] transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-orange-400" />
          <span>cgec.org.in</span>
          <ExternalLink className="w-3 h-3 text-orange-400" />
        </a>
      </div>

    </div>
  );
};
