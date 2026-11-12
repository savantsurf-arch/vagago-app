import React from 'react';
import { useApp } from '../context/AppContext';
import { Car, MapPin, Calendar, QrCode, Home } from 'lucide-react';

export const MobileBottomNav = ({ onOpenDepositModal = () => {} }) => {
  const { activeTab, setActiveTab, activeRole } = useApp();

  // Não sobrepor a tela cheia de busca/mapa nem o painel admin
  if (activeTab === 'search' || activeTab === 'favorites' || activeTab === 'admin_dashboard') {
    return null;
  }

  const isHostMode = activeRole === 'PROPRIETÁRIO';

  const navItems = isHostMode
    ? [
        { id: 'owner_dashboard', label: 'Painel', icon: Home },
        { id: 'owner_reservas', label: 'Reservas', icon: Calendar },
        { id: 'search', label: 'Mapa', icon: MapPin },
        { id: 'owner_finance', label: 'Pix', icon: QrCode }
      ]
    : [
        { id: 'landing', label: 'Estacionar', icon: Car },
        { id: 'search', label: 'Mapa', icon: MapPin },
        { id: 'client_dashboard', label: 'Reservas', icon: Calendar },
        { id: 'pix_wallet', label: 'Pix', icon: QrCode, action: onOpenDepositModal }
      ];

  return (
    <nav
      aria-label="Navegação rápida mobile"
      className="md:hidden fixed bottom-3 left-4 right-4 z-40 pointer-events-none"
    >
      <div className="pointer-events-auto max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_30px_rgba(15,23,42,0.18)] border border-slate-200/90 px-2.5 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (typeof item.action === 'function') {
                  item.action();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className="min-w-[56px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-full px-2 py-1 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm scale-105'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.3]" />
              </span>
              <span
                className={`text-[11px] leading-none font-extrabold ${
                  isActive ? 'text-sky-700' : 'text-slate-600'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
