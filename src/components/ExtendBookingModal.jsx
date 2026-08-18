import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Wallet,
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';

export const ExtendBookingModal = ({ booking, isOpen, onClose }) => {
  const { extendBooking, currentUser } = useApp();

  const [extendOption, setExtendOption] = useState(30); // 30 or 60 minutes
  const [paymentMethod, setPaymentMethod] = useState('WALLET'); // WALLET or PIX
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !booking) return null;

  const extraPrice = extendOption === 30 ? 4.00 : 8.00;

  const handleConfirmExtend = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      extendBooking(booking.id, extendOption, extraPrice);
      setIsLoading(false);
      setSuccessMsg(`Tempo estendido em +${extendOption} minutos com sucesso!`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    }, 600);
  };

  const safeUser = currentUser || { credits: 20 };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-600 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Clock className="w-5 h-5 text-sky-300 animate-spin" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Estender Tempo da Reserva</h3>
              <p className="text-xs text-sky-200">Reserva #{booking.bookingNumber}</p>
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

        {/* Form Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-extrabold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Booking Overview */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
            <div className="font-extrabold text-slate-900 text-sm">{booking.spaceTitle}</div>
            <div className="text-slate-500 font-semibold">
              Término Atual: <strong className="text-slate-800">{booking.endTime}</strong>
            </div>
          </div>

          {/* Option Selector */}
          <div className="space-y-2">
            <label className="font-extrabold text-slate-800 block text-xs">
              Selecione o Tempo Adicional:
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExtendOption(30)}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1 transition ${
                  extendOption === 30
                    ? 'bg-sky-50 border-sky-500 text-sky-900 ring-2 ring-sky-300 font-black'
                    : 'bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100'
                }`}
              >
                <span className="text-sm font-black">+ 30 Minutos</span>
                <span className="text-sky-600 font-extrabold">+ R$ 4,00</span>
              </button>

              <button
                type="button"
                onClick={() => setExtendOption(60)}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1 transition ${
                  extendOption === 60
                    ? 'bg-sky-50 border-sky-500 text-sky-900 ring-2 ring-sky-300 font-black'
                    : 'bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100'
                }`}
              >
                <span className="text-sm font-black">+ 1 Hora</span>
                <span className="text-sky-600 font-extrabold">+ R$ 8,00</span>
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-extrabold text-slate-800 block text-xs">
              Forma de Pagamento:
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('WALLET')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  paymentMethod === 'WALLET'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Carteira (R$ {Number(safeUser?.credits || 20).toFixed(2)})</span>
              </button>


              <button
                type="button"
                onClick={() => setPaymentMethod('PIX')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  paymentMethod === 'PIX'
                    ? 'bg-sky-50 border-sky-500 text-sky-900 ring-2 ring-sky-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4 text-sky-600" />
                <span>PIX Instantâneo</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleConfirmExtend}
            disabled={isLoading || Boolean(successMsg)}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm py-3 rounded-2xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              `Confirmar extensão por R$ ${extraPrice.toFixed(2)}`
            )}
          </button>

        </div>

      </div>
    </div>
  );
};
