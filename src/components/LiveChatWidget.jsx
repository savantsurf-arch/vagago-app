import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { BRAND_CONFIG } from '../services/brandConfig';
import { MessageSquare, X, Send, CheckCircle2, Sparkles, Car, Home, ShieldCheck } from 'lucide-react';

/**
 * Chat Integrado (Crisp.chat + Fallback Nativo Leve):
 * - Quando VITE_CRISP_WEBSITE_ID está configurado, injeta o Crisp.chat oficial e sincroniza o usuário logado.
 * - Enquanto o ID Crisp ainda não estiver configurado, exibe um Chat Integrado leve e interativo
 *   com fluxo inicial ("Olá! Quer reservar uma vaga ou alugar a sua?") e registro de mensagem.
 */
export const LiveChatWidget = ({ isOpen: externalOpen, onToggle }) => {
  const {
    currentUser,
    isAuthenticated,
    activeTab,
    setActiveTab,
    isSpotDetailsOpen,
    isBookingFlowOpen,
    isAddSpotModalOpen,
    isAuthModalOpen,
    isEditProfileModalOpen,
    openTermsPage
  } = useApp();

  const crispId = BRAND_CONFIG.crispWebsiteId;
  const hasValidCrisp = Boolean(crispId && crispId !== 'SEU_ID_AQUI' && crispId.length > 8);

  const [internalOpen, setInternalOpen] = useState(false);
  const isChatOpen = externalOpen !== undefined ? externalOpen : internalOpen;

  const setChatOpen = (val) => {
    if (hasValidCrisp && typeof window !== 'undefined' && Array.isArray(window.$crisp)) {
      window.$crisp.push(['do', val ? 'chat:open' : 'chat:close']);
      if (typeof onToggle === 'function') onToggle(false);
      return;
    }
    if (typeof onToggle === 'function') onToggle(val);
    setInternalOpen(val);
  };

  const [selectedIntent, setSelectedIntent] = useState(null); // 'driver' | 'host' | 'support'
  const [userMessage, setUserMessage] = useState('');
  const [userContact, setUserContact] = useState(currentUser?.email || '');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Olá! 👋 Bem-vindo ao VagaGo em Itabuna. Quer reservar uma vaga ou alugar a sua?'
    }
  ]);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Integração automática do Crisp.chat quando VITE_CRISP_WEBSITE_ID estiver ativo
  useEffect(() => {
    if (!hasValidCrisp || typeof window === 'undefined') return;

    window.$crisp = window.$crisp || [];
    window.CRISP_WEBSITE_ID = crispId;

    if (!document.getElementById('vagago-crisp-script')) {
      const script = document.createElement('script');
      script.id = 'vagago-crisp-script';
      script.src = 'https://client.crisp.chat/l.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, [hasValidCrisp, crispId]);

  useEffect(() => {
    if (!hasValidCrisp || typeof window === 'undefined' || !Array.isArray(window.$crisp)) return;
    if (isAuthenticated && currentUser) {
      if (currentUser.email) window.$crisp.push(['set', 'user:email', [currentUser.email]]);
      if (currentUser.name) window.$crisp.push(['set', 'user:nickname', [currentUser.name]]);
    }
  }, [hasValidCrisp, isAuthenticated, currentUser]);

  // Se o Crisp oficial está carregado, o próprio widget do Crisp assume a interface flutuante
  if (hasValidCrisp) {
    return null;
  }

  // Oculta em modais cheios e painel admin para não cobrir botões de ação no mobile
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

  const handleQuickIntent = (intent) => {
    setSelectedIntent(intent);
    if (intent === 'driver') {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: 'Quero reservar uma vaga em Itabuna' },
        {
          sender: 'bot',
          text: 'Perfeito! Você pode ver vagas no mapa, comparar preços por hora e reservar em menos de 1 minuto com reembolso garantido.'
        }
      ]);
    } else if (intent === 'host') {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: 'Quero alugar minha garagem parada' },
        {
          sender: 'bot',
          text: 'Ótima escolha! Você define preço e horários e recebe 90% via PIX. Quer entrar na lista de espera ou enviar uma dúvida?'
        }
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: 'Preciso de ajuda / suporte' },
        {
          sender: 'bot',
          text: 'Conte aqui sua dúvida sobre reservas, reembolso ou acesso ao portão e nossa equipe de Itabuna responde rápido!'
        }
      ]);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const msgText = userMessage.trim();
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: msgText },
      {
        sender: 'bot',
        text: `Mensagem recebida! Nossa equipe em Itabuna retornará ${
          userContact ? `para ${userContact}` : 'em breve'
        }. Você também pode escrever para ${BRAND_CONFIG.supportEmail}.`
      }
    ]);

    try {
      const saved = localStorage.getItem('vagago_chat_messages');
      const list = saved ? JSON.parse(saved) : [];
      localStorage.setItem(
        'vagago_chat_messages',
        JSON.stringify([
          {
            id: `chat_${Date.now()}`,
            text: msgText,
            contact: userContact || currentUser?.email || 'visitante',
            intent: selectedIntent || 'geral',
            createdAt: new Date().toISOString()
          },
          ...list
        ])
      );
    } catch (_err) {
      // fallback silencioso
    }

    setUserMessage('');
    setSentSuccess(true);
  };

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-30 flex flex-col items-end gap-3">
      {isChatOpen && (
        <div className="w-80 sm:w-88 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-3 flex flex-col">
          {/* Header do Chat Integrado */}
          <div className="p-4 bg-gradient-to-r from-sky-700 via-sky-800 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative p-2 bg-white/15 rounded-xl">
                <MessageSquare className="w-5 h-5 text-sky-200" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <h4 className="font-black text-sm leading-tight">Chat Online VagaGo</h4>
                <p className="text-[11px] text-sky-200">Atendimento rápido • Itabuna - BA</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white cursor-pointer"
              aria-label="Fechar chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Histórico de Mensagens */}
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto bg-slate-50/70 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed font-medium shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Botões rápidos do Chatbot */}
            {!selectedIntent && (
              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickIntent('driver')}
                  className="w-full p-2.5 bg-white hover:bg-sky-50 border border-sky-200 text-sky-800 font-bold rounded-xl flex items-center gap-2 transition cursor-pointer text-left"
                >
                  <Car className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Quero reservar uma vaga</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickIntent('host')}
                  className="w-full p-2.5 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl flex items-center gap-2 transition cursor-pointer text-left"
                >
                  <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Quero alugar minha garagem</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickIntent('support')}
                  className="w-full p-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-2 transition cursor-pointer text-left"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Dúvida sobre reserva / reembolso</span>
                </button>
              </div>
            )}

            {/* Atalho contextual conforme escolha */}
            {selectedIntent === 'driver' && (
              <button
                type="button"
                onClick={() => {
                  setChatOpen(false);
                  setActiveTab('search');
                }}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-extrabold py-2 rounded-xl transition cursor-pointer"
              >
                Abrir mapa e vagas agora
              </button>
            )}
            {selectedIntent === 'host' && (
              <button
                type="button"
                onClick={() => {
                  setChatOpen(false);
                  const el = document.getElementById('para-anfitrioes-waitlist');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else setActiveTab('host_landing');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2 rounded-xl transition cursor-pointer"
              >
                Ir para Lista de Anfitriões
              </button>
            )}
          </div>

          {/* Envio de Mensagem */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 space-y-2 text-xs">
            {!isAuthenticated && (
              <input
                type="text"
                placeholder="Seu e-mail ou telefone para retorno (opcional)"
                value={userContact}
                onChange={(e) => setUserContact(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-medium focus:bg-white focus:ring-1 focus:ring-sky-500 outline-none"
              />
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Digite sua dúvida..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <button
                type="submit"
                aria-label="Enviar mensagem"
                className="bg-sky-600 hover:bg-sky-500 text-white p-2.5 rounded-xl transition cursor-pointer shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span className="flex items-center gap-1">
                {sentSuccess ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Enviado para nossa equipe</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-sky-500" />
                    <span>Chat leve • Crisp integrado pronto</span>
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  setChatOpen(false);
                  if (typeof openTermsPage === 'function') openTermsPage('driver');
                }}
                className="hover:text-sky-600 underline cursor-pointer"
              >
                Termos
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setChatOpen(!isChatOpen)}
        className="bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold text-xs px-4 py-3 rounded-full shadow-xl shadow-sky-600/30 border-2 border-white flex items-center gap-2 transition transform hover:scale-105 cursor-pointer"
        title="Chat Online VagaGo"
        aria-label="Abrir Chat Online"
      >
        {isChatOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        <span className="hidden sm:inline">Chat Online</span>
      </button>
    </div>
  );
};
