import React, { useState } from 'react';
import { X, CheckCircle, FileText, Send, Sparkles } from 'lucide-react';

interface ProjectProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectProposalModal: React.FC<ProjectProposalModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    club: 'ENACTUS',
    responsable: '',
    cne: '',
    email: '',
    description: '',
    objectifs: '',
    datePrevue: '',
    besoins: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#03594E] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F8C62F]">
            <Sparkles className="w-4 h-4" />
            <span>Vie Associative · Espace Initiatives Étudiantes</span>
          </div>
          
          <h2 className="text-2xl font-serif font-bold mt-1 tracking-tight">
            Proposer une activité ou un projet
          </h2>
          <p className="text-xs font-sans text-stone-200 mt-1">
            Parcours officiel FEGT : IDÉE ➔ PROPOSITION ➔ VALIDATION ➔ ORGANISATION ➔ COMMUNICATION ➔ ACTIVITÉ ➔ BILAN
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-[#1F2432]">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#03594E] mx-auto flex items-center justify-center">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#03594E]">
                Proposition enregistrée avec succès !
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                Votre fiche d’activité pour <strong className="text-stone-900">« {formData.title || 'Projet étudiant'} »</strong> a été transmise au Responsable de la Vie de l’Étudiant de la FEGT. Vous recevrez un accusé et une invitation pour le comité de validation.
              </p>
              <div className="p-3 bg-[#F0F4F5] rounded-xl text-xs text-stone-700 max-w-md mx-auto font-mono text-left">
                Statut : Étape 2/7 · En attente de validation administrative
              </div>
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="mt-4 px-6 py-2.5 bg-[#03594E] text-white text-xs font-bold rounded-xl hover:bg-[#024138] transition-colors"
              >
                Retourner au guide
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                  Intitulé du projet ou de l’activité *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex : Forum de l’Entrepreneuriat Vert à Taroudant"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#03594E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                    Club porteur *
                  </label>
                  <select
                    value={formData.club}
                    onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#03594E]"
                  >
                    <option value="ENACTUS">ENACTUS FEGT</option>
                    <option value="HULT PRIZE">HULT PRIZE</option>
                    <option value="CLUB SPORT">CLUB SPORT</option>
                    <option value="AMBASSADEURS">AMBASSADEURS & ORIENTATION</option>
                    <option value="CONFERENCE">CONFÉRENCE & FORMATION</option>
                    <option value="AUTRE">Nouveau Club / Initiative Libre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                    Date prévisionnelle
                  </label>
                  <input
                    type="date"
                    value={formData.datePrevue}
                    onChange={(e) => setFormData({ ...formData, datePrevue: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#03594E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                    Nom & Prénom du porteur *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Votre nom complet"
                    value={formData.responsable}
                    onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#03594E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                    E-mail institutionnel (@uiz.ac.ma) *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="etudiant@uiz.ac.ma"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#03594E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                  Description succincte & Objectifs *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Décrivez l'impact attendu, le public cible (étudiants, lycéens, communauté) et le déroulement..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#03594E]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-stone-700 mb-1">
                  Besoins logistiques (Amphi, Sono, Vidéoprojecteur, etc.)
                </label>
                <input
                  type="text"
                  placeholder="Ex : Amphithéâtre A + micro HF"
                  value={formData.besoins}
                  onChange={(e) => setFormData({ ...formData, besoins: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#03594E]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-stone-200">
                <span className="text-[11px] text-stone-500 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[#FE8235]" />
                  Validation sous 48h ouvrées
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#03594E] hover:bg-[#024138] rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Soumettre l’idée
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
