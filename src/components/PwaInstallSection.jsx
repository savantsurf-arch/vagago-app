import React, { useEffect, useState } from 'react';
import { Smartphone, Download, Share2, PlusSquare, CheckCircle2, X, Sparkles } from 'lucide-react';

export const PwaInstallSection = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice?.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (e) {
        setShowInstructionsModal(true);
      }
    } else {
      setShowInstructionsModal(true);
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0 text-sky-600 shadow-2xs">
            <Smartphone className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 text-[11px] font-extrabold px-3 py-0.5 rounded-full border border-sky-200/80">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>App Web Instantâneo (PWA) • Sem ocupar memória</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Use o VagaGo direto na tela inicial do seu celular
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              O VagaGo funciona direto no navegador como um aplicativo leve (PWA) — não precisa baixar nada na Google Play ou App Store. Adicione à tela inicial para abrir em 1 toque no Centro de Itabuna.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
          {isInstalled ? (
            <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs px-5 py-3.5 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>App instalado neste aparelho</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Adicionar à Tela Inicial</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowInstructionsModal(true)}
            className="w-full sm:w-auto border border-slate-300 hover:border-sky-500 hover:bg-sky-50/50 text-slate-700 font-bold text-xs px-4 py-3.5 rounded-2xl transition cursor-pointer"
          >
            Como funciona?
          </button>
        </div>
      </div>

      {/* Modal de Instruções rápidas Android / iPhone */}
      {showInstructionsModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInstructionsModal(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-sky-700 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-sky-300" />
                <div>
                  <h4 className="font-black text-base">Instalar VagaGo (PWA)</h4>
                  <p className="text-[11px] text-sky-200">Acesso rápido sem baixar na loja</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="font-black text-slate-900 text-sm">Android (Google Chrome)</div>
                <p className="text-slate-600 leading-relaxed">
                  1. Toque no menu <strong>⋮ (três pontos)</strong> no canto superior direito.<br />
                  2. Selecione <strong>&ldquo;Adicionar à tela inicial&rdquo;</strong> ou <strong>&ldquo;Instalar aplicativo&rdquo;</strong>.<br />
                  3. Confirme e o ícone do VagaGo aparecerá junto aos seus apps.
                </p>
              </div>

              <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-200/80 space-y-1.5">
                <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-sky-600" />
                  <span>iPhone / iPad (Safari)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  1. Toque no botão de <strong>Compartilhar</strong> na barra inferior do Safari.<br />
                  2. Role para baixo e toque em{' '}
                  <strong className="inline-flex items-center gap-1">
                    <PlusSquare className="w-3.5 h-3.5 text-sky-600" /> &ldquo;Adicionar à Tela de Início&rdquo;
                  </strong>.<br />
                  3. Toque em <strong>Adicionar</strong> no canto superior direito.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
