import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NotificationsDrawer } from './NotificationsDrawer';
import {
  MapPin,
  Search,
  Calendar,
  Heart,
  User,
  Bell,
  Menu,
  X,
  LayoutDashboard,
  Car,
  KeyRound,
  ShieldCheck,
  DollarSign,
  Gift,
  HelpCircle,
  Clock,
  Sparkles,
  LogOut,
  LogIn,
  UserPlus,
  RotateCcw
} from 'lucide-react';

export const Navbar = ({ onOpenDepositModal = () => {} }) => {

  const {
    activeRole,
    switchRole,
    searchLocation,
    isAuthenticated,
    currentUser,
    logout,
    setIsAuthModalOpen,
    openLoginModal,
    openRegisterModal,
    notifications = [],
    favorites = [],
    setIsReferralModalOpen,
    activeTab,
    setActiveTab,
    syncGlobalParkingSpaces
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const unreadCount = safeNotifications.filter(n => n && !n.read).length;


  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo & Slogan */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('landing')}
                className="flex items-center gap-3 group text-left focus:outline-none"
              >
                <img
                  src="/logo-vagago.png"
                  alt="VagaGo Logo"
                  className="h-10 w-auto object-contain transition transform group-hover:scale-105"
                />
              </button>

              {/* Location indicator desktop & Live Sync Button */}
              <div className="hidden lg:flex items-center gap-2">
                <div className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200 text-xs font-bold text-emerald-900 transition cursor-pointer">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate max-w-[220px]">📍 {searchLocation || "Itabuna, BA"} (Cidade Piloto 🚀)</span>
                </div>

                <button
                  onClick={syncGlobalParkingSpaces}
                  className="bg-sky-50 hover:bg-sky-100 text-sky-700 px-3 py-1.5 rounded-full border border-sky-200 text-xs font-extrabold flex items-center gap-1 transition shadow-2xs"
                  title="Sincronizar Vagas em Tempo Real entre Dispositivos"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
                  <span>Sincronizar Vagas</span>
                </button>
              </div>


            </div>

            {/* Navigation links by Authentication & Role */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-semibold">
              
              {/* 1. Unauthenticated Visitor Navigation (Default Public View) */}
              {!isAuthenticated && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('landing')}
                    className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                      activeTab === 'landing' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Início
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('search')}
                    className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'search' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5 text-sky-600" />
                    Encontrar vaga
                  </button>
                  
                  {/* Highlighted Host Landing Link */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('host_landing')}
                    className={`px-3.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 ml-2 cursor-pointer ${
                      activeTab === 'host_landing'
                        ? 'bg-emerald-600 text-white font-extrabold border-emerald-600 shadow-xs'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border-emerald-200'
                    }`}
                    title="Alugue sua garagem parada e ganhe renda extra"
                  >
                    <Car className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Seja um Anfitrião</span>
                  </button>
                </>
              )}

              {/* 2. Authenticated DRIVER (Cliente) Navigation */}
              {isAuthenticated && activeRole === 'CLIENTE' && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('landing')}
                    className={`px-3 py-2 rounded-xl transition cursor-pointer ${
                      activeTab === 'landing' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Início
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('search')}
                    className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'search' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5 text-sky-600" />
                    Encontrar vaga
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('client_dashboard')}
                    className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'client_dashboard' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                    Minhas reservas
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('favorites')}
                    className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'favorites' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Favoritos ({safeFavorites.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      switchRole('PROPRIETÁRIO');
                      setActiveTab('owner_dashboard');
                    }}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 transition flex items-center gap-1.5 ml-1 cursor-pointer"
                    title="Acessar painel para alugar sua garagem e gerar renda"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Modo Anfitrião</span>
                  </button>
                </>
              )}

              {/* 3. Authenticated HOST (Proprietário) Navigation */}
              {isAuthenticated && activeRole === 'PROPRIETÁRIO' && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('owner_dashboard')}
                    className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'owner_dashboard' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                    Painel do Anfitrião
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('owner_spots')}
                    className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'owner_spots' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5 text-emerald-600" />
                    Minhas Garagens
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('owner_finance')}
                    className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'owner_finance' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Financeiro & Saques
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      switchRole('CLIENTE');
                      setActiveTab('landing');
                    }}
                    className="bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold px-3 py-1.5 rounded-xl border border-sky-200 transition flex items-center gap-1.5 ml-1 cursor-pointer"
                    title="Trocar para visão de motorista buscando vagas"
                  >
                    <Search className="w-3.5 h-3.5 text-sky-600" />
                    <span>Modo Motorista</span>
                  </button>
                </>
              )}

              {/* 4. Authenticated ADMIN Navigation */}
              {isAuthenticated && activeRole === 'ADMINISTRADOR' && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('admin_dashboard')}
                    className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'admin_dashboard' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    Painel Admin Global
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      switchRole('CLIENTE');
                      setActiveTab('landing');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver como Cliente</span>
                  </button>
                </>
              )}

            </nav>

            {/* Right side Actions & User */}
            <div className="flex items-center gap-3">
              {/* Notification Button */}
              <button
                type="button"
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition cursor-pointer"
                title="Notificações"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-sky-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User State & Login/Logout Buttons */}
              {isAuthenticated && currentUser ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  
                  {/* Wallet Pill */}
                  <button
                    type="button"
                    onClick={onOpenDepositModal}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 transition cursor-pointer"
                    title="VagaGo Wallet - Recarregar Créditos"
                  >
                    <span>R$ {Number(currentUser?.credits || 0).toFixed(2)}</span>
                  </button>

                  <img
                    src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80"}
                    alt={currentUser?.name || "Usuário"}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-sky-500/20"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name || "Usuário"}</div>
                    <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        activeRole === 'CLIENTE' ? 'bg-sky-500' : activeRole === 'PROPRIETÁRIO' ? 'bg-emerald-500' : 'bg-purple-500'
                      }`} />
                      {activeRole === 'PROPRIETÁRIO' ? 'Anfitrião' : activeRole === 'CLIENTE' ? 'Motorista' : 'Admin'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={logout}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition ml-1 cursor-pointer"
                    title="Sair da Conta (Logout)"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

              ) : (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <button
                    type="button"
                    onClick={openLoginModal}
                    className="text-xs font-extrabold text-slate-700 hover:text-sky-600 px-3 py-2 rounded-xl hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-sky-600" />
                    <span>Entrar</span>
                  </button>

                  <button
                    type="button"
                    onClick={openRegisterModal}
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-sky-200" />
                    <span>Criar Conta</span>
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2">
            
            {/* Unauthenticated Mobile Menu */}
            {!isAuthenticated && (
              <>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Navegação Principal</div>
                <button
                  type="button"
                  onClick={() => { setActiveTab('landing'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-sky-50 rounded-lg flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-sky-600" /> Início / Buscar Vagas
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('search'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-sky-50 rounded-lg flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-sky-600" /> Encontrar no Mapa
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('host_landing'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-2"
                >
                  <Car className="w-4 h-4 text-emerald-600" /> Seja um Anfitrião (Alugue sua Vaga)
                </button>
                
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { openLoginModal(); setIsMobileMenuOpen(false); }}
                    className="flex-1 py-2 text-center text-xs font-extrabold text-slate-700 bg-slate-100 rounded-xl"
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => { openRegisterModal(); setIsMobileMenuOpen(false); }}
                    className="flex-1 py-2 text-center text-xs font-extrabold text-white bg-sky-600 rounded-xl"
                  >
                    Criar Conta
                  </button>
                </div>
              </>
            )}

            {/* Authenticated DRIVER Mobile Menu */}
            {isAuthenticated && activeRole === 'CLIENTE' && (
              <>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Menu do Motorista</div>
                <button
                  type="button"
                  onClick={() => { setActiveTab('landing'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-sky-50 rounded-lg flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-sky-600" /> Início / Buscar Vagas
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('client_dashboard'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-sky-50 rounded-lg flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-sky-600" /> Minhas Reservas & QR Code
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('favorites'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-sky-50 rounded-lg flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-rose-500" /> Vagas Favoritas
                </button>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      switchRole('PROPRIETÁRIO');
                      setActiveTab('owner_dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-600" /> Alternar para Modo Anfitrião
                  </button>
                </div>
              </>
            )}

            {/* Authenticated HOST Mobile Menu */}
            {isAuthenticated && activeRole === 'PROPRIETÁRIO' && (
              <>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Menu do Anfitrião</div>
                <button
                  type="button"
                  onClick={() => { setActiveTab('owner_dashboard'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-emerald-50 rounded-lg flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" /> Painel do Anfitrião
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('owner_spots'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-emerald-50 rounded-lg flex items-center gap-2"
                >
                  <Car className="w-4 h-4 text-emerald-600" /> Minhas Garagens
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('owner_finance'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-emerald-50 rounded-lg flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Financeiro & Saques
                </button>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      switchRole('CLIENTE');
                      setActiveTab('landing');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-lg flex items-center gap-2"
                  >
                    <Search className="w-4 h-4 text-sky-600" /> Alternar para Modo Motorista
                  </button>
                </div>
              </>
            )}

            {/* Authenticated ADMIN Mobile Menu */}
            {isAuthenticated && activeRole === 'ADMINISTRADOR' && (
              <button
                type="button"
                onClick={() => { setActiveTab('admin_dashboard'); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-purple-50 rounded-lg flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" /> Painel de Controle Admin
              </button>
            )}
          </div>
        )}
      </header>


      <NotificationsDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
