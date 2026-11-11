import React from 'react';
import { useApp } from '../context/AppContext';
import { BRAND_CONFIG } from '../services/brandConfig';
import { MessageSquare, Mail, MapPin, ShieldCheck, Smartphone } from 'lucide-react';

export const Footer = ({ onOpenChatHelp = () => {} }) => {
  const { setActiveTab, openTermsPage } = useApp();

  const handleOpenLegal = (subTab) => {
    if (typeof openTermsPage === 'function') {
      openTermsPage(subTab);
    } else {
      setActiveTab('terms');
    }
  };

  return (
    <footer className="bg-slate-900 text-white pt-12 pb-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          {/* Coluna 1: Marca e Plataforma PWA */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo-vagago.png"
                alt="VagaGo"
                className="h-10 w-auto object-contain"
              />
              <div>
                <div className="font-black text-lg leading-tight">VagaGo</div>
                <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <Smartphone className="w-3 h-3" /> Web App (PWA) • Itabuna - BA
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Estacionamento privativo, seguro e acessível por hora, diária ou mês em Itabuna - BA.
            </p>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Operação Piloto em {BRAND_CONFIG.city}</span>
            </div>
          </div>

          {/* Coluna 2: Para Usuários */}
          <div className="space-y-2.5 text-xs">
            <div className="font-black text-white uppercase tracking-wider text-[11px]">
              Plataforma
            </div>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('search')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Encontrar vaga no mapa
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('host_landing')}
                  className="text-emerald-400 hover:text-emerald-300 font-bold transition cursor-pointer"
                >
                  Seja um Anfitrião (Alugue sua vaga)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('landing')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Página Inicial
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Legal & Privacidade */}
          <div className="space-y-2.5 text-xs">
            <div className="font-black text-white uppercase tracking-wider text-[11px]">
              Transparência & LGPD
            </div>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenLegal('driver')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Termos de Uso
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenLegal('privacy_lgpd')}
                  className="hover:text-white transition cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Política de Privacidade (LGPD)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenLegal('google_cookies')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Cookies & Segurança de Dados
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Suporte via Chat Integrado */}
          <div className="space-y-3 text-xs">
            <div className="font-black text-white uppercase tracking-wider text-[11px]">
              Atendimento Online
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={onOpenChatHelp}
                className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer w-full sm:w-auto"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Abrir Chat Online</span>
              </button>
              <div className="text-slate-400 flex items-center gap-1.5 pt-1">
                <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="hover:text-white transition">
                  {BRAND_CONFIG.supportEmail}
                </a>
              </div>
              <div className="text-[11px] text-slate-500">{BRAND_CONFIG.serviceHours}</div>
            </div>
          </div>
        </div>

        {/* Informações Empresariais e CNPJ */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 text-center sm:text-left">
          <div>
            © 2026 <strong>{BRAND_CONFIG.companyLegalName}</strong>. Todos os direitos reservados.
          </div>
          <div className="font-semibold text-slate-400">
            {BRAND_CONFIG.cnpjDisplay}
          </div>
        </div>
      </div>
    </footer>
  );
};
