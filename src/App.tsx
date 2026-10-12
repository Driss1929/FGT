import React, { useState, useEffect, useCallback, useRef } from 'react';
import './styles/pdfLayout.css';
import {
  Grouped11Page01Cover,
  Grouped11Page02Welcome,
  Grouped11Page03TaroudantFaculty,
  Grouped11Page04Programs,
  Grouped11Page05FirstStepsAccueil,
  Grouped11Page06DigitalServices,
  Grouped11Page07DemarchesReussite,
  Grouped11Page08SpecificNeeds,
  Grouped11Page09ClubsProjets,
  Grouped11Page10EventsCultureCareers,
  Grouped11Page11InternationalRightsContacts
} from './components/PDFGrouped11Pages';
import {
  GroupedPage01Cover,
  GroupedPage02Welcome,
  GroupedPage03TaroudantFaculty,
  GroupedPage04Programs,
  GroupedPage05FirstStepsAccueil,
  GroupedPage06DigitalServices,
  GroupedPage07DemarchesReussite,
  GroupedPage08SpecificNeeds,
  GroupedPage09ClubsProjets,
  GroupedPage10SemaineEvenementsUIZ,
  GroupedPage11CultureEmployabilite,
  GroupedPage12InternationalNewsletter,
  GroupedPage13DroitsFaq,
  GroupedPage14Contacts
} from './components/PDFGrouped14Pages';
import {
  PDFPage01,
  PDFPage02,
  PDFPage03,
  PDFPage04,
  PDFPage05,
  PDFPage06,
  PDFPage07,
  PDFPage08,
  PDFPage09,
  PDFPage10,
  PDFPage11,
  PDFPage12,
  PDFPage13,
  PDFPage14,
  PDFPage15,
  PDFPage16,
  PDFPage17,
  PDFPage18,
  PDFPage19,
  PDFPage20,
  PDFPage21,
  PDFPage22
} from './components/PDFPages';
import { ProgramModal } from './components/ProgramModal';
import { DemarcheModal } from './components/DemarcheModal';
import { ProjectProposalModal } from './components/ProjectProposalModal';
import { TableOfContentsDrawer } from './components/TableOfContentsDrawer';
import { FEGTOfficialLogo } from './components/OfficialLogo';
import {
  PROGRAMS,
  DEMARCHES_ITEMS,
  ProgramDetail,
  TABLE_OF_CONTENTS_11,
  TABLE_OF_CONTENTS_14,
  TABLE_OF_CONTENTS_22
} from './data/guideData';
import {
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Menu,
  X,
  ZoomIn,
  ZoomOut,
  Layers,
  BookOpen,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Clock,
  BookmarkCheck,
  Check,
  FileText,
  Printer,
  Sparkles,
  FileDown,
  ExternalLink,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

// Estimated reading time fallback per page in minutes
const BASE_READING_MINUTES: Record<number, number> = {
  1: 1,  // Couverture
  2: 2,  // Mot de bienvenue
  3: 3,  // Taroudant & FEGT
  4: 3,  // Formations & Filières
  5: 2.5,// Premiers pas & Accueil
  6: 3,  // Services numériques
  7: 3,  // Démarches & Réussite
  8: 2,  // Besoins spécifiques
  9: 3,  // Clubs & Projets
  10: 3, // Événements & Culture
  11: 3.5// International & Contacts
};

export default function App() {
  // Format mode: '11pages' (Official 11-page latest update 12.10) vs '14pages' (Standard grouped) vs '22pages' (Expanded 1 axe per page)
  const [guideFormat, setGuideFormat] = useState<'11pages' | '14pages' | '22pages'>('11pages');
  // View mode: 'single' (Livre interactif / feuilletage - par défaut) vs 'all' (Défilement continu)
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageTurnDirection, setPageTurnDirection] = useState<'next' | 'prev' | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  // Saved feedback notice
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  // Reading time remaining for the active section
  const [sectionReadingTimeRemaining, setSectionReadingTimeRemaining] = useState<string>('~2 min');
  const bookContainerRef = useRef<HTMLDivElement>(null);

  // Touch swipe support for interactive book mode
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Scroll listener for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // ignore
    }
  }, []);

  // Modals
  const [selectedProgram, setSelectedProgram] = useState<ProgramDetail | null>(null);
  const [selectedDemarche, setSelectedDemarche] = useState<{ title: string; desc: string; steps: string } | null>(null);
  const [isProposalOpen, setIsProposalOpen] = useState<boolean>(false);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);

  const totalPages = guideFormat === '11pages' ? 11 : guideFormat === '14pages' ? 14 : 22;
  const currentTOC = guideFormat === '11pages' ? TABLE_OF_CONTENTS_11 : guideFormat === '14pages' ? TABLE_OF_CONTENTS_14 : TABLE_OF_CONTENTS_22;
  const currentSection = currentTOC.find((item) => item.page === currentPage) || currentTOC[0];

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setPageTurnDirection('next');
      setCurrentPage((p) => p + 1);
      setTimeout(() => setPageTurnDirection(null), 500);
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setPageTurnDirection('prev');
      setCurrentPage((p) => p - 1);
      setTimeout(() => setPageTurnDirection(null), 500);
    }
  }, [currentPage]);

  const goToPage = useCallback((pageNum: number) => {
    const target = Math.min(totalPages, Math.max(1, pageNum));
    if (target > currentPage) {
      setPageTurnDirection('next');
    } else if (target < currentPage) {
      setPageTurnDirection('prev');
    }
    setCurrentPage(target);
    setTimeout(() => setPageTurnDirection(null), 500);
  }, [currentPage, totalPages]);

  // Handle Save function: Saves as PDF (via clean window.print() formatted for A4 official export)
  const [showSavePdfModal, setShowSavePdfModal] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Generate an offline, high-fidelity HTML/PDF document bundle that triggers download immediately
  const handleDownloadOfflineDocument = useCallback((scope: 'page' | 'full' = 'full') => {
    try {
      setIsExporting(true);
      setShowSavePdfModal(false);
      
      const fileName = scope === 'full' 
        ? `Guide_Etudiant_FEGT_Taroudant_2026-2027_Complet.html` 
        : `Guide_Etudiant_FEGT_Taroudant_2026-2027_Page_${currentPage}.html`;

      // Grab the active page or full pages
      let pageHtml = '';
      if (scope === 'full') {
        const pages = document.querySelectorAll('.pdf-page');
        pages.forEach((p) => {
          pageHtml += `<div class="pdf-page-container mb-8">${p.outerHTML}</div>`;
        });
      } else {
        const activePage = document.querySelector('.interactive-book-page .pdf-page') || document.querySelector('.pdf-page');
        if (activePage) {
          pageHtml = `<div class="pdf-page-container">${activePage.outerHTML}</div>`;
        }
      }

      if (!pageHtml) {
        throw new Error('Contenu introuvable');
      }

      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((node) => node.outerHTML)
        .join('\n');

      const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName.replace('.html', '')}</title>
  ${styles}
  <style>
    @page { size: A4 portrait; margin: 0; }
    body { background: #F8FAFC; color: #1F2432; padding: 20px; font-family: 'Plus Jakarta Sans', sans-serif; }
    .export-banner {
      background: #03594E; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 24px;
      display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .print-btn {
      background: #FE8235; color: white; border: none; padding: 10px 18px; border-radius: 8px;
      font-weight: bold; cursor: pointer; font-size: 13px;
    }
    @media print {
      .export-banner { display: none !important; }
      body { padding: 0 !important; background: white !important; }
      .pdf-page { width: 210mm !important; height: 297mm !important; margin: 0 !important; page-break-after: always !important; }
    }
  </style>
</head>
<body>
  <div class="export-banner">
    <div>
      <h2 style="margin:0; font-size: 16px;">Guide de la vie de l'étudiant 2026–2027 · FEGT Taroudant</h2>
      <p style="margin:4px 0 0; font-size: 12px; opacity: 0.9;">Document officiel prêt à imprimer ou à convertir en PDF (Ctrl+P / Cmd+P -> Enregistrer en PDF)</p>
    </div>
    <button class="print-btn" onclick="window.print()">Imprimer / Sauvegarder en PDF</button>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center;">
    ${pageHtml}
  </div>
  <script>
    // Proposer automatiquement l'impression au format PDF si ouvert directement
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 600);
    });
  </script>
</body>
</html>`;

      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSaveSuccessNotice(`Fichier téléchargeable généré avec succès ! Le document s'ouvre avec l'option d'impression A4.`);
      setIsExporting(false);
      setTimeout(() => setSaveSuccessNotice(null), 6000);
    } catch {
      setIsExporting(false);
      handleSaveAsPdf(scope);
    }
  }, [currentPage]);

  const handleSaveAsPdf = useCallback((scope: 'page' | 'full' = 'full') => {
    try {
      setShowSavePdfModal(false);
      setSaveSuccessNotice(
        scope === 'full' 
          ? `Lancement de la boîte de dialogue d'enregistrement PDF (${totalPages} pages A4)...` 
          : `Lancement de la boîte de dialogue d'enregistrement PDF (Page ${currentPage})...`
      );

      // Si l'utilisateur veut tout le guide alors qu'il est en mode livre interactif (single page),
      // nous basculons temporairement l'affichage en continu pour capturer l'ensemble des planches
      const prevMode = viewMode;
      if (scope === 'full' && viewMode === 'single') {
        setViewMode('all');
      }

      // Laisser le DOM se rafraîchir avant le déclenchement de window.print()
      setTimeout(() => {
        try {
          window.print();
        } catch (printErr) {
          console.warn('window.print call failed:', printErr);
        }

        if (scope === 'full' && prevMode === 'single') {
          // Revenir au mode livre interactif après impression
          setTimeout(() => {
            setViewMode('single');
          }, 1000);
        }
      }, 400);

      setTimeout(() => setSaveSuccessNotice(null), 6000);
    } catch {
      window.print();
    }
  }, [totalPages, currentPage, viewMode]);

  const handleSaveGuide = useCallback(() => {
    // Ouvrir le dialogue de choix d'enregistrement PDF
    setShowSavePdfModal(true);
  }, []);

  // Track scroll progress & section reading time remaining in 'all' view mode
  useEffect(() => {
    if (viewMode !== 'all') {
      setScrollProgress(((currentPage) / totalPages) * 100);
      return;
    }

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) {
        setScrollProgress(100);
        return;
      }
      const scrolled = window.scrollY;
      const pct = Math.min(100, Math.max(0, (scrolled / scrollHeight) * 100));
      setScrollProgress(pct);

      // Detect which page is currently closest to the reading view
      const pages = document.querySelectorAll('.pdf-page');
      let activeIdx = 1;
      const referenceLine = window.innerHeight * 0.4;
      pages.forEach((p, idx) => {
        const rect = p.getBoundingClientRect();
        if (rect.top <= referenceLine) {
          activeIdx = idx + 1;
        }
      });
      const boundedIdx = Math.min(totalPages, Math.max(1, activeIdx));
      setCurrentPage(boundedIdx);

      // Dynamically compute remaining reading time for the active section
      const activeEl = pages[boundedIdx - 1];
      if (activeEl) {
        const text = (activeEl as HTMLElement).innerText || '';
        const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
        // 200 words/min average reading pace
        const totalMinutes = wordCount > 35 
          ? Math.max(1, wordCount / 200) 
          : (BASE_READING_MINUTES[boundedIdx] || 2);
        
        const rect = activeEl.getBoundingClientRect();
        const elTop = rect.top;
        const elHeight = rect.height;
        // Fraction read through this section
        const readFraction = elHeight > 0 
          ? Math.min(1, Math.max(0, (referenceLine - elTop) / elHeight))
          : 0;
        
        const remainingMinutes = Math.max(0, totalMinutes * (1 - readFraction));
        
        if (readFraction >= 0.92 || remainingMinutes < 0.35) {
          setSectionReadingTimeRemaining('< 1 min');
        } else if (remainingMinutes < 1) {
          setSectionReadingTimeRemaining('~1 min');
        } else {
          setSectionReadingTimeRemaining(`~${Math.round(remainingMinutes)} min`);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode, totalPages, guideFormat]);

  // Update section reading time in 'single' feuilletoir mode
  useEffect(() => {
    if (viewMode === 'single') {
      const pageEl = document.querySelector('.pdf-page');
      let totalMinutes = BASE_READING_MINUTES[currentPage] || 2;
      if (pageEl) {
        const text = (pageEl as HTMLElement).innerText || '';
        const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount > 35) {
          totalMinutes = Math.max(1, Math.round(wordCount / 200));
        }
      }
      setSectionReadingTimeRemaining(`~${totalMinutes} min`);
    }
  }, [currentPage, viewMode, guideFormat]);

  // Keep currentPage in valid range when switching formats
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [guideFormat, totalPages, currentPage]);

  const activeProgress = viewMode === 'single'
    ? ((currentPage) / totalPages) * 100
    : scrollProgress;

  // Keyboard navigation for single page interactive book mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isProposalOpen || selectedProgram || selectedDemarche || isTocOpen) return;
      if (viewMode === 'single') {
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
          goToNextPage();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          goToPrevPage();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, totalPages, isProposalOpen, selectedProgram, selectedDemarche, isTocOpen, goToNextPage, goToPrevPage]);

  // Touch swipe support for interactive book page turning
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Only swipe if horizontal move is significant and larger than vertical move
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        goToNextPage();
      } else {
        goToPrevPage();
      }
    }
  };

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleSelectProgramCode = (code: string) => {
    const prog = PROGRAMS.find((p) => p.code.toLowerCase() === code.toLowerCase());
    if (prog) setSelectedProgram(prog);
  };

  const handleOpenAction = (actionTitle: string) => {
    const item = DEMARCHES_ITEMS.find((d) =>
      actionTitle.toLowerCase().includes(d.title.toLowerCase().slice(0, 10))
    ) || {
      title: actionTitle,
      desc: 'Démarche administrative officielle auprès du service de scolarité de la Faculté.',
      steps: 'Connectez-vous à MyUIZ ou présentez-vous au guichet de scolarité muni de votre carte d’étudiant.'
    };
    setSelectedDemarche(item);
  };

  const renderSingle11Page = (num: number) => {
    switch (num) {
      case 1:
        return <Grouped11Page01Cover />;
      case 2:
        return <Grouped11Page02Welcome />;
      case 3:
        return <Grouped11Page03TaroudantFaculty />;
      case 4:
        return <Grouped11Page04Programs onSelectProgram={handleSelectProgramCode} />;
      case 5:
        return <Grouped11Page05FirstStepsAccueil />;
      case 6:
        return <Grouped11Page06DigitalServices />;
      case 7:
        return <Grouped11Page07DemarchesReussite onOpenAction={handleOpenAction} />;
      case 8:
        return <Grouped11Page08SpecificNeeds />;
      case 9:
        return <Grouped11Page09ClubsProjets onOpenProposalModal={() => setIsProposalOpen(true)} />;
      case 10:
        return <Grouped11Page10EventsCultureCareers />;
      case 11:
        return <Grouped11Page11InternationalRightsContacts />;
      default:
        return <Grouped11Page01Cover />;
    }
  };

  const renderSingle14Page = (num: number) => {
    switch (num) {
      case 1:
        return <GroupedPage01Cover />;
      case 2:
        return <GroupedPage02Welcome />;
      case 3:
        return <GroupedPage03TaroudantFaculty />;
      case 4:
        return <GroupedPage04Programs onSelectProgram={handleSelectProgramCode} />;
      case 5:
        return <GroupedPage05FirstStepsAccueil />;
      case 6:
        return <GroupedPage06DigitalServices />;
      case 7:
        return <GroupedPage07DemarchesReussite onOpenAction={handleOpenAction} />;
      case 8:
        return <GroupedPage08SpecificNeeds />;
      case 9:
        return <GroupedPage09ClubsProjets onOpenProposalModal={() => setIsProposalOpen(true)} />;
      case 10:
        return <GroupedPage10SemaineEvenementsUIZ />;
      case 11:
        return <GroupedPage11CultureEmployabilite />;
      case 12:
        return <GroupedPage12InternationalNewsletter />;
      case 13:
        return <GroupedPage13DroitsFaq />;
      case 14:
        return <GroupedPage14Contacts />;
      default:
        return <GroupedPage01Cover />;
    }
  };

  const renderSingle22Page = (num: number) => {
    switch (num) {
      case 1:
        return <PDFPage01 />;
      case 2:
        return <PDFPage02 />;
      case 3:
        return <PDFPage03 />;
      case 4:
        return <PDFPage04 />;
      case 5:
        return <PDFPage05 onSelectProgram={handleSelectProgramCode} />;
      case 6:
        return <PDFPage06 />;
      case 7:
        return <PDFPage07 />;
      case 8:
        return <PDFPage08 />;
      case 9:
        return <PDFPage09 onOpenAction={handleOpenAction} />;
      case 10:
        return <PDFPage10 />;
      case 11:
        return <PDFPage11 />;
      case 12:
        return <PDFPage12 />;
      case 13:
        return <PDFPage13 onOpenProposalModal={() => setIsProposalOpen(true)} />;
      case 14:
        return <PDFPage14 />;
      case 15:
        return <PDFPage15 />;
      case 16:
        return <PDFPage16 />;
      case 17:
        return <PDFPage17 />;
      case 18:
        return <PDFPage18 />;
      case 19:
        return <PDFPage19 />;
      case 20:
        return <PDFPage20 />;
      case 21:
        return <PDFPage21 />;
      case 22:
        return <PDFPage22 />;
      default:
        return <PDFPage01 />;
    }
  };

  return (
    <div className="pdf-viewer-root">
      {/* Top Floating Control Bar (Hidden on print) */}
      <header className="sticky top-0 z-50 bg-[#03594E] text-white shadow-lg border-b border-[#024138] print:hidden">
        {/* DESKTOP HEADER (MD & UP): FULL RICH TOOLBAR PRESERVED */}
        <div className="hidden md:block px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* Logo & Document Title */}
            <div className="flex items-center gap-3">
              <FEGTOfficialLogo variant="boxed" size="sm" className="!px-2 !py-1 !rounded-lg" />
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base sm:text-lg tracking-wide text-white">
                  FEGT · Guide de la Vie de l’Étudiant
                </span>
                <span className="text-[10px] font-mono bg-[#CD935A]/30 text-[#f5d5b1] px-2 py-0.5 rounded border border-[#CD935A]/40">
                  2026–2027
                </span>
              </div>
              {/* Reading position & section reading time remaining badges */}
              <div className="hidden lg:flex items-center gap-2">
                <span 
                  className="inline-flex items-center text-[10px] font-mono font-bold text-[#F8C62F] bg-black/25 px-2 py-0.5 rounded border border-white/10"
                  title={`Page ${currentPage} sur ${totalPages} (${Math.round(activeProgress)}%)`}
                >
                  Page {currentPage < 10 ? `0${currentPage}` : currentPage} / {totalPages} · {Math.round(activeProgress)}%
                </span>
                <span 
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-100 bg-black/25 px-2 py-0.5 rounded border border-emerald-500/30 transition-all select-none"
                  title={`Temps de lecture estimé restant pour cette section (${currentSection?.title || ''}) : ${sectionReadingTimeRemaining}`}
                >
                  <Clock className="w-3 h-3 text-[#F8C62F] shrink-0" />
                  <span className="text-stone-300 font-sans hidden xl:inline">Section :</span>
                  <span className="text-[#F8C62F] font-bold">{sectionReadingTimeRemaining}</span>
                  <span className="text-stone-400 font-sans hidden xl:inline">restant</span>
                </span>
              </div>
            </div>

            {/* Guide Format Switcher (Mise en page) */}
            <div className="flex items-center gap-1 bg-[#024138] p-1 rounded-xl text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-300 px-2 hidden lg:inline">
                Mise en page :
              </span>
              <button
                onClick={() => {
                  setGuideFormat('11pages');
                  if (currentPage > 11) setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all font-sans flex items-center gap-1.5 ${
                  guideFormat === '11pages'
                    ? 'bg-[#FE8235] text-white font-bold shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="11 Pages officielles - Dernière mise à jour 12.10"
              >
                <span>11 Pages (Mise à jour 12.10)</span>
                {guideFormat === '11pages' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setGuideFormat('14pages');
                  if (currentPage > 14) setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all font-sans flex items-center gap-1.5 ${
                  guideFormat === '14pages'
                    ? 'bg-[#FE8235] text-white font-bold shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="14 Pages officielles avec chaque titre d'axe distinct"
              >
                <span>14 Pages (PDF Regroupé)</span>
                {guideFormat === '14pages' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setGuideFormat('22pages')}
                className={`px-3 py-1.5 rounded-lg transition-all font-sans flex items-center gap-1.5 ${
                  guideFormat === '22pages'
                    ? 'bg-[#FE8235] text-white font-bold shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="22 Pages développées (1 page par axe)"
              >
                <span>22 Pages (1 Axe / Page)</span>
                {guideFormat === '22pages' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Interactive Book & Page Controls */}
            <div className="flex items-center gap-2 bg-[#024138] px-2 py-1 rounded-xl text-xs">
              <div className="flex bg-black/20 p-0.5 rounded-lg">
                <button
                  onClick={() => setViewMode('single')}
                  className={`px-3 py-1 rounded-md transition-all font-sans flex items-center gap-1.5 ${
                    viewMode === 'single'
                      ? 'bg-white text-[#03594E] font-bold shadow'
                      : 'text-stone-300 hover:text-white'
                  }`}
                  title="Consulter sous forme de livre interactif avec feuilletage"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#FE8235]" />
                  <span>Livre interactif</span>
                </button>
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-2.5 py-1 rounded-md transition-all font-sans ${
                    viewMode === 'all'
                      ? 'bg-white text-[#03594E] font-bold shadow'
                      : 'text-stone-300 hover:text-white'
                  }`}
                  title="Toutes les pages défilables en continu"
                >
                  Défilement
                </button>
              </div>

              {viewMode === 'single' && (
                <div className="flex items-center gap-1 border-l border-white/20 pl-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage <= 1}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
                    title="Page précédente (flèche gauche ou clic)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <select
                    value={currentPage}
                    onChange={(e) => goToPage(Number(e.target.value))}
                    className="bg-transparent text-white font-mono text-xs font-bold px-1 py-0.5 rounded border border-white/20 cursor-pointer"
                  >
                    {currentTOC.map((item) => (
                      <option key={item.page} value={item.page} className="text-stone-900">
                        Page {item.page < 10 ? `0${item.page}` : item.page}
                      </option>
                    ))}
                  </select>
                  <span className="text-stone-300 text-xs font-mono">/ {totalPages}</span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage >= totalPages}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
                    title="Page suivante (flèche droite ou espace)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Zoom Controls */}
              <div className="hidden xl:flex items-center gap-1 border-l border-white/20 pl-2 text-stone-300">
                <button
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
                  className="p-1 hover:text-white rounded"
                  title="Zoom arrière"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(1.3, z + 0.1))}
                  className="p-1 hover:text-white rounded"
                  title="Zoom avant"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="text-[10px] px-1.5 py-0.5 rounded hover:bg-white/10 text-stone-200"
                >
                  100%
                </button>
              </div>
            </div>

            {/* Actions: Enregistrer, Sommaire, Plein écran */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTocOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#F8C62F]" />
                <span className="hidden sm:inline">Sommaire</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-all"
                title={isFullscreen ? "Quitter le plein écran" : "Passer en mode plein écran"}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-[#F8C62F]" />
                    <span className="hidden sm:inline">Réduire</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-[#F8C62F]" />
                    <span className="hidden sm:inline">Plein écran</span>
                  </>
                )}
              </button>

              {/* Bouton ENREGISTRER SOUS FORME DE PDF */}
              <button
                onClick={handleSaveGuide}
                className="px-3.5 py-1.5 rounded-lg bg-[#FE8235] hover:bg-[#e47127] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                title="Enregistrer sous forme de PDF sur votre appareil"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Enregistrer (PDF)</span>
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE HEADER (< MD): ULTRA COMPACT, HEIGHT ~52px, ZERO HORIZONTAL OVERFLOW */}
        <div className="flex md:hidden items-center justify-between px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top,0px))]">
          {/* Logo & Brand title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FEGTOfficialLogo variant="boxed" size="sm" className="!px-1.5 !py-0.5 !rounded-lg shrink-0" />
            <div className="min-w-0 flex flex-col">
              <span className="font-serif font-bold text-sm tracking-wide text-white truncate leading-tight">
                FEGT · Guide Étudiant
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-mono bg-[#CD935A]/30 text-[#f5d5b1] px-1 py-0.2 rounded border border-[#CD935A]/40 shrink-0">
                  2026–2027
                </span>
                <span className="text-[10px] font-mono font-bold text-[#F8C62F] truncate">
                  P. {currentPage < 10 ? `0${currentPage}` : currentPage}/{totalPages}
                </span>
                <span 
                  className="inline-flex items-center gap-0.5 text-[9.5px] font-mono text-emerald-200 bg-black/25 px-1.5 py-0.2 rounded border border-white/10 shrink-0"
                  title={`Temps restant dans cette section : ${sectionReadingTimeRemaining}`}
                >
                  <Clock className="w-2.5 h-2.5 text-[#F8C62F] shrink-0" />
                  <span>{sectionReadingTimeRemaining}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick action buttons on mobile */}
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              onClick={handleSaveGuide}
              className="min-h-[40px] px-2.5 flex items-center justify-center gap-1 rounded-xl bg-[#FE8235] text-white font-bold text-xs shadow transition-colors"
              aria-label="Enregistrer le guide sous forme de PDF"
              title="Enregistrer en PDF"
            >
              <Download className="w-4 h-4" />
              <span className="text-[11px] font-bold">PDF</span>
            </button>
            <button
              onClick={() => setIsTocOpen(true)}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-[#F8C62F] transition-colors"
              aria-label="Ouvrir le sommaire"
              title="Sommaire"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white transition-colors"
              aria-label="Ouvrir les options et formats du guide"
              title="Mise en page & Options"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Fine barre de progression horizontale (Page actuelle / Total) */}
        <div 
          className="w-full h-[3.5px] bg-[#012f27] relative overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(activeProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          title={`Progression globale : ${Math.round(activeProgress)}% · Section en cours : ${currentSection?.title || ''} (${sectionReadingTimeRemaining} restant)`}
        >
          <div
            className="h-full bg-gradient-to-r from-[#F8C62F] via-[#FE8235] to-[#FF7020] transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(254,130,53,0.9)]"
            style={{ width: `${Math.max(1, activeProgress)}%` }}
          />
        </div>

        {/* Toast confirmation d'enregistrement */}
        {saveSuccessNotice && (
          <div className="bg-[#023831] border-b border-[#FE8235] text-white px-4 py-2 text-xs font-medium flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top duration-200">
            <BookmarkCheck className="w-4 h-4 text-[#FE8235]" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}
      </header>

      {/* Main Pages Canvas Container */}
      <main className="w-full flex flex-col items-center justify-start">
        {/* VIEW MODE: ALL PAGES (DÉFILEMENT CONTINU) */}
        {viewMode === 'all' && (
          <div
            className="w-full flex flex-col items-center transition-transform origin-top"
            style={{
              transform: zoom !== 1 ? `scale(${zoom})` : undefined,
              marginBottom: zoom > 1 ? `${(zoom - 1) * (totalPages * 300)}px` : undefined
            }}
          >
            {guideFormat === '11pages' ? (
              <>
                <Grouped11Page01Cover />
                <Grouped11Page02Welcome />
                <Grouped11Page03TaroudantFaculty />
                <Grouped11Page04Programs onSelectProgram={handleSelectProgramCode} />
                <Grouped11Page05FirstStepsAccueil />
                <Grouped11Page06DigitalServices />
                <Grouped11Page07DemarchesReussite onOpenAction={handleOpenAction} />
                <Grouped11Page08SpecificNeeds />
                <Grouped11Page09ClubsProjets onOpenProposalModal={() => setIsProposalOpen(true)} />
                <Grouped11Page10EventsCultureCareers />
                <Grouped11Page11InternationalRightsContacts />
              </>
            ) : guideFormat === '14pages' ? (
              <>
                <GroupedPage01Cover />
                <GroupedPage02Welcome />
                <GroupedPage03TaroudantFaculty />
                <GroupedPage04Programs onSelectProgram={handleSelectProgramCode} />
                <GroupedPage05FirstStepsAccueil />
                <GroupedPage06DigitalServices />
                <GroupedPage07DemarchesReussite onOpenAction={handleOpenAction} />
                <GroupedPage08SpecificNeeds />
                <GroupedPage09ClubsProjets onOpenProposalModal={() => setIsProposalOpen(true)} />
                <GroupedPage10SemaineEvenementsUIZ />
                <GroupedPage11CultureEmployabilite />
                <GroupedPage12InternationalNewsletter />
                <GroupedPage13DroitsFaq />
                <GroupedPage14Contacts />
              </>
            ) : (
              <>
                <PDFPage01 />
                <PDFPage02 />
                <PDFPage03 />
                <PDFPage04 />
                <PDFPage05 onSelectProgram={handleSelectProgramCode} />
                <PDFPage06 />
                <PDFPage07 />
                <PDFPage08 />
                <PDFPage09 onOpenAction={handleOpenAction} />
                <PDFPage10 />
                <PDFPage11 />
                <PDFPage12 />
                <PDFPage13 onOpenProposalModal={() => setIsProposalOpen(true)} />
                <PDFPage14 />
                <PDFPage15 />
                <PDFPage16 />
                <PDFPage17 />
                <PDFPage18 />
                <PDFPage19 />
                <PDFPage20 />
                <PDFPage21 />
                <PDFPage22 />
              </>
            )}
          </div>
        )}

        {/* VIEW MODE: LIVRE INTERACTIF (FEUILLETAGE AVEC RELIURE 3D RÉALISTE) */}
        {viewMode === 'single' && (
          <div
            ref={bookContainerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full flex flex-col items-center py-3 sm:py-6 select-none"
          >
            {/* Stage du livre interactif */}
            <div className="interactive-book-stage">
              {/* Flèche latérale gauche de feuilletage */}
              <button
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                className="hidden xl:flex absolute left-2 lg:left-0 z-30 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-[#03594E] shadow-2xl items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-20 disabled:pointer-events-none border border-stone-200 print:hidden"
                aria-label="Feuilleter vers la page précédente"
                title="Page précédente (flèche gauche)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Couverture / Reliure du Livre interactif */}
              <div
                className="interactive-book-cover origin-top"
                style={{
                  transform: zoom !== 1 ? `scale(${zoom})` : undefined,
                  marginBottom: zoom > 1 ? `${(zoom - 1) * 320}px` : undefined
                }}
              >
                {/* Ligne de reliure centrale dorée */}
                <div className="interactive-book-spine-line print:hidden" />

                {/* Signet ruban interactif (permet d'enregistrer la page) */}
                <button
                  onClick={handleSaveGuide}
                  className="book-ribbon-marker print:hidden"
                  title="Enregistrer / Exporter cette page en PDF"
                  aria-label="Enregistrer cette page"
                />

                {/* Coin rabattable bas-droit (effet corne de page pour tourner) */}
                {currentPage < totalPages && (
                  <div
                    onClick={goToNextPage}
                    className="book-page-curl print:hidden"
                    title="Tourner vers la page suivante"
                    aria-label="Page suivante"
                  />
                )}

                {/* Coin rabattable bas-gauche */}
                {currentPage > 1 && (
                  <div
                    onClick={goToPrevPage}
                    className="book-page-curl-left print:hidden"
                    title="Tourner vers la page précédente"
                    aria-label="Page précédente"
                  />
                )}

                {/* Planche de lecture active avec animation de tourne-page */}
                <div
                  key={currentPage}
                  className={`interactive-book-page ${
                    pageTurnDirection === 'next'
                      ? 'turn-next'
                      : pageTurnDirection === 'prev'
                      ? 'turn-prev'
                      : ''
                  }`}
                >
                  {guideFormat === '11pages'
                    ? renderSingle11Page(currentPage)
                    : guideFormat === '14pages'
                    ? renderSingle14Page(currentPage)
                    : renderSingle22Page(currentPage)}
                </div>
              </div>

              {/* Flèche latérale droite de feuilletage */}
              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className="hidden xl:flex absolute right-2 lg:right-0 z-30 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-[#03594E] shadow-2xl items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-20 disabled:pointer-events-none border border-stone-200 print:hidden"
                aria-label="Feuilleter vers la page suivante"
                title="Page suivante (flèche droite ou espace)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Barre de navigation interactive sous le livre (Planches & Saut direct) */}
            <div className="w-full max-w-4xl mt-5 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-stone-300 shadow-sm text-xs font-mono">
                <span className="text-[#03594E] font-bold">Livre interactif :</span>
                <span className="text-[#FE8235] font-bold">Page {currentPage < 10 ? `0${currentPage}` : currentPage}</span>
                <span className="text-stone-400">/ {totalPages}</span>
                <span className="text-stone-300">·</span>
                <span className="text-stone-600 font-sans truncate max-w-[200px] sm:max-w-xs">
                  {currentSection?.title || 'Guide FEGT'}
                </span>
              </div>

              {/* Sélecteur miniature de planches du livre */}
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur p-1.5 rounded-xl border border-stone-300 shadow-sm overflow-x-auto max-w-full">
                <span className="text-[10px] font-mono font-bold uppercase text-[#03594E] shrink-0 px-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#FE8235]" />
                  Planche :
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => goToPage(i + 1)}
                      className={`min-w-[34px] min-h-[34px] px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center ${
                        currentPage === i + 1
                          ? 'bg-[#03594E] text-white shadow scale-105'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900'
                      }`}
                      title={`Aller à la page ${i + 1}`}
                    >
                      {i + 1 < 10 ? `0${i + 1}` : i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MOBILE FLOATING ACTION BAR FOR LIVRE INTERACTIF MODE */}
      {viewMode === 'single' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#03594E]/95 backdrop-blur-md border-t border-[#024138] px-3 py-2 flex items-center justify-between shadow-2xl pb-[max(0.6rem,env(safe-area-inset-bottom,0px))] print:hidden">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="min-h-[44px] px-3.5 rounded-xl bg-white/10 active:bg-white/20 text-white font-medium text-xs flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Planche précédente"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Préc.</span>
          </button>

          <button
            onClick={() => setIsTocOpen(true)}
            className="min-h-[44px] px-3 rounded-xl bg-black/20 text-white font-mono text-xs font-bold flex items-center gap-1.5 border border-white/10"
            title={`Ouvrir le sommaire — Section : ${currentSection?.title || ''} (${sectionReadingTimeRemaining} restant)`}
          >
            <span className="text-[#F8C62F]">Page {currentPage < 10 ? `0${currentPage}` : currentPage}</span>
            <span className="text-stone-300">/ {totalPages}</span>
            <span className="text-white/30">·</span>
            <span className="text-emerald-200 text-[10.5px] font-normal flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#F8C62F]" />
              {sectionReadingTimeRemaining}
            </span>
          </button>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className="min-h-[44px] px-3.5 rounded-xl bg-[#FE8235] active:bg-[#e47127] text-white font-bold text-xs flex items-center gap-1 shadow-md disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Planche suivante"
          >
            <span>Suiv.</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MOBILE FLOATING BACK TO TOP & QUICK JUMP IN SCROLL MODE */}
      {viewMode === 'all' && (
        <div className="md:hidden fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 pb-[env(safe-area-inset-bottom,0px)] print:hidden">
          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full bg-[#03594E] text-[#F8C62F] shadow-xl flex items-center justify-center border border-white/20 active:scale-95 transition-all"
              aria-label="Retour en haut de page"
              title="Haut de page"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
          )}
          <button
            onClick={() => setIsTocOpen(true)}
            className="min-h-[38px] px-3 rounded-full bg-[#03594E]/90 text-white text-[11px] font-mono font-bold shadow-lg flex items-center gap-1.5 border border-white/20 backdrop-blur"
            title={`Ouvrir le sommaire — Section : ${currentSection?.title || ''} (${sectionReadingTimeRemaining} restant)`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#F8C62F]" />
            <span>P. {currentPage < 10 ? `0${currentPage}` : currentPage}/{totalPages}</span>
            <span className="text-white/40">·</span>
            <span className="text-emerald-200 flex items-center gap-1 font-normal text-[10px]">
              <Clock className="w-3 h-3 text-[#F8C62F]" />
              {sectionReadingTimeRemaining}
            </span>
          </button>
        </div>
      )}

      {/* MOBILE MENU DRAWER (OPTIONS & FORMATS) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:hidden md:hidden">
          <div
            className="w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="bg-[#03594E] text-white p-4 flex items-center justify-between pt-[max(1rem,env(safe-area-inset-top,0px))]">
              <div className="flex items-center gap-2">
                <FEGTOfficialLogo variant="boxed" size="sm" className="!px-1.5 !py-0.5 !rounded-lg" />
                <div>
                  <h3 className="font-serif font-bold text-base leading-tight">Options du Guide</h3>
                  <span className="text-[11px] text-emerald-200/90 font-mono">Édition 2026–2027</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 space-y-4 flex-1 text-stone-800">
              {/* Active Section & Remaining Reading Time Indicator */}
              <div className="bg-[#03594E]/5 border border-[#03594E]/20 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#FE8235] block truncate">
                    {currentSection?.kicker || 'Section en cours'}
                  </span>
                  <span className="font-serif font-bold text-[#03594E] block truncate text-xs">
                    {currentSection?.title || 'Section'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono bg-[#03594E] text-white px-2 py-1 rounded-lg shrink-0 border border-white/10" title="Temps de lecture estimé restant">
                  <Clock className="w-3 h-3 text-[#F8C62F] shrink-0" />
                  <span className="font-bold text-[#F8C62F]">{sectionReadingTimeRemaining}</span>
                </div>
              </div>
              {/* Format selection */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#FE8235] font-bold block mb-2">
                  Format de mise en page :
                </span>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setGuideFormat('11pages');
                      if (currentPage > 11) setCurrentPage(1);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-all border flex items-center justify-between min-h-[48px] ${
                      guideFormat === '11pages'
                        ? 'bg-[#03594E]/10 border-[#03594E] text-[#03594E] font-bold'
                        : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>11 Pages (Mise à jour 12.10)</span>
                        <span className="text-[9px] font-mono bg-[#FE8235] text-white px-1.5 py-0.2 rounded font-bold">
                          Officiel
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-normal mt-0.5">
                        Dernière mise à jour 12.10 du guide
                      </p>
                    </div>
                    {guideFormat === '11pages' && <CheckCircle2 className="w-4 h-4 text-[#03594E] shrink-0" />}
                  </button>

                  <button
                    onClick={() => {
                      setGuideFormat('14pages');
                      if (currentPage > 14) setCurrentPage(1);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-all border flex items-center justify-between min-h-[48px] ${
                      guideFormat === '14pages'
                        ? 'bg-[#03594E]/10 border-[#03594E] text-[#03594E] font-bold'
                        : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">14 Pages (PDF Regroupé)</div>
                      <p className="text-[11px] text-stone-500 font-normal mt-0.5">
                        Avec titres d’axes distincts
                      </p>
                    </div>
                    {guideFormat === '14pages' && <CheckCircle2 className="w-4 h-4 text-[#03594E] shrink-0" />}
                  </button>

                  <button
                    onClick={() => {
                      setGuideFormat('22pages');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-all border flex items-center justify-between min-h-[48px] ${
                      guideFormat === '22pages'
                        ? 'bg-[#03594E]/10 border-[#03594E] text-[#03594E] font-bold'
                        : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">22 Pages (1 Axe / Page)</div>
                      <p className="text-[11px] text-stone-500 font-normal mt-0.5">
                        Format détaillé complet
                      </p>
                    </div>
                    {guideFormat === '22pages' && <CheckCircle2 className="w-4 h-4 text-[#03594E] shrink-0" />}
                  </button>
                </div>
              </div>

              {/* View mode selection */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#03594E] font-bold block mb-2">
                  Mode de lecture :
                </span>
                <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-xl">
                  <button
                    onClick={() => {
                      setViewMode('single');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
                      viewMode === 'single'
                        ? 'bg-[#03594E] text-white font-bold shadow'
                        : 'text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#FE8235]" />
                    <span>Livre interactif</span>
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('all');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all min-h-[44px] flex items-center justify-center ${
                      viewMode === 'all'
                        ? 'bg-[#03594E] text-white font-bold shadow'
                        : 'text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Défilement
                  </button>
                </div>
              </div>

              {/* Quick Action Tools */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block mb-2">
                  Actions du guide :
                </span>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSaveGuide();
                    }}
                    className="w-full min-h-[44px] px-4 py-2.5 bg-[#FE8235] hover:bg-[#e47127] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>Enregistrer le guide en PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsTocOpen(true);
                    }}
                    className="w-full min-h-[44px] px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 text-[#F8C62F]" />
                    <span>Ouvrir le Sommaire ({totalPages} planches)</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      toggleFullscreen();
                    }}
                    className="w-full min-h-[44px] px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="w-4 h-4 text-[#03594E]" />
                        <span>Quitter le plein écran</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4 text-[#03594E]" />
                        <span>Passer en plein écran</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 text-center pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
              <p className="text-xs text-stone-600 font-serif">
                Faculté d’Économie et de Gestion de Taroudant
              </p>
              <span className="text-[10px] text-stone-400 font-mono">
                Université Ibn Zohr · Guide 2026–2027
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ENREGISTRER SOUS FORME DE PDF */}
      {showSavePdfModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150 print:hidden"
          onClick={() => setShowSavePdfModal(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#03594E] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#FE8235]">
                  <FileDown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg leading-tight">Enregistrer en PDF</h3>
                  <p className="text-xs text-stone-200 font-sans">
                    Guide Officiel FEGT Taroudant · 2026–2027
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSavePdfModal(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-stone-800">
              {/* Important clarification banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5">
                <FileText className="w-5 h-5 text-[#03594E] shrink-0 mt-0.5" />
                <div className="text-xs text-[#03594E] leading-relaxed font-sans space-y-1">
                  <p className="font-semibold text-stone-900">
                    Comment obtenir le fichier PDF :
                  </p>
                  <p>
                    1. Cliquez sur <strong>« Boîte de dialogue PDF (A4) »</strong> ci-dessous.
                  </p>
                  <p>
                    2. Dans la fenêtre d'impression de votre navigateur, choisissez comme Destination : <span className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold text-emerald-800 border border-emerald-300">« Enregistrer au format PDF »</span>.
                  </p>
                  <p className="text-[11px] text-stone-600">
                    💡 Si vous êtes dans un aperçu restreint où l'impression directe est bloquée, utilisez le bouton <strong>« Télécharger le document prêt à imprimer »</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {/* Method 1: Dialog window.print to PDF */}
                <button
                  onClick={() => handleSaveAsPdf('full')}
                  className="w-full p-4 rounded-xl border-2 border-[#03594E] hover:bg-[#03594E]/5 active:scale-[0.99] transition-all text-left flex items-center justify-between group cursor-pointer shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#03594E]">
                        1. Enregistrer tout le guide en PDF (A4)
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-[#FE8235] text-white px-2 py-0.5 rounded-full">
                        {totalPages} pages
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">
                      Ouvre la boîte de dialogue système avec mise en page A4 officielle, sans barres ni menus.
                    </p>
                  </div>
                  <Printer className="w-5 h-5 text-[#03594E] group-hover:scale-110 transition-transform shrink-0 ml-3" />
                </button>

                {/* Method 2: Single page dialog */}
                <button
                  onClick={() => handleSaveAsPdf('page')}
                  className="w-full p-3.5 rounded-xl border border-stone-300 hover:border-[#03594E] hover:bg-stone-50 active:scale-[0.99] transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-800 group-hover:text-[#03594E]">
                        Enregistrer uniquement la page active en PDF
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full">
                        Page {currentPage < 10 ? `0${currentPage}` : currentPage}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Génère le PDF de la planche actuellement à l'écran ({currentSection?.title || 'Section'}).
                    </p>
                  </div>
                  <FileText className="w-4 h-4 text-stone-400 group-hover:text-[#03594E] group-hover:scale-110 transition-transform shrink-0 ml-3" />
                </button>

                {/* Method 3: Instant offline download bundle */}
                <button
                  onClick={() => handleDownloadOfflineDocument('full')}
                  disabled={isExporting}
                  className="w-full p-3.5 rounded-xl border border-dashed border-[#FE8235] bg-orange-50/50 hover:bg-orange-50 active:scale-[0.99] transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#c65511]">
                        Télécharger le fichier document prêt à imprimer (.html / PDF)
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-[#FE8235]/20 text-[#c65511] px-1.5 py-0.5 rounded">
                        Secours
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      Télécharge un fichier autonome avec styles complets, que vous pouvez ouvrir et imprimer en PDF n'importe quand.
                    </p>
                  </div>
                  <Download className="w-4 h-4 text-[#FE8235] group-hover:translate-y-0.5 transition-transform shrink-0 ml-3" />
                </button>
              </div>

              <div className="pt-2 text-[11px] text-stone-400 font-mono text-center flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FE8235]" />
                <span>Format A4 standardisé · Faculté d'Économie et de Gestion de Taroudant</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <ProgramModal program={selectedProgram} onClose={() => setSelectedProgram(null)} />
      <DemarcheModal item={selectedDemarche} onClose={() => setSelectedDemarche(null)} />
      <ProjectProposalModal isOpen={isProposalOpen} onClose={() => setIsProposalOpen(false)} />
      <TableOfContentsDrawer
        isOpen={isTocOpen}
        currentPage={currentPage}
        currentSectionRemaining={sectionReadingTimeRemaining}
        onClose={() => setIsTocOpen(false)}
        tocItems={currentTOC}
        onSelectPage={(p) => {
          goToPage(p);
          if (viewMode === 'all') {
            const el = document.querySelectorAll('.pdf-page')[p - 1];
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
}
