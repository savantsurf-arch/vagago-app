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
  RotateCcw,
  Home,
  UserCog
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
    openEditProfileModal,
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
  const safeUser = currentUser || {};
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



  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20 gap-4">
            
            {/* Left side: Logo */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setActiveTab('landing')}
                className="flex items-center group text-left focus:outline-none cursor-pointer shrink-0"
              >
                <img
                  src="/logo-vagago.png"
                  alt="VagaGo"
                  className="h-10 sm:h-12 w-auto object-contain transition transform group-hover:scale-105"
                />
              </button>
            </div>

            {/* Right side: Navigation links + Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-semibold mr-1">

                
                {/* 1. Unauthenticated Visitor Navigation */}
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

                    {/* Dynamic Host vs Driver Button */}
                    {activeTab === 'host_landing' ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab('landing')}
                        className="bg-sky-50 hover:bg-sky-100 text-sky-800 font-extrabold px-3.5 py-1.5 rounded-xl border border-sky-200 transition flex items-center gap-1.5 ml-1 cursor-pointer"
                        title="Ir para a página de motoristas buscando vagas"
                      >
                        <Car className="w-3.5 h-3.5 text-sky-600" />
                        <span>🚗 Sou Motorista</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveTab('host_landing')}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold px-3.5 py-1.5 rounded-xl border border-emerald-200 transition flex items-center gap-1.5 ml-1 cursor-pointer"
                        title="Alugue sua garagem parada e ganhe renda extra"
                      >
                        <Home className="w-3.5 h-3.5 text-emerald-600" />
                        <span>🏠 Seja um Anfitrião</span>
                      </button>
                    )}
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
                      <Home className="w-3.5 h-3.5 text-emerald-600" />
                      <span>🏠 Modo Anfitrião</span>
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
                      onClick={() => setActiveTab('owner_reservas')}
                      className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                        activeTab === 'owner_reservas' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      Reservas Recebidas
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

              {/* Notification Button */}
              <button
                type="button"
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
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

                  <button
                    type="button"
                    onClick={openEditProfileModal}
                    className="flex items-center gap-2 group p-1 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    title="Editar Meu Perfil (Nome, Foto, Telefone e Bio)"
                  >
                    <img
                      src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80"}
                      alt={currentUser?.name || "Usuário"}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-sky-500/20 group-hover:ring-sky-500 transition"
                    />
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                        <span>{currentUser?.name || "Usuário"}</span>
                        <UserCog className="w-3 h-3 text-slate-400 group-hover:text-sky-600 transition" />
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          activeRole === 'CLIENTE' ? 'bg-sky-500' : activeRole === 'PROPRIETÁRIO' ? 'bg-emerald-500' : 'bg-purple-500'
                        }`} />
                        {activeRole === 'PROPRIETÁRIO' ? 'Anfitrião' : activeRole === 'CLIENTE' ? 'Motorista' : 'Admin'}
                      </div>
                    </div>
                  </button>

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
                <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200">
                  <button
                    type="button"
                    onClick={openLoginModal}
                    className="text-xs font-bold text-slate-700 hover:text-sky-600 px-2.5 sm:px-3 py-2 rounded-xl hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-sky-600" />
                    <span>Entrar</span>
                  </button>

                  <button
                    type="button"
                    onClick={openRegisterModal}
                    className="bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-extrabold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-xs hover:shadow-sm transition flex items-center gap-1 cursor-pointer"
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
                  <Search className="w-4 h-4 text-sky-600" /> Encontrar no Mapa
                </button>

                {activeTab === 'host_landing' ? (
                  <button
                    type="button"
                    onClick={() => { setActiveTab('landing'); setIsMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-lg flex items-center gap-2"
                  >
                    <Car className="w-4 h-4 text-sky-600" /> 🚗 Sou Motorista
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setActiveTab('host_landing'); setIsMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-2"
                  >
                    <Home className="w-4 h-4 text-emerald-600" /> 🏠 Seja um Anfitrião (Alugue sua Vaga)
                  </button>
                )}

                
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

            {/* User Profile & Logout in Mobile Menu */}
            {isAuthenticated && (
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    openEditProfileModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm font-bold text-sky-700 bg-sky-50/70 hover:bg-sky-100 rounded-xl flex items-center gap-2 transition cursor-pointer"
                >
                  <UserCog className="w-4 h-4 text-sky-600" /> Editar Meu Perfil
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" /> Sair da Conta
                </button>
              </div>
            )}
          </div>
        )}
      </header>



      <NotificationsDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
