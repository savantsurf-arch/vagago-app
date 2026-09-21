import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  CheckCheck,
  Calendar,
  DollarSign,
  Car,
  ShieldCheck,
  ArrowRight,
  Settings,
  Inbox,
  Sparkles,
  Sliders
} from 'lucide-react';

export const NotificationsPage = () => {
  const {
    notifications,
    currentUser,
    isAuthenticated,
    openLoginModal,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab,
    notificationPreferences,
    updateNotificationPreferences
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('all');
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Bell className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-900">Central de Notificações</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Faça login na sua conta para acompanhar suas reservas, confirmações de vagas e repasses financeiros em tempo real.
          </p>
        </div>
        <button
          type="button"
          onClick={openLoginModal}
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-sky-600/30 transition cursor-pointer"
        >
          Entrar na Minha Conta
        </button>
      </div>
    );
  }

  const safeUser = currentUser || {};
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  // Security: Scoped to Current User
  const myNotifications = safeNotifications.filter(n => {
    if (!n) return false;
    if (!n.userId && !n.userEmail && !n.targetUserId) return true;
    return (
      (n.userId && (n.userId === safeUser.id || n.userId === safeUser.email)) ||
      (n.targetUserId && n.targetUserId === safeUser.id) ||
      (n.userEmail && safeUser.email && n.userEmail.toLowerCase() === safeUser.email.toLowerCase())
    );
  });

  const unreadCount = myNotifications.filter(n => !n.read).length;
  const bookingCount = myNotifications.filter(n => n.category === 'bookings' || n.type?.includes('booking')).length;
  const financeCount = myNotifications.filter(n => n.category === 'payments' || n.category === 'finance' || n.type?.includes('payment') || n.type?.includes('payout')).length;

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-sky-500/20 text-sky-400 border border-sky-400/30 text-xs font-black px-2.5 py-0.5 rounded-full">
              Central de Comunicações
            </span>
            {unreadCount > 0 && (
              <span className="bg-emerald-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full">
                {unreadCount} não lida{unreadCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Notificações do Sistema
          </h1>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            Acompanhe em tempo real confirmações de reservas, pagamentos, instruções de portão e repasses financeiros.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Marcar todas lidas</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsPreferencesOpen(!isPreferencesOpen)}
            className="flex-1 md:flex-none bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Sliders className="w-4 h-4" />
            <span>Preferências</span>
          </button>
        </div>
      </div>

      {/* Preferences Drawer Panel (if toggled) */}
      {isPreferencesOpen && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Preferências de Alertas</h3>
              <p className="text-xs text-slate-500">Defina os tipos de notificações que deseja receber na plataforma.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPreferencesOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Reservas & Agendamentos</span>
                <span className="text-[11px] text-slate-500">Alertas de novas reservas, confirmações e portão</span>
              </div>
              <input
                type="checkbox"
                checked={notificationPreferences?.bookings !== false}
                onChange={(e) => updateNotificationPreferences({ bookings: e.target.checked })}
                className="w-4 h-4 text-sky-600 rounded cursor-pointer"
              />
            </label>

            <label className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Financeiro & Pagamentos</span>
                <span className="text-[11px] text-slate-500">Confirmação de PIX, repasses de locação e saques</span>
              </div>
              <input
                type="checkbox"
                checked={notificationPreferences?.payments !== false}
                onChange={(e) => updateNotificationPreferences({ payments: e.target.checked })}
                className="w-4 h-4 text-sky-600 rounded cursor-pointer"
              />
            </label>

            <label className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Lembretes de Estadia</span>
                <span className="text-[11px] text-slate-500">Avisos de proximidade de horário e check-in</span>
              </div>
              <input
                type="checkbox"
                checked={notificationPreferences?.reminders !== false}
                onChange={(e) => updateNotificationPreferences({ reminders: e.target.checked })}
                className="w-4 h-4 text-sky-600 rounded cursor-pointer"
              />
            </label>

            <label className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Atualizações de Vagas & Sistema</span>
                <span className="text-[11px] text-slate-500">Publicação, pausa e novidades do app</span>
              </div>
              <input
                type="checkbox"
                checked={notificationPreferences?.system !== false}
                onChange={(e) => updateNotificationPreferences({ system: e.target.checked })}
                className="w-4 h-4 text-sky-600 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Recebidas</span>
          <div className="text-xl font-black text-slate-900">{myNotifications.length}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Não Lidas</span>
          <div className="text-xl font-black text-sky-600">{unreadCount}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Reservas</span>
          <div className="text-xl font-black text-emerald-600">{bookingCount}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Financeiro</span>
          <div className="text-xl font-black text-slate-900">{financeCount}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'all', label: `Todas (${myNotifications.length})` },
          { id: 'unread', label: `Não Lidas (${unreadCount})` },
          { id: 'bookings', label: `Reservas (${bookingCount})` },
          { id: 'finance', label: `Financeiro (${financeCount})` },
          { id: 'system', label: 'Sistema' }
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
              activeFilter === f.id
                ? 'bg-slate-900 text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications Cards List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="font-black text-slate-900 text-base">Você está em dia!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeFilter === 'unread'
              ? 'Todas as suas notificações foram visualizadas.'
              : 'Nenhuma notificação encontrada para o filtro selecionado.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const isUnread = !n.read;

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isUnread
                    ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="p-3 rounded-2xl bg-slate-100/90 shrink-0 border border-slate-200/80">
                    {getIcon(n.type)}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm leading-snug ${isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                        {n.title}
                      </h4>
                      {isUnread && (
                        <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                          Nova
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {n.message}
                    </p>

                    <span className="text-[11px] text-slate-400 block pt-0.5">
                      📅 {n.timestamp || 'Recente'}
                    </span>
                  </div>
                </div>

                {n.actionTab && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(n);
                    }}
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <span>{n.actionText || "Ver detalhes"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
