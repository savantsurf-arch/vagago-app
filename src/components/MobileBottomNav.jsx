import React from 'react';
import { useApp } from '../context/AppContext';
import { Car, MapPin, Heart, Home } from 'lucide-react';

export const MobileBottomNav = () => {
  const { activeTab, setActiveTab, activeRole, isAuthenticated } = useApp();

  // Não sobrepor o mapa em tela cheia nem o painel admin
  if (activeTab === 'search' || activeTab === 'admin_dashboard') {
    return null;
  }

  const isHostMode = activeRole === 'PROPRIETÁRIO';

  const navItems = [
    { id: 'landing', label: 'Vagas', icon: Car },
    { id: 'search', label: 'Mapa', icon: MapPin },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    {
      id: 'host_landing',
      label: 'Anfitrião',
      icon: Home,
      isActiveMatch: () => activeTab === 'host_landing' || String(activeTab).startsWith('owner_'),
      action: () => {
        if (isAuthenticated && isHostMode) {
          setActiveTab('owner_dashboard');
        } else {
          setActiveTab('host_landing');
        }
      }
    }
  ];

  return (
    <nav
      aria-label="Navegação rápida mobile"
      className="md:hidden fixed bottom-3 left-4 right-4 z-40 pointer-events-none"
    >
      <div className="pointer-events-auto max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_30px_rgba(0,42,102,0.18)] border border-slate-200/90 px-2.5 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActiveMatch ? item.isActiveMatch() : activeTab === item.id;

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
                    ? 'bg-gradient-to-r from-[#002A66] to-[#017AFC] text-white shadow-sm scale-105'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.3]" />
              </span>
              <span
                className={`text-[11px] leading-none font-extrabold ${
                  isActive ? 'text-[#002A66]' : 'text-slate-600'
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
