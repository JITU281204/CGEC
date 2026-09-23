import React from 'react';
import { Lock } from 'lucide-react';

interface FooterProps {
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminLogin }) => {
  return (
    <footer className="relative z-20 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl py-6 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        
        <div>
          <span className="font-bold text-slate-200">CGEC Campus Voice System</span> &copy; 2026. All rights reserved.
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
          <span>Official Portal of Cooch Behar Government Engineering College</span>
          <span>•</span>
          <a
            href="https://cgec.ac.in"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline"
          >
            cgec.ac.in
          </a>
          <span>•</span>
          <button
            onClick={onOpenAdminLogin}
            className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            <span>Admin Vault</span>
          </button>
        </div>

      </div>
    </footer>
  );
};
