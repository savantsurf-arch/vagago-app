import React, { useState, useEffect } from 'react';
import { X, Lock, Unlock, CheckCircle2, Wifi, Zap, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

export const GateOpenerModal = ({ isOpen, onClose, booking }) => {
  const [stage, setStage] = useState('connecting'); // connecting, opening, success
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStage('connecting');
      setProgress(0);
      return;
    }

    setStage('connecting');
    setProgress(15);

    const timer1 = setTimeout(() => {
      setStage('opening');
      setProgress(60);
    }, 1000);

    const timer2 = setTimeout(() => {
      setProgress(100);
      setStage('success');
    }, 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const spaceTitle = booking?.spaceTitle || 'Garagem Privativa Centro Itabuna';
  const bookingNumber = booking?.bookingNumber || 'VG-84920';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Zap className="w-5 h-5 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Controle de Portão Inteligente</h3>
              <p className="text-xs text-emerald-200">Reserva #{bookingNumber}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 text-center">
          
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase block tracking-wider">Garagem Selecionada</span>
            <h4 className="font-black text-slate-900 text-lg">{spaceTitle}</h4>
            <p className="text-xs text-slate-500">Sinal criptografado enviado para a guarita eletrônica</p>
          </div>

          {/* Animation Gate Circle */}
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            {stage === 'connecting' && (
              <div className="absolute inset-0 rounded-full border-4 border-sky-400/30 border-t-sky-600 animate-spin"></div>
            )}
            {stage === 'opening' && (
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400/30 border-t-emerald-500 animate-spin"></div>
            )}
            {stage === 'success' && (
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 border-4 border-emerald-500 animate-in zoom-in-50"></div>
            )}

            <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
              stage === 'success' ? 'bg-emerald-500 text-white scale-105' : 'bg-slate-900 text-sky-400'
            }`}>
              {stage === 'connecting' && <Wifi className="w-12 h-12 animate-pulse" />}
              {stage === 'opening' && <Lock className="w-12 h-12 animate-bounce" />}
              {stage === 'success' && <Unlock className="w-12 h-12 animate-in zoom-in" />}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 max-w-xs mx-auto">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className={stage === 'success' ? 'text-emerald-700' : 'text-slate-600'}>
                {stage === 'connecting' ? 'Transmitindo Sinal bluetooth/NFC...' : stage === 'opening' ? 'Desbloqueando Trava do Portão...' : '🔓 Portão Aberto com Sucesso!'}
              </span>
              <span className="font-mono text-slate-400">{progress}%</span>
            </div>

            <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stage === 'success' ? 'bg-emerald-500' : 'bg-sky-600'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Secret Access Note */}
          {stage === 'success' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold text-left flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="block text-slate-900 font-black mb-0.5">Entrada Liberada!</span>
                <span>Prossiga com o veículo para a vaga. O portão fechará automaticamente em 45 segundos por segurança.</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className={`w-full font-extrabold text-xs py-3 rounded-2xl shadow-lg transition cursor-pointer ${
              stage === 'success'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {stage === 'success' ? '✓ Confirmar Entrada na Vaga' : 'Cancelar Transmissão'}
          </button>

        </div>

      </div>
    </div>
  );
};
