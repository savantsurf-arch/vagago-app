import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Wallet,
  PlusCircle,
  CheckCircle2,
  Copy,
  Sparkles,
  RefreshCw,
  QrCode,
  DollarSign
} from 'lucide-react';

export const WalletDepositModal = ({ isOpen, onClose }) => {
  const { depositWalletCredits, currentUser } = useApp();

  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [step, setStep] = useState(1); // 1: Select Amount, 2: PIX Payment
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const safeUser = currentUser || { credits: 20 };
  const rawValue = customAmount ? parseFloat(customAmount) : selectedAmount;
  const depositValue = isNaN(rawValue) || rawValue <= 0 ? 50 : rawValue;
  const pixCopyKey = `00020126580014br.gov.bcb.pix0136VAGAGOWALLET-${Date.now()}5204000053039865405${depositValue.toFixed(2)}`;

  const handleProceedToPIX = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (depositValue > 0) {
      setStep(2);
    }
  };

  const handleSimulatePayment = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (typeof depositWalletCredits === 'function') {
        depositWalletCredits(depositValue);
      }
      setIsLoading(false);
      onClose();
      setStep(1);
    }, 600);
  };

  const handleCopyPIX = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixCopyKey);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Wallet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Carteira Digital VagaGo Wallet</h3>
              <p className="text-xs text-emerald-200">Saldo Atual: R$ {Number(safeUser?.credits || 20).toFixed(2)}</p>
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {step === 1 && (
            <form onSubmit={handleProceedToPIX} className="space-y-4">
              <label className="font-extrabold text-slate-800 block text-xs">
                Selecione o valor do depósito em créditos:
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1 transition ${
                      selectedAmount === amt && !customAmount
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300 font-black'
                        : 'bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-lg font-black text-emerald-700">R$ {amt}</span>
                    <span className="text-[10px] text-slate-500">Créditos</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ou digite outro valor (R$):</label>
                <input
                  type="number"
                  min="5"
                  max="1000"
                  placeholder="Ex: 75"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800"
                />
              </div>

              <button
                type="button"
                onClick={handleProceedToPIX}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-sm py-3 rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Gerar PIX de R$ {depositValue.toFixed(2)}</span>
              </button>
            </form>
          )}


          {step === 2 && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <span className="text-xs font-extrabold text-emerald-800 uppercase block">
                  Escaneie o QR Code PIX para Recarregar R$ {depositValue.toFixed(2)}
                </span>

                <div className="bg-white p-3 rounded-xl inline-block shadow-sm">
                  <QRCodeSVG value={pixCopyKey} size={150} />
                </div>

                <button
                  type="button"
                  onClick={handleCopyPIX}
                  className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-extrabold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <Copy className="w-4 h-4 text-emerald-600" />
                  <span>{isCopied ? "✓ Chave Copiada!" : "Copiar Chave PIX Copia e Cola"}</span>
                </button>
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  " Simular Confirmação do PIX (Adicionar Créditos)"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 font-bold hover:underline text-xs"
              >
                Alterar valor
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
