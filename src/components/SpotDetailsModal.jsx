import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { HostChatModal } from './HostChatModal';
import { MonthlySubscriptionModal } from './MonthlySubscriptionModal';
import {
  X,
  Star,
  MapPin,
  ShieldCheck,
  Zap,
  Lock,
  Clock,
  Car,
  CheckCircle,
  Calendar as CalendarIcon,
  ChevronRight,
  Heart,
  Phone,
  Info,
  Maximize2,
  Compass,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { InteractiveMap } from './InteractiveMap';
import { openExternalNavigation } from '../services/geoUtils';

export const SpotDetailsModal = () => {
  const {
    selectedSpot,
    setSelectedSpot,
    isSpotDetailsOpen,
    setIsSpotDetailsOpen,
    openBookingFlow,
    favorites = [],
    toggleFavorite
  } = useApp();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('18:00');

  const handleClose = () => {
    if (typeof setIsSpotDetailsOpen === 'function') {
      setIsSpotDetailsOpen(false);
    }
    if (typeof setSelectedSpot === 'function') {
      setSelectedSpot(null);
    }
  };

  useEffect(() => {
    if (!isSpotDetailsOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpotDetailsOpen]);

  if (!isSpotDetailsOpen || !selectedSpot) return null;

  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const isFav = safeFavorites.includes(selectedSpot.id);

  const safePhotos = Array.isArray(selectedSpot.photos) && selectedSpot.photos.length > 0
    ? selectedSpot.photos
    : [selectedSpot.facadePhoto || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80"];

  const safeFeatures = Array.isArray(selectedSpot.features) ? selectedSpot.features : ["Segurança 24h", "Portão Eletrônico"];
  const safeAllowedVehicles = Array.isArray(selectedSpot.allowedVehicles) ? selectedSpot.allowedVehicles : ["Passeio / SUV", "Moto"];
  const safeRules = Array.isArray(selectedSpot.rules) ? selectedSpot.rules : ["Respeitar velocidade máxima de 10km/h."];

  const hourlyRate = Number(selectedSpot.priceHourly || 6);

  // Calculate estimated total hours & price
  const calculateHours = () => {
    const [startH] = (startTime || '14:00').split(':').map(Number);
    const [endH] = (endTime || '18:00').split(':').map(Number);
    let diff = (endH || 18) - (startH || 14);
    if (diff <= 0) diff = 1;
    return diff;
  };

  const hours = calculateHours();
  const totalPrice = hours * hourlyRate;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="bg-sky-100 text-sky-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {selectedSpot.isCovered ? "Vaga Coberta" : "Vaga Descoberta"}
            </span>
            <span className="text-slate-400 text-xs">• ID: {selectedSpot.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleFavorite(selectedSpot.id)}
              className={`p-2 rounded-full border transition cursor-pointer ${
                isFav ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Fechar (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          
          {/* Photos Gallery */}
          <div className="space-y-3">
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-inner group">
              <img
                src={safePhotos[activePhotoIndex] || safePhotos[0]}
                alt={selectedSpot.title}
                className="w-full h-full object-cover transition duration-300"
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{selectedSpot.rating || 5.0} ({selectedSpot.reviewsCount || 12} avaliações)</span>
              </div>
            </div>

            {safePhotos.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {safePhotos.map((photo, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition ${
                      activePhotoIndex === idx ? 'border-sky-500 ring-2 ring-sky-300' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                  {selectedSpot.title}
                </h2>
                <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{selectedSpot.address}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-slate-700">{selectedSpot.distFormatted || selectedSpot.distance || "500m"}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openExternalNavigation(selectedSpot.lat, selectedSpot.lng, selectedSpot.address)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Compass className="w-4 h-4 text-emerald-200" />
                    <span>🧭 COMO CHEGAR</span>
                  </button>
                </div>

              </div>

              {/* Pack 3: Facade Entrance Photo Preview */}
              {selectedSpot.facadePhoto && (
                <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={selectedSpot.facadePhoto}
                    alt="Fachada do Portão"
                    className="w-full sm:w-36 h-24 rounded-xl object-cover ring-2 ring-amber-300 shrink-0"
                  />
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="bg-amber-400/30 text-amber-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                      📷 Foto da Entrada / Fachada
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm">Reconhecimento Visual do Portão</h4>
                    <p className="text-xs text-slate-600">
                      Utilize esta foto para identificar o portão exato da casa ou prédio assim que dobrar a esquina.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sobre esta vaga</h4>
                <p className="text-slate-700 text-sm leading-relaxed">{selectedSpot.description || "Garagem segura e privativa em área nobre de Itabuna - BA."}</p>
              </div>

              {/* Owner Card */}
              <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedSpot.ownerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"}
                    alt={selectedSpot.ownerName || "Anfitrião"}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-sky-400/30"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-sky-600 uppercase">Anfitrião Verificado</span>
                      {(selectedSpot.isSuperHost || (selectedSpot.ownerRating || 5.0) >= 4.8) && (
                        <span className="bg-amber-400/20 text-amber-800 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          ⭐ SuperHost
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedSpot.ownerName || "Anfitrião VagaGo"}</h4>

                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{selectedSpot.ownerRating || 5.0} Nota Geral</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(true)}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Anfitrião</span>
                  </button>

                  <a
                    href={`tel:${selectedSpot.ownerPhone || "(73) 99123-4567"}`}
                    className="bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contato</span>
                  </a>
                </div>
              </div>


              {/* Features & Security */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Recursos de Segurança & Facilidades
                </h4>
                <div className="flex flex-wrap gap-2">
                  {safeFeatures.map((feat, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Allowed Vehicles */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Car className="w-4 h-4 text-sky-600" />
                  Veículos Aceitos & Dimensões
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  {safeAllowedVehicles.map((veh, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
                      {veh}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Altura máxima permitida: <span className="font-bold text-slate-700">{selectedSpot.heightLimit || "2,20m"}</span> • Tamanho: <span className="font-bold text-slate-700">{selectedSpot.size || "Médio (SUV)"}</span>
                </div>
              </div>

              {/* Rules */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Regras da Garagem</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {safeRules.map((rule, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Map Preview */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">Localização Exata</h4>
                <InteractiveMap
                  spots={[selectedSpot]}
                  selectedSpotId={selectedSpot.id}
                  center={[Number(selectedSpot.lat || -14.7877), Number(selectedSpot.lng || -39.2789)]}
                  zoom={15}
                  className="w-full h-56 rounded-2xl overflow-hidden border border-slate-200"
                />
              </div>

            </div>

            {/* Right Col: Booking Calculator & Rates */}
            <div className="space-y-4">
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-5 sticky top-4">
                
                {/* Pricing Badges */}
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Valores de Tabela</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-extrabold text-sky-600">R$ {hourlyRate.toFixed(2)}</span>
                    <span className="text-slate-500 text-sm font-medium">/hora</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl text-center">
                      <span className="text-slate-400 block font-semibold text-[10px]">DIÁRIA</span>
                      <span className="font-bold text-slate-800">R$ {Number(selectedSpot.priceDaily || 28).toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl text-center">
                      <span className="text-slate-400 block font-semibold text-[10px]">MENSAL</span>
                      <span className="font-bold text-slate-800">R$ {Number(selectedSpot.priceMonthly || 280).toFixed(2)}</span>
                    </div>
                  </div>

                </div>

                {/* Calculator controls */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">Selecione a Data</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Entrada</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Saída</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Automatic Summary */}
                <div className="bg-sky-50 p-3.5 rounded-2xl border border-sky-100 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Duração:</span>
                    <span className="font-bold text-slate-800">{hours} horas</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Tarifa horária:</span>
                    <span>R$ {hourlyRate.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-sky-200/60">
                    <span>Total Estimado:</span>
                    <span className="text-sky-600 text-lg">R$ {totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={() => openBookingFlow(selectedSpot)}
                  className="w-full bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold text-sm py-3.5 px-4 rounded-2xl shadow-lg shadow-sky-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Reservar vaga agora</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Monthly Plan CTA Button */}
                <button
                  type="button"
                  onClick={() => setIsMonthlyModalOpen(true)}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs py-3 px-4 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <CalendarIcon className="w-4 h-4 text-emerald-600" />
                  <span>Assinar Mensalista • R$ {Number(selectedSpot.priceMonthly || 280).toFixed(2)}/mês</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  Cancelamento gratuito até 1 hora antes
                </p>

              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Host Chat Modal */}
      <HostChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        spot={selectedSpot}
        ownerName={selectedSpot?.ownerName}
        ownerPhone={selectedSpot?.ownerPhone}
      />

      {/* Monthly Plan Modal */}
      <MonthlySubscriptionModal
        isOpen={isMonthlyModalOpen}
        onClose={() => setIsMonthlyModalOpen(false)}
        spot={selectedSpot}
      />
    </div>
  );
};

