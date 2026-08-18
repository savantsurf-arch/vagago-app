import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCircle2, Clock, X, AlertCircle, RefreshCw } from 'lucide-react';

export const NotificationsDrawer = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, setActiveTab, setIsBookingFlowOpen, parkingSpaces, setSelectedSpot } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white min-h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Notificações VagaGo</h3>
              <p className="text-xs text-slate-500">Alertas de reservas e pagamentos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Nenhuma notificação por enquanto.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-3.5 rounded-xl border transition relative ${
                  !n.read
                    ? 'bg-sky-50/60 border-sky-200 shadow-xs'
                    : 'bg-white border-slate-100'
                }`}
              >
                {!n.read && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-sky-500" />
                )}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {n.type === 'booking_confirmed' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {n.type === 'payment_approved' && <CheckCircle2 className="w-5 h-5 text-sky-500" />}
                    {n.type === 'upcoming_expiry' && <Clock className="w-5 h-5 text-amber-500 animate-bounce" />}
                    {!['booking_confirmed', 'payment_approved', 'upcoming_expiry'].includes(n.type) && (
                      <AlertCircle className="w-5 h-5 text-sky-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-sm">{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>

                    {/* Dynamic Renewal CTA for 15-30 min expiry alert */}
                    {n.type === 'upcoming_expiry' && (
                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-amber-800">Deseja estender sua estadia?</span>
                        <button
                          onClick={() => {
                            onClose();
                            if (parkingSpaces[0]) {
                              setSelectedSpot(parkingSpaces[0]);
                              setIsBookingFlowOpen(true);
                            }
                          }}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-2.5 py-1 rounded font-medium flex items-center gap-1 shadow-xs transition"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Renovar Reserva
                        </button>
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 mt-2 block">{n.timestamp}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
