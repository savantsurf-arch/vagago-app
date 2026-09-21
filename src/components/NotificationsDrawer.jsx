import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  X,
  AlertCircle,
  RefreshCw,
  CheckCheck,
  Calendar,
  DollarSign,
  Car,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Inbox
} from 'lucide-react';

export const NotificationsDrawer = ({ isOpen, onClose }) => {
  const {
    notifications,
    currentUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'bookings' | 'finance' | 'system'

  if (!isOpen) return null;

  const safeUser = currentUser || {};
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  // Security: Strict User Isolation
  const myNotifications = safeNotifications.filter(n => {
    if (!n) return false;
    // Broadcast notifications with no specific user
    if (!n.userId && !n.userEmail && !n.targetUserId) return true;
    // Scoped directly to logged-in user
    return (
      (n.userId && (n.userId === safeUser.id || n.userId === safeUser.email)) ||
      (n.targetUserId && n.targetUserId === safeUser.id) ||
      (n.userEmail && safeUser.email && n.userEmail.toLowerCase() === safeUser.email.toLowerCase())
    );
  });

  const unreadCount = myNotifications.filter(n => !n.read).length;

  // Filter categories
  const filteredNotifications = myNotifications.filter(n => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'bookings') {
      return (
        n.category === 'bookings' ||
        n.type?.includes('booking') ||
        n.type?.includes('check_in') ||
        n.type?.includes('check_out')
      );
    }
    if (activeFilter === 'finance') {
      return (
        n.category === 'payments' ||
        n.category === 'finance' ||
        n.type?.includes('payment') ||
        n.type?.includes('payout') ||
        n.type?.includes('deposit') ||
        n.type?.includes('withdraw')
      );
    }
    if (activeFilter === 'system') {
      return (
        n.category === 'system' ||
        n.type?.includes('space') ||
        n.type?.includes('spot') ||
        n.type === 'system'
      );
    }
    return true;
  });

  const handleNotificationClick = (n) => {
    if (!n.read) {
      markNotificationAsRead(n.id);
    }
    if (n.actionTab) {
      if (typeof onClose === 'function') onClose();
      setActiveTab(n.actionTab);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new_booking':
      case 'new_booking_request':
        return <Bell className="w-5 h-5 text-emerald-600" />;
      case 'booking_confirmed':
      case 'booking_approved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'booking_cancelled':
      case 'booking_rejected':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'check_in':
      case 'driver_check_in':
        return <Car className="w-5 h-5 text-sky-500" />;
      case 'check_out':
      case 'driver_check_out':
        return <CheckCircle2 className="w-5 h-5 text-indigo-500" />;
      case 'payment_approved':
      case 'payout_credited':
      case 'deposit_success':
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case 'spot_status':
      case 'new_space':
        return <Car className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-sky-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white min-h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 border-l border-slate-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl shadow-2xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base">Notificações</h3>
                {unreadCount > 0 && (
                  <span className="bg-sky-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    {unreadCount} nova{unreadCount === 1 ? '' : 's'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Central de avisos e comunicações em tempo real</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Header Strip (Marcar todas como lidas) */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-500">
            {myNotifications.length} {myNotifications.length === 1 ? 'notificação' : 'notificações'}
          </span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="text-emerald-700 hover:text-emerald-800 font-extrabold flex items-center gap-1 cursor-pointer transition"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Marcar todas como lidas</span>
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
          {[
            { id: 'all', label: `Todas (${myNotifications.length})` },
            { id: 'unread', label: `Não lidas (${unreadCount})` },
            { id: 'bookings', label: 'Reservas' },
            { id: 'finance', label: 'Ganhos / PIX' },
            { id: 'system', label: 'Sistema' }
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-slate-900 text-white shadow-2xs font-black'
                  : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/70'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <div className="w-14 h-14 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
                <Inbox className="w-7 h-7 opacity-60" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm">Você está em dia!</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {activeFilter === 'unread'
                  ? 'Todas as suas notificações foram lidas.'
                  : 'Nenhuma notificação encontrada nesta categoria.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const isUnread = !n.read;

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 rounded-2xl border transition relative cursor-pointer group ${
                    isUnread
                      ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200/80'
                  }`}
                >
                  {isUnread && (
                    <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                  )}

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100/80 shrink-0 mt-0.5 border border-slate-200/60 group-hover:scale-105 transition">
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2 pr-3">
                        <h4 className={`text-xs leading-snug truncate ${isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                          {n.title}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] text-slate-400">
                          {n.timestamp || 'Recentemente'}
                        </span>

                        {n.actionTab && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(n);
                            }}
                            className="text-[11px] font-black text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200/80 flex items-center gap-1 transition cursor-pointer"
                          >
                            <span>{n.actionText || "Ver detalhes"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Full Page Link CTA */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={() => {
              if (typeof onClose === 'function') onClose();
              setActiveTab('notifications');
            }}
            className="text-xs font-black text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1.5 transition cursor-pointer w-full py-1.5"
          >
            <span>Abrir Central de Notificações em Tela Cheia</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

      </div>
    </div>
  );
};
