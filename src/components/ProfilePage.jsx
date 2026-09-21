import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AddVehicleModal } from './AddVehicleModal';
import {
  User,
  Car,
  Calendar,
  Heart,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  Phone,
  Mail,
  Key,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Lock,
  Star,
  RefreshCw,
  Home,
  Check
} from 'lucide-react';

export const ProfilePage = () => {
  const {
    currentUser,
    isAuthenticated,
    openLoginModal,
    openEditProfileModal,
    vehicles = [],
    deleteVehicle,
    setDefaultVehicle,
    bookings = [],
    favorites = [],
    parkingSpaces = [],
    notifications = [],
    openSpotDetails,
    activeRole,
    switchRole,
    setActiveTab,
    logout
  } = useApp();

  // Active section inside "Minha conta"
  const [activeSection, setActiveSection] = useState('dados_pessoais'); // 'dados_pessoais' | 'veiculos' | 'reservas' | 'favoritos' | 'notificacoes' | 'configuracoes'

  // Vehicle modal state (add or edit)
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState(null);

  // Vehicle deletion confirmation state
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // Settings mock toggles
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [privacyPlate, setPrivacyPlate] = useState(true);

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-900">Acesse seu Perfil VagaGo</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Faça login ou crie sua conta para gerenciar seus dados pessoais, veículos, reservas e garagens.
          </p>
        </div>
        <button
          type="button"
          onClick={openLoginModal}
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-sky-600/30 transition cursor-pointer"
        >
          Entrar ou Criar Conta
        </button>
      </div>
    );
  }

  // Filter vehicles for currentUser
  const safeUserId = currentUser.id || 'usr_1';
  const userVehicles = vehicles.filter(
    (v) =>
      v &&
      (v.userId === safeUserId ||
        v.user_id === safeUserId ||
        (!v.userId && !v.user_id) ||
        safeUserId === 'usr_1' ||
        v.userId === 'usr_1')
  );

  // Filter user bookings
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const clientBookings = safeBookings.filter(
    (b) =>
      b &&
      (b.userId === currentUser.id ||
        b.user_id === currentUser.id ||
        b.driverId === currentUser.id ||
        b.driver_id === currentUser.id ||
        (b.userEmail && currentUser.email && b.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
        (b.driverEmail && currentUser.email && b.driverEmail.toLowerCase() === currentUser.email.toLowerCase()))
  );

  // Favorite spots
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const favoriteSpots = parkingSpaces.filter((s) => s && safeFavorites.includes(s.id));

  // Unread notifications count
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const handleOpenAddVehicle = () => {
    setVehicleToEdit(null);
    setIsVehicleModalOpen(true);
  };

  const handleOpenEditVehicle = (vehicle) => {
    setVehicleToEdit(vehicle);
    setIsVehicleModalOpen(true);
  };

  const handleConfirmDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    setDeleteError('');
    setDeleteSuccess('');

    if (typeof deleteVehicle === 'function') {
      const res = await deleteVehicle(vehicleToDelete.id);
      if (res && res.success === false) {
        setDeleteError(res.reason || 'Não foi possível excluir o veículo.');
        return;
      }
    }

    setDeleteSuccess(`Veículo ${vehicleToDelete.brand} ${vehicleToDelete.model} excluído com sucesso.`);
    setTimeout(() => {
      setDeleteSuccess('');
      setVehicleToDelete(null);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* Top Header Profile Card */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative group shrink-0">
            <img
              src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80"}
              alt={currentUser.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-white/20 shadow-md"
            />
            <button
              type="button"
              onClick={openEditProfileModal}
              className="absolute inset-0 bg-slate-900/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
              title="Trocar Foto"
            >
              <Edit2 className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                activeRole === 'PROPRIETÁRIO'
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                  : activeRole === 'ADMINISTRADOR'
                  ? 'bg-purple-500/20 text-purple-200 border-purple-400/30'
                  : 'bg-sky-500/20 text-sky-200 border-sky-400/30'
              }`}>
                {activeRole === 'PROPRIETÁRIO' ? 'Anfitrião de Vaga' : activeRole === 'ADMINISTRADOR' ? 'Administrador' : 'Motorista'}
              </span>

              <span className="bg-white/10 text-white/90 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/15">
                Conta Verificada
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black truncate">{currentUser.name}</h1>
            <p className="text-xs text-sky-100 flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>{currentUser.email}</span>
            </p>
            {currentUser.phone && (
              <p className="text-xs text-sky-100 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span>{currentUser.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {/* Role Switcher */}
          <button
            type="button"
            onClick={() => {
              const newRole = activeRole === 'PROPRIETÁRIO' ? 'CLIENTE' : 'PROPRIETÁRIO';
              switchRole(newRole);
              if (newRole === 'PROPRIETÁRIO') {
                setActiveTab('owner_dashboard');
              } else {
                setActiveTab('landing');
              }
            }}
            className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-4 py-3 rounded-2xl border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            title="Alternar entre o papel de Motorista e Anfitrião sem trocar de conta"
          >
            {activeRole === 'PROPRIETÁRIO' ? (
              <>
                <Car className="w-4 h-4 text-sky-300" />
                <span>Alternar p/ Modo Motorista</span>
              </>
            ) : (
              <>
                <Home className="w-4 h-4 text-emerald-300" />
                <span>Alternar p/ Modo Anfitrião</span>
              </>
            )}
          </button>

          {/* Edit Profile Button */}
          <button
            type="button"
            onClick={openEditProfileModal}
            className="bg-white hover:bg-sky-50 text-slate-900 font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Editar perfil</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: Sidebar Menu + Section Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Menu ("Minha conta") */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white p-3 rounded-3xl border border-slate-200 shadow-sm space-y-1">
            <div className="px-3 py-2 text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Minha conta
            </div>

            <button
              type="button"
              onClick={() => setActiveSection('dados_pessoais')}
              className={`w-full text-left px-3.5 py-3 rounded-2xl font-bold text-xs flex items-center justify-between transition cursor-pointer ${
                activeSection === 'dados_pessoais'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4" />
                <span>👤 Dados pessoais</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${activeSection === 'dados_pessoais' ? 'text-white' : 'text-slate-400'}`} />
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('veiculos')}
              className={`w-full text-left px-3.5 py-3 rounded-2xl font-bold text-xs flex items-center justify-between transition cursor-pointer ${
                activeSection === 'veiculos'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Car className="w-4 h-4" />
                <span>🚗 Meus veículos</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeSection === 'veiculos' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {userVehicles.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('reservas')}
              className={`w-full text-left px-3.5 py-3 rounded-2xl font-bold text-xs flex items-center justify-between transition cursor-pointer ${
                activeSection === 'reservas'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4" />
                <span>📅 Minhas reservas</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeSection === 'reservas' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {clientBookings.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('favoritos')}
              className={`w-full text-left px-3.5 py-3 rounded-2xl font-bold text-xs flex items-center justify-between transition cursor-pointer ${
                activeSection === 'favoritos'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4" />
                <span>❤️ Favoritos</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeSection === 'favoritos' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {favoriteSpots.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('notificacoes')}
              className={`w-full text-left px-3.5 py-3 rounded-2xl font-bold text-xs flex items-center justify-between transition cursor-pointer ${
                activeSection === 'notificacoes'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4" />
                <span>🔔 Notificações</span>
              </div>
              {unreadNotifs > 0 && (
                <span className="bg-sky-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {unreadNotifs}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('configuracoes')}
              className={`w-full text-left px-3.5 py-3 rounded-2xl font-bold text-xs flex items-center justify-between transition cursor-pointer ${
                activeSection === 'configuracoes'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>⚙️ Configurações</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${activeSection === 'configuracoes' ? 'text-white' : 'text-slate-400'}`} />
            </button>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Deseja mesmo sair da sua conta?")) {
                    logout();
                    setActiveTab('landing');
                  }
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-2xl font-bold text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>🚪 Sair da conta</span>
              </button>
            </div>

          </div>

          {/* Wallet Mini Banner */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Carteira VagaGo</span>
              </span>
              <span className="font-black text-emerald-700 text-sm">
                R$ {Number(currentUser.credits || 0).toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Use seus créditos para pagar reservas instantâneas sem filas.
            </p>
          </div>
        </div>

        {/* Section Body */}
        <div className="lg:col-span-3 space-y-6">

          {/* 1. SEÇÃO: DADOS PESSOAIS */}
          {activeSection === 'dados_pessoais' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Dados Pessoais</h3>
                  <p className="text-xs text-slate-500">Informações da sua conta no VagaGo</p>
                </div>
                <button
                  type="button"
                  onClick={openEditProfileModal}
                  className="bg-sky-50 hover:bg-sky-100 text-sky-700 font-extrabold text-xs px-4 py-2 rounded-xl border border-sky-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar dados</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Nome Completo</span>
                  <p className="font-extrabold text-slate-900 text-sm">{currentUser.name}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">E-mail</span>
                  <p className="font-extrabold text-slate-900 text-sm">{currentUser.email}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Telefone / WhatsApp</span>
                  <p className="font-extrabold text-slate-900 text-sm">{currentUser.phone || "Não informado"}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Chave PIX</span>
                  <p className="font-extrabold text-slate-900 text-sm">{currentUser.pixKey || currentUser.pix_key || "Não cadastrada"}</p>
                </div>

                <div className="sm:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Apresentação / Bio</span>
                  <p className="text-slate-700 font-medium italic leading-relaxed">
                    {currentUser.bio ? `"${currentUser.bio}"` : "Nenhuma biografia informada ainda. Clique em editar dados para adicionar."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. SEÇÃO: MEUS VEÍCULOS */}
          {activeSection === 'veiculos' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Meus Veículos</h3>
                  <p className="text-xs text-slate-500">
                    Gerencie seus carros e motos para agilizar suas reservas
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddVehicle}
                  className="bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-sky-600/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Adicionar veículo</span>
                </button>
              </div>

              {deleteSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{deleteSuccess}</span>
                </div>
              )}

              {deleteError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              {/* Vehicle Cards Grid */}
              {userVehicles.length === 0 ? (
                /* Estado Vazio */
                <div className="p-12 bg-slate-50/70 border border-slate-200 rounded-3xl text-center space-y-4">
                  <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                    <Car className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h4 className="font-extrabold text-slate-800 text-base">
                      Você ainda não cadastrou nenhum veículo.
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Cadastre seu veículo para facilitar e agilizar suas próximas reservas de garagem.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddVehicle}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-md transition inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Adicionar veículo</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userVehicles.map((v) => (
                    <div
                      key={v.id}
                      className={`p-5 rounded-3xl border transition flex flex-col justify-between gap-4 ${
                        v.isDefault || v.is_default
                          ? 'bg-sky-50/40 border-sky-300 ring-2 ring-sky-200 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="p-2.5 bg-slate-100 rounded-2xl text-slate-700">
                            <Car className="w-6 h-6 text-sky-600" />
                          </div>

                          <div className="flex items-center gap-1.5">
                            {(v.isDefault || v.is_default) && (
                              <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-sky-200 flex items-center gap-1">
                                <Star className="w-3 h-3 fill-sky-600 text-sky-600" />
                                <span>Principal</span>
                              </span>
                            )}
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {v.type || 'Carro'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base">
                            {v.brand} {v.model}
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            Cor: {v.color || 'Prata'}
                          </span>
                        </div>

                        <div>
                          <span className="bg-slate-900 text-white font-mono text-xs font-black px-3 py-1 rounded-lg tracking-widest inline-block shadow-xs">
                            {v.plate}
                          </span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                        {!(v.isDefault || v.is_default) ? (
                          <button
                            type="button"
                            onClick={() => setDefaultVehicle(v.id)}
                            className="text-slate-500 hover:text-sky-600 font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Definir como veículo padrão para reservas"
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span>Tornar Principal</span>
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                            <Check className="w-3.5 h-3.5" />
                            <span>Padrão em reservas</span>
                          </span>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditVehicle(v)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                            title="Editar dados deste veículo"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError('');
                              setVehicleToDelete(v);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="Excluir este veículo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* 3. SEÇÃO: MINHAS RESERVAS */}
          {activeSection === 'reservas' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Minhas Reservas</h3>
                  <p className="text-xs text-slate-500">Histórico de reservas e garagens utilizadas</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('client_dashboard')}
                  className="bg-sky-50 hover:bg-sky-100 text-sky-700 font-extrabold text-xs px-4 py-2 rounded-xl border border-sky-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Ver painel completo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {clientBookings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-3">
                  <Calendar className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs">Você ainda não realizou nenhuma reserva de vaga.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('search')}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition inline-block cursor-pointer"
                  >
                    Encontrar uma Vaga Agora
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientBookings.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black bg-white px-2 py-0.5 rounded border border-slate-200">
                            #{b.bookingNumber}
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            b.bookingStatus === 'Confirmado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {b.bookingStatus}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm">{b.spaceTitle}</h5>
                        <p className="text-slate-500">{b.date} • {b.startTime} às {b.endTime}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-900 text-sm">
                          R$ {Number(b.totalPrice || 0).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('client_dashboard')}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl transition cursor-pointer text-xs"
                        >
                          Detalhes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. SEÇÃO: FAVORITOS */}
          {activeSection === 'favoritos' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Vagas Favoritas</h3>
                  <p className="text-xs text-slate-500">Garagens que você salvou para fácil acesso</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('favorites')}
                  className="bg-sky-50 hover:bg-sky-100 text-sky-700 font-extrabold text-xs px-4 py-2 rounded-xl border border-sky-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Ver todas no mapa</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {favoriteSpots.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Heart className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs">Nenhuma vaga adicionada aos favoritos ainda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteSpots.map((spot) => (
                    <div key={spot.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3.5">
                      <img
                        src={(spot.photos && spot.photos[0]) || spot.facadePhoto}
                        alt={spot.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-slate-900 text-xs truncate">{spot.title}</h5>
                        <p className="text-[11px] text-slate-500 truncate">{spot.address}</p>
                        <span className="font-black text-sky-600 text-xs mt-0.5 block">
                          R$ {spot.priceHourly}/hora
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openSpotDetails(spot)}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shrink-0 transition cursor-pointer"
                      >
                        Reservar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. SEÇÃO: NOTIFICAÇÕES */}
          {activeSection === 'notificacoes' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-900 text-lg">Notificações</h3>
                <p className="text-xs text-slate-500">Alertas e confirmações das suas reservas</p>
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Bell className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs">Você não tem notificações recentes.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-2xl border text-xs space-y-1 transition ${
                        notif.read ? 'bg-slate-50 border-slate-200' : 'bg-sky-50/60 border-sky-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{notif.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. SEÇÃO: CONFIGURAÇÕES & PRIVACIDADE */}
          {activeSection === 'configuracoes' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-900 text-lg">Configurações & Privacidade</h3>
                <p className="text-xs text-slate-500">Personalize suas preferências de segurança e avisos</p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Notificações Push & E-mail */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-black text-slate-800 uppercase text-[10px] tracking-wider block">
                    Comunicação & Alertas
                  </span>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">Notificações por E-mail</span>
                      <span className="text-[11px] text-slate-500">Receba comprovantes e avisos de confirmação de vaga</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifEmail}
                      onChange={(e) => setNotifEmail(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200/60">
                    <div>
                      <span className="font-bold text-slate-800 block">Alertas Push no Navegador</span>
                      <span className="text-[11px] text-slate-500">Avisos imediatos de tempo de permanência e check-in</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPush}
                      onChange={(e) => setNotifPush(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                    />
                  </label>
                </div>

                {/* Privacidade dos Veículos */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-black text-slate-800 uppercase text-[10px] tracking-wider block">
                    Privacidade do Veículo & Dados
                  </span>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">Proteção da Placa do Veículo</span>
                      <span className="text-[11px] text-slate-500">
                        A placa é compartilhada exclusivamente com o anfitrião da vaga após o pagamento confirmado.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyPlate}
                      onChange={(e) => setPrivacyPlate(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                    />
                  </label>
                </div>

                {/* Segurança da Conta */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-black text-slate-800 uppercase text-[10px] tracking-wider block">
                    Segurança
                  </span>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Conexão criptografada de ponta a ponta com certificados SSL 256-bit.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('terms')}
                    className="text-xs font-bold text-sky-600 hover:underline inline-block pt-1 cursor-pointer"
                  >
                    Ver Termos de Uso e Política de Privacidade da VagaGo
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Modal to Add / Edit Vehicle */}
      <AddVehicleModal
        isOpen={isVehicleModalOpen}
        vehicleToEdit={vehicleToEdit}
        onClose={() => {
          setIsVehicleModalOpen(false);
          setVehicleToEdit(null);
        }}
      />

      {/* Vehicle Deletion Confirmation Dialog */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white p-6 sm:p-7 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-lg">
                Tem certeza que deseja excluir este veículo?
              </h3>
              <p className="text-xs text-slate-500">
                Esta ação removerá o veículo da sua lista de opções para reservas futuras.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <span className="font-extrabold text-slate-900 block text-sm">
                {vehicleToDelete.brand} {vehicleToDelete.model}
              </span>
              <span className="font-mono font-black text-sky-600">
                Placa: {vehicleToDelete.plate}
              </span>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setVehicleToDelete(null);
                  setDeleteError('');
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition cursor-pointer text-xs"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteVehicle}
                className="flex-1 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-extrabold py-3 rounded-xl transition shadow-lg shadow-rose-600/30 cursor-pointer text-xs"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
