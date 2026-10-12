import React from 'react';
import { X, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

interface DemarcheModalProps {
  item: { title: string; desc: string; steps: string } | null;
  onClose: () => void;
}

export const DemarcheModal: React.FC<DemarcheModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#03594E] p-4 sm:p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F8C62F] pr-10">
            <FileText className="w-4 h-4 shrink-0" />
            <span>Démarche Administrative FEGT</span>
          </div>
          <h2 className="text-lg sm:text-xl font-serif font-bold mt-1 text-white pr-10">
            {item.title}
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-4 text-stone-800 text-xs">
          <div>
            <h4 className="font-mono font-bold uppercase text-[#FE8235] text-[11px] mb-1">
              Description & Utilité
            </h4>
            <p className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-700 leading-relaxed text-xs sm:text-sm">
              {item.desc}
            </p>
          </div>

          <div>
            <h4 className="font-mono font-bold uppercase text-[#03594E] text-[11px] mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#03594E] shrink-0" />
              Procédure étape par étape
            </h4>
            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#F8C62F]/50 text-stone-800 font-mono text-[11px] sm:text-xs leading-relaxed">
              {item.steps}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <a
              href="https://fegt.uiz.ac.ma/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#03594E] font-bold inline-flex items-center justify-center gap-1.5 hover:underline text-xs min-h-[44px]"
            >
              Accéder au portail MyUIZ <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="min-h-[44px] px-5 py-2.5 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 text-xs transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
