import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send, MessageSquare, Phone, ShieldCheck, CheckCheck } from 'lucide-react';

export const HostChatModal = ({ isOpen, onClose, spot, ownerName, ownerPhone }) => {
  const { currentUser } = useApp();

  const hostName = ownerName || spot?.ownerName || 'Anfitrião VagaGo';
  const hostPhone = ownerPhone || spot?.ownerPhone || '(73) 99123-4567';


  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'host',
      text: `Olá! Sou ${hostName}. Como posso ajudar com a vaga "${spot?.title || 'Garagem Itabuna'}"?`,
      time: '14:20'
    }
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSendMessage = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    const currentInput = inputText.trim();
    setInputText('');

    // Auto reply from host after 1 sec
    setTimeout(() => {
      let replyText = "Perfeito! A entrada é automatizada e a guarita já está notificada sobre sua chegada.";
      if (currentInput.toLowerCase().includes('capacete') || currentInput.toLowerCase().includes('moto')) {
        replyText = "Sim! Pode deixar o capacete com o agente da guarita sem custo adicional.";
      } else if (currentInput.toLowerCase().includes('código') || currentInput.toLowerCase().includes('portão')) {
        replyText = "O portão abre automaticamente aproximando o QR Code do leitor óptico na entrada.";
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'host',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = hostPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = `Olá ${hostName}, sou cliente do VagaGo! Gostaria de tirar uma dúvida sobre a vaga "${spot?.title || 'Garagem Itabuna'}".`;
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-sky-600 via-sky-700 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={spot?.ownerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                alt={hostName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                <span>{hostName}</span>
                <ShieldCheck className="w-4 h-4 text-sky-300" />
              </h3>
              <p className="text-[11px] text-sky-200">Anfitrião Verificado • Itabuna - BA</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="p-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-sm"
              title="Abrir conversa no WhatsApp"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none font-medium'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                {m.time}
                {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-sky-500" />}
              </span>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Digite sua dúvida para o anfitrião..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            className="bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white p-2.5 rounded-xl shadow-sm transition flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
