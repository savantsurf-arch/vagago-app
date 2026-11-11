import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BRAND_CONFIG, buildWhatsAppSupportUrl } from '../services/brandConfig';
import { MessageCircle, X, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export const WhatsAppSupportWidget = ({ isOpen: externalOpen, onToggle }) => {
  const {
    activeTab,
    isSpotDetailsOpen,
    isBookingFlowOpen,
    isAddSpotModalOpen,
    isAuthModalOpen,
    isEditProfileModalOpen,
    openTermsPage
  } = useApp();

  const [internalOpen, setInternalOpen] = useState(false);
  const isPanelOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setPanelOpen = (val) => {
    if (typeof onToggle === 'function') onToggle(val);
    setInternalOpen(val);
  };

  // Oculta durante painéis administrativos ou modais full-screen para não cobrir botões móveis
  if (
    activeTab === 'admin_dashboard' ||
    isSpotDetailsOpen ||
    isBookingFlowOpen ||
    isAddSpotModalOpen ||
    isAuthModalOpen ||
    isEditProfileModalOpen
  ) {
    return null;
  }

  const quickTopics = [
    {
      label: 'Dúvida sobre reserva ou pagamento PIX',
      msg: 'Olá, equipe VagaGo! Preciso de ajuda com uma reserva / pagamento PIX.'
    },
    {
      label: 'Ajuda com acesso ao portão / check-in',
      msg: 'Olá, equipe VagaGo! Estou precisando de auxílio com o acesso à garagem.'
    },
    {
      label: 'Quero anunciar minha garagem em Itabuna',
      msg: 'Olá! Tenho uma vaga parada em Itabuna e quero anunciar no VagaGo.'
    },
    {
      label: 'Solicitar reembolso ou cancelamento',
      msg: 'Olá! Gostaria de ajuda com cancelamento e reembolso de reserva.'
    }
  ];

  const defaultWaUrl = buildWhatsAppSupportUrl();

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-30 flex flex-col items-end gap-3">
      {isPanelOpen && (
        <div className="w-80 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-3">
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/15 rounded-xl">
                <MessageCircle className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h4 className="font-black text-sm leading-tight">Suporte VagaGo</h4>
                <p className="text-[11px] text-emerald-100">Atendimento Itabuna • {BRAND_CONFIG.serviceHours}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white cursor-pointer"
              aria-label="Fechar suporte"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <p className="text-slate-600 font-medium">
              Escolha um assunto abaixo para falar com nossa equipe:
            </p>

            <div className="space-y-1.5">
              {quickTopics.map((topic, idx) => {
                const topicWaUrl = buildWhatsAppSupportUrl(topic.msg);
                const href =
                  topicWaUrl ||
                  `mailto:${BRAND_CONFIG.supportEmail}?subject=${encodeURIComponent(topic.label)}&body=${encodeURIComponent(topic.msg)}`;
                return (
                  <a
                    key={idx}
                    href={href}
                    target={topicWaUrl ? '_blank' : undefined}
                    rel={topicWaUrl ? 'noopener noreferrer' : undefined}
                    className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 font-bold flex items-center justify-between gap-2 transition"
                  >
                    <span className="truncate">{topic.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </a>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              {defaultWaUrl ? (
                <a
                  href={defaultWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Abrir WhatsApp Agora</span>
                </a>
              ) : (
                <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-1">
                  <div className="font-extrabold flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Atendimento Direct: {BRAND_CONFIG.supportEmail}</span>
                  </div>
                  <p className="text-emerald-800/90">
                    Para dúvidas urgentes, selecione qualquer assunto acima ou acesse nossa política de reembolso imediato.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setPanelOpen(false);
                  if (typeof openTermsPage === 'function') openTermsPage('driver');
                }}
                className="w-full text-slate-500 hover:text-sky-700 font-bold py-1.5 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Ver Garantia de Reembolso e Termos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setPanelOpen(!isPanelOpen)}
        className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-xs px-4 py-3 rounded-full shadow-xl shadow-emerald-600/30 border-2 border-white flex items-center gap-2 transition transform hover:scale-105 cursor-pointer"
        title="Suporte via WhatsApp e Atendimento VagaGo"
        aria-label="Suporte VagaGo"
      >
        {isPanelOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
        <span className="hidden sm:inline">Suporte WhatsApp</span>
      </button>
    </div>
  );
};
