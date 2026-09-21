import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Car,
  DollarSign,
  X,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const NotificationToast = () => {
  const {
    liveToast,
    clearLiveToast,
    markNotificationAsRead,
    setActiveTab,
    currentUser
  } = useApp();

  useEffect(() => {
    if (!liveToast) return;
    const timer = setTimeout(() => {
      clearLiveToast();
    }, 6000);
    return () => clearTimeout(timer);
  }, [liveToast, clearLiveToast]);

  if (!liveToast) return null;

  const handleAction = () => {
    if (liveToast.id) {
      markNotificationAsRead(liveToast.id);
    }
    if (liveToast.actionTab) {
      setActiveTab(liveToast.actionTab);
    }
    clearLiveToast();
  };

  const getIcon = () => {
    switch (liveToast.type) {
      case 'new_booking':
      case 'new_booking_request':
        return <Bell className="w-5 h-5 text-emerald-500 animate-bounce" />;
      case 'booking_confirmed':
      case 'booking_approved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'payment_approved':
      case 'payout_credited':
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case 'check_in':
      case 'driver_check_in':
        return <Car className="w-5 h-5 text-sky-500" />;
      case 'booking_cancelled':
      case 'booking_rejected':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <Bell className="w-5 h-5 text-sky-500" />;
    }
  };

  return (
    <aside aria-label="Alerta de Notificação" className="fixed top-4 right-4 sm:top-5 sm:right-5 z-60 max-w-sm w-[calc(100%-2rem)] sm:w-96 animate-in slide-in-from-top-3 duration-300 pointer-events-auto">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex items-start gap-3 relative">
        <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 shrink-0 mt-0.5">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 pr-6 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              VagaGo Alertas
            </span>
            <span className="text-[10px] text-slate-400">• Agora mesmo</span>
          </div>

          <h4 className="text-xs font-black text-white leading-snug truncate">
            {liveToast.title || "Notificação"}
          </h4>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {liveToast.message}
          </p>

          {liveToast.actionTab && (
            <button
              type="button"
              onClick={handleAction}
              className="mt-2 text-xs font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
            >
              <span>{liveToast.actionText || "Ver detalhes"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={clearLiveToast}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          title="Fechar alerta"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
