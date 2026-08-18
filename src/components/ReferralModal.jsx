import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Gift, Copy, Check, Share2, Sparkles, DollarSign } from 'lucide-react';

export const ReferralModal = () => {
  const { isReferralModalOpen, setIsReferralModalOpen, currentUser } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isReferralModalOpen) return null;

  const referralCode = currentUser.referralCode || "VAGAGO20";
  const shareUrl = `https://vagago.com.br/invite/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white relative">
          <button
            onClick={() => setIsReferralModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-md">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Programa de Indicação VagaGo
          </span>
          <h3 className="text-2xl font-black mt-2">Ganhe R$ 20 em Créditos!</h3>
          <p className="text-xs text-amber-100 mt-1 leading-relaxed">
            Indique um amigo ou proprietário de garagem. Quando ele fizer a primeira reserva ou cadastrar uma vaga, ambos ganham R$ 20!
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Seu Código Exclusivo de Indicação
            </label>
            <div className="bg-slate-100 p-3 rounded-2xl text-center border border-slate-200">
              <span className="font-mono text-xl font-black text-slate-900 tracking-wider">
                {referralCode}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Link de Convite Direto
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 outline-none"
              />
              <button
                onClick={handleCopy}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 transition shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between text-xs text-amber-900 font-semibold">
            <span>Seu saldo atual de créditos:</span>
            <span className="text-base font-extrabold text-amber-600">R$ {currentUser.credits || 0},00</span>
          </div>

          <button
            onClick={handleCopy}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            Compartilhar Link de Convite
          </button>
        </div>

      </div>
    </div>
  );
};
