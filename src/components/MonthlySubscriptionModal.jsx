import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Wallet,
  Car,
  Clock,
  Award,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';

export const MonthlySubscriptionModal = ({ isOpen, onClose, spot }) => {
  const { currentUser, vehicles = [], addVehicle } = useApp();

  const [planDuration, setPlanDuration] = useState(1); // 1, 3, 6 months
  const [accessType, setAccessType] = useState('24H'); // 24H or COMERCIAL (Seg a Sex)
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]?.plate || 'ABC-1D23');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [step, setStep] = useState(1); // 1: Plan Selection, 2: Payment & Contract
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !spot) return null;

  const baseMonthlyPrice = Number(spot.priceMonthly || 280.00);
  const discountMultiplier = planDuration === 6 ? 0.80 : planDuration === 3 ? 0.90 : 1.0;
  const accessMultiplier = accessType === 'COMERCIAL' ? 0.85 : 1.0;

  const finalMonthlyPrice = Number((baseMonthlyPrice * discountMultiplier * accessMultiplier).toFixed(2));
  const totalContractPrice = Number((finalMonthlyPrice * planDuration).toFixed(2));
  const totalSavings = Number(((baseMonthlyPrice * planDuration) - totalContractPrice).toFixed(2));

  const pixKey = `00020126580014br.gov.bcb.pix0136VAGAGO-MENSAL-${spot.id}-${Date.now()}5204000053039865405${totalContractPrice.toFixed(2)}`;

  const handleCopyPIX = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixKey);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConfirmSubscription = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setStep(1);
        onClose();
      }, 2500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Calendar className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base">Plano Mensalista VagaGo</h3>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  Economize até 20%
                </span>
              </div>
              <p className="text-xs text-emerald-200">{spot.title}</p>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {isSuccess ? (
            <div className="p-8 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-black text-slate-900 text-xl">Assinatura Mensalista Ativa! 🎉</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Sua vaga garantida em <strong>{spot.title}</strong> foi confirmada. Seu acesso automático por QR Code e controle de portão já está liberado.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-800 inline-block font-bold">
                Plano {planDuration} {planDuration === 1 ? 'Mês' : 'Meses'} • R$ {finalMonthlyPrice.toFixed(2)}/mês
              </div>
            </div>
          ) : step === 1 ? (
            <div className="space-y-4">
              
              {/* Duration Plan Selector */}
              <div>
                <label className="font-extrabold text-slate-800 block text-xs mb-2">
                  Escolha o período da sua vaga fixa:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { months: 1, label: '1 Mês', tag: 'Mensal Padrão', discount: null },
                    { months: 3, label: '3 Meses', tag: '10% OFF', discount: '10%' },
                    { months: 6, label: '6 Meses', tag: '20% OFF', discount: '20%' }
                  ].map((p) => (
                    <button
                      key={p.months}
                      type="button"
                      onClick={() => setPlanDuration(p.months)}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition text-center cursor-pointer ${
                        planDuration === p.months
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300 font-black shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-sm font-black">{p.label}</span>
                      {p.tag && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                          p.discount ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {p.tag}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Access Schedule */}
              <div>
                <label className="font-extrabold text-slate-800 block text-xs mb-2">
                  Horário de Acesso:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccessType('24H')}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold transition cursor-pointer ${
                      accessType === '24H'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Livre 24h (Todos os dias)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccessType('COMERCIAL')}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold transition cursor-pointer ${
                      accessType === 'COMERCIAL'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Award className="w-4 h-4 text-teal-600" />
                    <span>Comercial (Seg a Sex -15%)</span>
                  </button>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>Mensalidade Base:</span>
                  <span className="line-through text-slate-400">R$ {baseMonthlyPrice.toFixed(2)}/mês</span>
                </div>
                <div className="flex justify-between items-center text-sm font-extrabold text-slate-900">
                  <span>Valor com Desconto VagaGo:</span>
                  <span className="text-emerald-700 text-base font-black">R$ {finalMonthlyPrice.toFixed(2)}/mês</span>
                </div>
                {totalSavings > 0 && (
                  <div className="text-[11px] text-emerald-800 font-extrabold bg-white/80 px-2.5 py-1 rounded-xl flex items-center gap-1 border border-emerald-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Você economiza R$ {totalSavings.toFixed(2)} neste contrato!</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Avançar para Pagamento do Plano</span>
              </button>

            </div>
          ) : (
            /* STEP 2: Payment */
            <div className="space-y-4">
              
              {/* Payment Method Selector */}
              <div>
                <label className="font-extrabold text-slate-800 block text-xs mb-2">
                  Forma de Pagamento:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold transition cursor-pointer ${
                      paymentMethod === 'PIX'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>PIX Instantâneo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARTAO')}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold transition cursor-pointer ${
                      paymentMethod === 'CARTAO'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-sky-600" />
                    <span>Cartão de Crédito</span>
                  </button>
                </div>
              </div>

              {/* PIX QR Code Box */}
              {paymentMethod === 'PIX' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <span className="text-xs font-black text-emerald-900 uppercase block">
                    Escaneie para Ativar Mensalista de R$ {totalContractPrice.toFixed(2)}
                  </span>
                  
                  <div className="bg-white p-3 rounded-xl inline-block shadow-sm">
                    <QRCodeSVG value={pixKey} size={150} />
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPIX}
                    className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-extrabold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-emerald-600" />
                    <span>{isCopied ? "✓ Chave PIX Copiada!" : "Copiar Chave PIX Copia e Cola"}</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmSubscription}
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  `Confirmar Assinatura Mensalista de R$ ${totalContractPrice.toFixed(2)}`
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 font-bold hover:underline text-xs block mx-auto cursor-pointer"
              >
                ← Voltar e alterar plano
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
