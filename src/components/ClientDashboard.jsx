import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  Clock,
  Car,
  Heart,
  CreditCard,
  User,
  HelpCircle,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Plus,
  Trash2,
  Phone,
  Shield,
  Search,
  Compass,
  Navigation,
  Wallet,
  Share2,
  XCircle,
  PlusCircle
} from 'lucide-react';
import { openExternalNavigation } from '../services/geoUtils';
import { AddVehicleModal } from './AddVehicleModal';
import { HostChatModal } from './HostChatModal';
import { ReviewModal } from './ReviewModal';
import { GateOpenerModal } from './GateOpenerModal';
import { MessageSquare, Star, Zap } from 'lucide-react';

export const ClientDashboard = ({
  onOpenLogisticsTracker = () => {},
  onOpenExtendModal = () => {},
  onOpenDepositModal = () => {}
}) => {
  const {
    currentUser,
    bookings = [],
    cancelBooking,
    vehicles = [],
    addVehicle,
    favorites = [],
    parkingSpaces = [],
    openSpotDetails,
    setActiveTab,
    setIsScannerOpen
  } = useApp();

  const [clientTab, setClientTab] = useState('reservas'); // reservas, meustipos, favoritos, pagamentos, suporte
  const [selectedBookingForQR, setSelectedBookingForQR] = useState(null);
  const [shareNotice, setShareNotice] = useState('');
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);

  const [chatSpot, setChatSpot] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [reviewBooking, setReviewBooking] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const [gateBooking, setGateBooking] = useState(null);
  const [isGateOpen, setIsGateOpen] = useState(false);



  const safeUser = currentUser || { id: 'usr_1', name: 'Matheus Silva', email: 'matheus@cliente.com', phone: '(73) 98765-4321', credits: 20, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' };
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  const clientBookings = safeBookings.filter(b => b && (b.userId === safeUser.id || b.userEmail === safeUser.email));
  const activeBookings = clientBookings.filter(b => b && b.bookingStatus !== 'Cancelado');
  const upcomingBooking = activeBookings.find(b => b && (b.bookingStatus === 'Confirmado' || b.bookingStatus === 'Em Andamento'));
  
  const totalSpent = activeBookings.reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
  const favoriteSpots = parkingSpaces.filter(s => s && safeFavorites.includes(s.id));

  const handleShareBooking = (booking) => {
    if (!booking) return;
    const shareText = `🚗 *Reserva de Garagem VagaGo*\n📍 *Local:* ${booking.spaceTitle}\n📌 *Endereço:* ${booking.spaceAddress}\n⏰ *Horário:* ${booking.date} das ${booking.startTime} às ${booking.endTime}\n🚘 *Veículo:* ${booking.vehicle?.brand || 'Veículo'} (${booking.vehicle?.plate || ''})\n🧭 *Navegar no Google Maps:* https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.spaceAddress)}`;

    if (navigator.share) {
      navigator.share({
        title: `Reserva VagaGo - ${booking.spaceTitle}`,
        text: shareText
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setShareNotice(`Reserva #${booking.bookingNumber} copiada para compartilhar no WhatsApp!`);
      setTimeout(() => setShareNotice(''), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Greeting */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={safeUser.avatar}
            alt={safeUser.name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-white/20 shadow-md"
          />
          <div>
            <span className="text-xs font-bold text-sky-200 uppercase tracking-wider">Painel do Cliente</span>
            <h1 className="text-2xl sm:text-3xl font-black">Olá, {safeUser.name}!</h1>
            <p className="text-xs text-sky-100 mt-0.5">{safeUser.email} • {safeUser.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Wallet Banner */}
          <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/20 flex items-center gap-3">
            <div>
              <span className="text-[10px] text-sky-100 uppercase font-bold block">VagaGo Wallet</span>
              <span className="text-base font-black text-white">R$ {Number(safeUser.credits || 20).toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={onOpenDepositModal}

              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Recarregar</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab('search')}
            className="bg-white hover:bg-sky-50 text-sky-700 font-extrabold text-xs px-4 py-3 rounded-2xl shadow-md transition flex items-center gap-2 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Encontrar vaga</span>
          </button>
        </div>
      </div>

      {shareNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{shareNotice}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Next Booking Metric Card */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase">Próxima Reserva</div>
          <div className="text-lg font-black text-slate-900 truncate">
            {upcomingBooking ? upcomingBooking.spaceTitle : "Nenhuma pendente"}
          </div>
          {upcomingBooking && (
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{upcomingBooking.date} às {upcomingBooking.startTime}</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase">Reservas Realizadas</div>
          <div className="text-2xl font-black text-sky-600">{activeBookings.length}</div>
          <div className="text-[11px] text-slate-500">Histórico completo</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Gasto</div>
          <div className="text-2xl font-black text-emerald-600">R$ {totalSpent.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500">Comprovantes salvos</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase">Vagas Favoritas</div>
          <div className="text-2xl font-black text-rose-500">{favoriteSpots.length}</div>
          <div className="text-[11px] text-slate-500">Salvas na sua lista</div>
        </div>

      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setClientTab('reservas')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
            clientTab === 'reservas' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Minhas Reservas ({clientBookings.length})
        </button>

        <button
          onClick={() => setClientTab('veiculos')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
            clientTab === 'veiculos' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Car className="w-4 h-4" />
          Meus Veículos ({vehicles.length})
        </button>

        <button
          onClick={() => setClientTab('favoritos')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
            clientTab === 'favoritos' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          Vagas Favoritas ({favoriteSpots.length})
        </button>
      </div>

      {/* TAB CONTENT: Minhas Reservas */}
      {clientTab === 'reservas' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Suas Reservas de Garagem</h3>
          
          {clientBookings.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
              <Calendar className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">Você ainda não possui reservas efetuadas.</p>
            </div>
          ) : (
            clientBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {b.bookingNumber}
                    </span>
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                      b.bookingStatus === 'Confirmado' ? 'bg-emerald-100 text-emerald-800' :
                      b.bookingStatus === 'Em Andamento' ? 'bg-amber-100 text-amber-800' :
                      b.bookingStatus === 'Cancelado' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {b.bookingStatus}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base">{b.spaceTitle}</h4>
                  <p className="text-xs text-slate-500">{b.spaceAddress}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                    <span>Data: <strong>{b.date}</strong></span>
                    <span>•</span>
                    <span>Horário: <strong>{b.startTime} às {b.endTime}</strong></span>
                    <span>•</span>
                    <span>Veículo: <strong>{b.vehicle.brand} ({b.vehicle.plate})</strong></span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                  {b.bookingStatus !== 'Cancelado' && (
                    <>
                      <button
                        type="button"
                        onClick={() => { setGateBooking(b); setIsGateOpen(true); }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                        title="Simular Abertura de Portão Inteligente"
                      >
                        <Zap className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                        <span>Abrir Portão</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setChatSpot({ title: b.spaceTitle, ownerName: 'Juliana Santos (Anfitriã)', ownerPhone: '(73) 99123-4567' }); setIsChatOpen(true); }}
                        className="bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition border border-sky-200 cursor-pointer"
                        title="Falar com o Anfitrião no Chat ou WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                        <span>Chat Anfitrião</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setReviewBooking(b); setIsReviewOpen(true); }}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition border border-amber-200 cursor-pointer"
                        title="Avaliar Estadia pós Check-out"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>Avaliar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenExtendModal(b)}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs"
                        title="Estender o tempo de permanência da vaga em 1 clique"
                      >
                        <Clock className="w-4 h-4 text-white" />
                        <span>⏱️ Estender Tempo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareBooking(b)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                        title="Compartilhar rota e dados no WhatsApp"
                      >
                        <Share2 className="w-4 h-4 text-sky-600" />
                        <span>Compartilhar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenLogisticsTracker(b)}
                        className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs"
                        title="Acompanhar Rota e ETA no Google Maps"
                      >
                        <Navigation className="w-4 h-4 text-sky-200" />
                        <span>Acompanhar Trajeto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedBookingForQR(b)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
                      >
                        <QrCode className="w-4 h-4 text-emerald-400" />
                        <span>QR Code</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Deseja mesmo cancelar esta reserva e receber o reembolso dos créditos?")) {
                            cancelBooking(b.id);
                          }
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                        title="Cancelar reserva e reembolsar créditos"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>

                    </>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: Meus Veículos */}
      {clientTab === 'veiculos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Sua Garagem Virtual</h3>
              <p className="text-xs text-slate-500">Cadastre seus veículos para agilizar suas reservas de vaga</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddVehicleModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Veículo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-900 text-white font-mono text-xs font-black px-2.5 py-0.5 rounded-lg tracking-wider">
                      {v.plate}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {v.type || 'Carro Passeio'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm pt-1">{v.brand} {v.model}</h4>
                  <p className="text-xs text-slate-500">Cor: {v.color || 'Prata'}</p>
                </div>
                {v.isDefault && (
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-sky-200">
                    ★ Principal
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Modal to Add New Vehicle */}
          <AddVehicleModal
            isOpen={isAddVehicleModalOpen}
            onClose={() => setIsAddVehicleModalOpen(false)}
          />
        </div>
      )}


      {/* TAB CONTENT: Vagas Favoritas */}
      {clientTab === 'favoritos' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Suas Garagens Favoritas</h3>
          
          {favoriteSpots.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
              <Heart className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">Nenhuma vaga favoritada ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteSpots.map((spot) => (
                <div key={spot.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-4 items-center">
                  <img src={spot.photos[0]} alt={spot.title} className="w-20 h-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">{spot.title}</h4>
                    <p className="text-xs text-slate-500">{spot.address}</p>
                    <span className="text-sm font-black text-sky-600 mt-1 block">R$ {spot.priceHourly}/h</span>
                  </div>
                  <button
                    onClick={() => openSpotDetails(spot)}
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-2 rounded-xl"
                  >
                    Reservar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QR Code Popup Modal */}
      {selectedBookingForQR && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full text-center space-y-4 animate-in fade-in">
            <h3 className="font-black text-lg text-slate-900">QR Code da Reserva</h3>
            <p className="text-xs text-slate-500">{selectedBookingForQR.spaceTitle}</p>

            <div className="bg-slate-900 p-4 rounded-2xl inline-block">
              <div className="bg-white p-3 rounded-xl inline-block">
                <QRCodeSVG value={selectedBookingForQR.qrCodeData} size={180} />
              </div>
              <div className="font-mono text-xs text-sky-400 font-bold mt-2">
                {selectedBookingForQR.bookingNumber}
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Veículo autorizado: <strong className="text-slate-800">{selectedBookingForQR.vehicle.plate}</strong>
            </p>

            <button
              type="button"
              onClick={() => setSelectedBookingForQR(null)}
              className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Feature Modals */}
      <HostChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        spot={chatSpot}
        ownerName={chatSpot?.ownerName}
        ownerPhone={chatSpot?.ownerPhone}
      />

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        booking={reviewBooking}
      />

      <GateOpenerModal
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
        booking={gateBooking}
      />

    </div>
  );
};

