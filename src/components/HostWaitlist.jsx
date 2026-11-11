import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { saveHostWaitlistToSupabase } from '../services/supabaseService';
import {
  CheckCircle2,
  Lock,
  Home,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const ITABUNA_WAITLIST_NEIGHBORHOODS = [
  'Centro',
  'Fátima',
  'Góes Calmon / Jequitibá',
  'São Caetano',
  'Jardim Vitória',
  'Conceição',
  'Pontalzinho',
  'Outro'
];

export const HostWaitlist = () => {
  const { setActiveTab, setIsAddSpotModalOpen, isAuthenticated, setActiveRole, openRegisterModal } = useApp();

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePhoneMask = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) {
      setWhatsapp(digits ? `(${digits}` : '');
    } else if (digits.length <= 7) {
      setWhatsapp(`(${digits.slice(0, 2)}) ${digits.slice(2)}`);
    } else {
      setWhatsapp(`(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || name.trim().length < 2) {
      setErrorMsg('Por favor, informe seu nome.');
      return;
    }

    const phoneDigits = whatsapp.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setErrorMsg('Informe um WhatsApp válido com DDD (ex: 73 99999-9999).');
      return;
    }

    const selectedNb = neighborhood && neighborhood !== 'Selecione o Bairro' ? neighborhood : 'Itabuna';

    const lead = {
      id: `wl_${Date.now()}`,
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      neighborhood: selectedNb,
      createdAt: new Date().toISOString()
    };

    try {
      setIsSubmitting(true);
      try {
        const existingRaw = localStorage.getItem('vagago_host_waitlist');
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        localStorage.setItem('vagago_host_waitlist', JSON.stringify([lead, ...existing]));
      } catch (_storageErr) {
        // Ignora caso localStorage esteja bloqueado
      }

      await saveHostWaitlistToSupabase(lead);
      setSubmittedLead(lead);
      setName('');
      setWhatsapp('');
      setNeighborhood('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishNow = () => {
    if (isAuthenticated) {
      setActiveRole('PROPRIETÁRIO');
      setIsAddSpotModalOpen(true);
    } else {
      openRegisterModal('PROPRIETÁRIO');
    }
  };

  return (
    <section
      id="para-anfitrioes-waitlist"
      className="bg-gradient-to-br from-sky-50 via-blue-50/90 to-emerald-50/70 py-10 sm:py-14 px-5 sm:px-8 rounded-3xl border border-sky-200/80 shadow-sm space-y-8"
    >
      {/* Bloco de Copywriting + Benefícios Rápidos */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3.5 py-1 rounded-full border border-emerald-200">
          <Home className="w-3.5 h-3.5 text-emerald-600" />
          <span>Para Anfitriões em Itabuna - BA</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          Transforme sua vaga ociosa em renda extra 💸
        </h2>

        <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
          Tem uma garagem, quintal ou vaga que fica vazia a maior parte do dia? Alugue pelo VagaGo com segurança, cobertura da plataforma e receba direto no seu PIX.
        </p>

        {/* Benefícios rápidos */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 pt-2 text-xs sm:text-sm font-bold text-slate-800">
          <span className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
            <span aria-hidden="true">✅</span> Você define o preço e os horários
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
            <span aria-hidden="true">✅</span> Pagamento garantido pela plataforma
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
            <span aria-hidden="true">✅</span> Suporte e verificação de todos os motoristas
          </span>
        </div>
      </div>

      {/* Formulário Waitlist */}
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-sky-200/80 shadow-lg shadow-sky-900/5 text-center space-y-5">
        {submittedLead ? (
          <div className="py-4 space-y-4 animate-in fade-in">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900">
                Você está na lista de Anfitriões VagaGo!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Recebemos seus dados para o bairro <strong>{submittedLead.neighborhood}</strong> ({submittedLead.whatsapp}). Nossa equipe em Itabuna entrará em contato para ativar sua garagem prioritariamente.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={handlePublishNow}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ou cadastrar minha garagem agora</span>
              </button>
              <button
                type="button"
                onClick={() => setSubmittedLead(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 cursor-pointer"
              >
                Cadastrar outra vaga
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Seja um Anfitrião VagaGo
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Cadastre-se na lista de espera e seja o primeiro a ganhar dinheiro com sua vaga em Itabuna.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none flex-1 text-xs sm:text-sm font-semibold text-slate-900"
                required
              />
              <input
                type="tel"
                placeholder="Seu WhatsApp"
                value={whatsapp}
                onChange={(e) => handlePhoneMask(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none flex-1 text-xs sm:text-sm font-semibold text-slate-900"
                required
              />
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                aria-label="Selecione o Bairro"
                className="px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none flex-1 text-xs sm:text-sm font-semibold text-slate-700"
              >
                <option value="">Selecione o Bairro</option>
                {ITABUNA_WAITLIST_NEIGHBORHOODS.map((nb) => (
                  <option key={nb} value={nb}>
                    {nb}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-60 text-white font-extrabold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer shrink-0"
              >
                {isSubmitting ? 'Enviando...' : 'Quero Alugar'}
              </button>
            </form>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
              <p className="flex items-center justify-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Seus dados estão seguros e não faremos spam.</span>
              </p>

              <button
                type="button"
                onClick={() => setActiveTab('host_landing')}
                className="text-sky-700 hover:text-sky-600 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Simular ganhos completos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HostWaitlist;
