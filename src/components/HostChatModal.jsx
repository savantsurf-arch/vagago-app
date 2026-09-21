import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeConciergeMessage, CONCIERGE_QUICK_ACTIONS } from '../services/conciergeService';
import {
  X,
  Send,
  ShieldCheck,
  CheckCheck,
  Sparkles,
  Bot,
  AlertTriangle,
  Clock,
  Zap,
  Info,
  Car,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  PhoneOff,
  CornerDownRight
} from 'lucide-react';

export const HostChatModal = ({
  isOpen,
  onClose,
  spot,
  ownerName,
  ownerPhone,
  booking,
  onOpenExtendModal,
  onOpenGateModal
}) => {
  const { currentUser, activeRole, setActiveTab } = useApp();

  const isHost = activeRole === 'PROPRIETÁRIO';
  const otherPartyName = isHost
    ? (booking?.driverName || booking?.userName || 'Motorista (Locatário)')
    : (ownerName || spot?.ownerName || 'Anfitrião (Locador)');

  const otherPartyAvatar = isHost
    ? (booking?.driverAvatar || booking?.userAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80")
    : (spot?.ownerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80");

  const spotTitle = spot?.title || booking?.spaceTitle || 'Garagem VagaGo';
  const vehicleInfo = booking?.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model} (${booking.vehicle.plate})` : 'Veículo Autorizado';

  const [messages, setMessages] = useState([
    {
      id: 'concierge_welcome',
      sender: 'concierge',
      badge: '🛡️ Vagago Concierge • Moderação & Suporte',
      info: 'Comunicação oficial e monitorada 24h para proteção de Locatário e Locador. Todas as regras e seguros estão ativos.',
      action: 'Utilize o chat para alinhar horários, detalhes do veículo ou instruções de acesso.',
      actionType: 'general',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 'initial_host_msg',
      sender: isHost ? 'user' : 'other',
      text: isHost
        ? `Olá! Sou o anfitrião da vaga "${spotTitle}". A vaga está pronta para recebê-lo!`
        : `Olá! Sou o anfitrião da vaga "${spotTitle}". Como posso ajudar com seu acesso?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [securityAlert, setSecurityAlert] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend) => {
    const rawContent = (textToSend || inputText || '').trim();
    if (!rawContent) return;

    // Run Vagago Concierge AI Moderation & Operational Analysis
    const analysis = analyzeConciergeMessage(rawContent, { spot, booking, isHost });

    const userMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: analysis.moderatedText,
      isBlocked: analysis.isBlocked,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // If there was a security violation or operational trigger, Concierge immediately intervenes
    if (analysis.conciergeIntervention) {
      if (analysis.isBlocked) {
        setSecurityAlert(analysis.conciergeIntervention.info);
        setTimeout(() => setSecurityAlert(null), 5000);
      }

      setTimeout(() => {
        const conciergeMsg = {
          id: `concierge_${Date.now()}`,
          sender: 'concierge',
          badge: analysis.conciergeIntervention.badge,
          info: analysis.conciergeIntervention.info,
          action: analysis.conciergeIntervention.action,
          actionType: analysis.conciergeIntervention.actionType,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, conciergeMsg]);
      }, 400);
    }

    // Contextual Counterparty Auto-Reply (if not blocked)
    if (!analysis.isBlocked) {
      setTimeout(() => {
        let replyText = "Entendido! O acesso está liberado e o sistema da garagem sincronizado.";
        const clean = rawContent.toLowerCase();

        if (clean.includes('estender') || clean.includes('tempo')) {
          replyText = "Perfeito! Assim que você confirmar a extensão pelo botão do app, meu painel atualiza na hora.";
        } else if (clean.includes('portão') || clean.includes('portao') || clean.includes('entrar')) {
          replyText = "Pode aproximar o veículo do portão ou usar o botão 'Abrir Portão' no seu app que a abertura é automática.";
        } else if (clean.includes('placa') || clean.includes('carro')) {
          replyText = "Placa e modelo conferidos com sucesso no sistema da portaria!";
        }

        setMessages(prev => [
          ...prev,
          {
            id: `reply_${Date.now()}`,
            sender: 'other',
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 1200);
    }
  };

  const handleConciergeAction = (actionType) => {
    if (actionType === 'extend_booking') {
      if (typeof onOpenExtendModal === 'function') {
        onOpenExtendModal(booking || { spaceTitle: spotTitle, ...spot });
      } else if (typeof setActiveTab === 'function') {
        setActiveTab('client_dashboard');
      }
      onClose();
    } else if (actionType === 'open_gate') {
      if (typeof onOpenGateModal === 'function') {
        onOpenGateModal(booking || spot);
      }
    } else if (actionType === 'view_bookings') {
      if (typeof setActiveTab === 'function') {
        setActiveTab(isHost ? 'owner_dashboard' : 'client_dashboard');
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] text-slate-100 relative">
        
        {/* Top Concierge Active Badge Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 px-4 py-1.5 flex items-center justify-between text-[11px] font-extrabold text-white shadow-inner shrink-0">
          <div className="flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 animate-pulse text-emerald-200" />
            <span>Vagago Concierge Ativo • Moderação & Proteção 24h</span>
          </div>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider">
            Seguro Ativo
          </span>
        </div>

        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={otherPartyAvatar}
                alt={otherPartyName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/50 shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-white">
                <span>{otherPartyName}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                📍 {spotTitle} • <span className="text-emerald-400 font-medium">{vehicleInfo}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
              title="Fechar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Alert Toast */}
        {securityAlert && (
          <div className="bg-rose-950/90 border-b border-rose-500/40 p-3 text-rose-200 text-xs flex items-start gap-2 animate-in slide-in-from-top duration-200 shrink-0">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-bold text-white block">Aviso de Segurança Vagago:</strong>
              <p className="text-[11px] leading-relaxed">{securityAlert}</p>
            </div>
          </div>
        )}

        {/* Quick Action Chips */}
        <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {CONCIERGE_QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => handleSendMessage(action.text)}
              className="bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-700/60 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 text-xs">
          {messages.map((m) => {
            // Concierge System Intervention Balloon
            if (m.sender === 'concierge') {
              return (
                <div
                  key={m.id}
                  className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-3.5 shadow-lg space-y-2 relative overflow-hidden animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-extrabold text-[11px] text-indigo-200">
                        {m.badge || '[Vagago Concierge]'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{m.time}</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-200 leading-relaxed">
                    <p className="font-semibold text-white">
                      <span className="text-indigo-400 font-black">[Vagago Info]</span> {m.info}
                    </p>
                    <p className="text-slate-300 text-[11px] flex items-start gap-1">
                      <span className="text-emerald-400 font-bold shrink-0">👉 Ação recomendada:</span>
                      <span>{m.action}</span>
                    </p>
                  </div>

                  {m.actionType && m.actionType !== 'security' && m.actionType !== 'general' && (
                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleConciergeAction(m.actionType)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        {m.actionType === 'extend_booking' && <span>⏱️ Abrir Extensão de Horário</span>}
                        {m.actionType === 'open_gate' && <span>🚪 Abrir Portão</span>}
                        {m.actionType === 'view_bookings' && <span>📋 Ver Minhas Reservas</span>}
                        {m.actionType === 'emergency_support' && <span>🛡️ Acionar Suporte</span>}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // Normal User (Locatário/Locador) or Counterparty message
            const isMe = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? m.isBlocked
                        ? 'bg-rose-950/80 text-rose-200 border border-rose-500/30 rounded-br-none'
                        : 'bg-sky-600 text-white rounded-br-none font-medium'
                      : 'bg-slate-800 text-slate-100 border border-slate-700/70 rounded-bl-none font-medium'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1 flex items-center gap-1">
                  {m.time}
                  {isMe && !m.isBlocked && <CheckCheck className="w-3 h-3 text-sky-400" />}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder="Mensagem protegida pelo Vagago Concierge..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-800/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-slate-800"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 active:bg-sky-700 text-white p-2.5 rounded-2xl shadow-md transition flex items-center justify-center cursor-pointer shrink-0"
            title="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
