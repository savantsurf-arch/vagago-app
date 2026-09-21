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
  ChevronLeft,
  Heart,
  Info,
  Compass,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Camera,
  Check,
  AlertCircle
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
    toggleFavorite,
    userLocation,
    isAuthenticated,
    openLoginModal,
    reviews = []
  } = useApp();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [datePreset, setDatePreset] = useState('hoje'); // 'hoje', 'amanha', 'custom'
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('18:00');
  const [isDescExpanded, setIsDescExpanded] = useState(false);

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

  // Reset active photo index when selectedSpot changes
  useEffect(() => {
    setActivePhotoIdx(0);
    setIsDescExpanded(false);
  }, [selectedSpot?.id]);

  if (!isSpotDetailsOpen || !selectedSpot) return null;

  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const isFav = safeFavorites.includes(selectedSpot.id);

  // Real photos list
  const safePhotos = Array.isArray(selectedSpot.photos) && selectedSpot.photos.length > 0
    ? selectedSpot.photos
    : [selectedSpot.facadePhoto || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80"];

  const safeFeatures = Array.isArray(selectedSpot.features) ? selectedSpot.features : ["Portão Eletrônico", "Câmeras de Segurança"];
  const safeAllowedVehicles = Array.isArray(selectedSpot.allowedVehicles) ? selectedSpot.allowedVehicles : ["Carro / SUV", "Moto"];
  const safeRules = Array.isArray(selectedSpot.rules) && selectedSpot.rules.length > 0
    ? selectedSpot.rules
    : ["Respeitar horário reservado.", "Velocidade máxima de 10 km/h no acesso.", "Não bloquear passagens comuns."];

  // Real reviews for this spot
  const spotReviews = (Array.isArray(reviews) ? reviews : []).filter(r => r && (r.spotId === selectedSpot.id || r.spaceId === selectedSpot.id));

  // Pricing calculations
  const hourlyRate = Number(selectedSpot.priceHourly || 6);

  const calculateHours = () => {
    const [startH, startM = 0] = (startTime || '14:00').split(':').map(Number);
    const [endH, endM = 0] = (endTime || '18:00').split(':').map(Number);
    let diff = (endH + endM / 60) - (startH + startM / 60);
    if (diff <= 0) diff = 1;
    return Math.max(1, Math.round(diff * 10) / 10);
  };

  const hours = calculateHours();
  const totalPrice = hours * hourlyRate;

  // Real availability state
  const isAvailable = selectedSpot.status !== 'Pausada' && selectedSpot.isAvailable !== false && selectedSpot.availabilityStatus !== 'Indisponível';

  const handleDatePreset = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    if (preset === 'hoje') {
      setSelectedDate(today.toISOString().split('T')[0]);
    } else if (preset === 'amanha') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split('T')[0]);
    }
  };

  const handleNextPhoto = () => {
    setActivePhotoIdx((prev) => (prev + 1) % safePhotos.length);
  };

  const handlePrevPhoto = () => {
    setActivePhotoIdx((prev) => (prev - 1 + safePhotos.length) % safePhotos.length);
  };

  const handleReservationClick = () => {
    if (!isAuthenticated) {
      if (typeof openLoginModal === 'function') {
        openLoginModal();
      }
      return;
    }
    if (typeof openBookingFlow === 'function') {
      openBookingFlow(selectedSpot);
    }
  };

  // Distance calculation text
  const userDistText = selectedSpot.distFormatted || (selectedSpot.calculatedDistKm ? (
    selectedSpot.calculatedDistKm < 1
      ? Math.round(selectedSpot.calculatedDistKm * 1000) + ' m'
      : selectedSpot.calculatedDistKm.toFixed(1) + ' km'
  ) : null);

  const descriptionText = selectedSpot.description || "Garagem privativa, coberta e segura localizada em área estratégica de Itabuna - BA. Acesso facilitado com portão automático e total tranquilidade para o seu veículo.";

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] relative">
        
        {/* ==================================================
            1. TOP HEADER & NAVIGATION: [← Voltar]
           ================================================== */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 sticky top-0 z-20 backdrop-blur-md">
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-sky-600 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition cursor-pointer shadow-2xs"
            title="Voltar para a página anterior"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          {/* Availability Status Pill */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{isAvailable ? "Disponível Agora" : "Ocupada / Indisponível"}</span>
            </span>

            {/* Favorite Button */}
            <button
              type="button"
              onClick={() => toggleFavorite(selectedSpot.id)}
              className={`p-2 rounded-xl border transition cursor-pointer shadow-2xs ${
                isFav
                  ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
              title={isFav ? "Remover dos favoritos" : "Salvar nos favoritos"}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Fechar (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ==================================================
            2. MODAL BODY (SCROLLABLE)
           ================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-24 lg:pb-6">
          
          {/* ==================================================
              3. FOTO / GALERIA DE IMAGENS
             ================================================== */}
          <div className="space-y-3">
            <div className="relative h-64 sm:h-80 md:h-96 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 shadow-inner group">
              <img
                src={safePhotos[activePhotoIdx] || safePhotos[0]}
                alt={selectedSpot.title}
                className="w-full h-full object-cover transition duration-300"
              />

              {/* Tag Coberta / Descoberta */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="bg-slate-900/85 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-xl shadow-sm">
                  {selectedSpot.isCovered ? "🛡️ Vaga Coberta" : "☀️ Vaga Descoberta"}
                </span>

                {selectedSpot.facadePhoto && activePhotoIdx === safePhotos.indexOf(selectedSpot.facadePhoto) && (
                  <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" />
                    Fachada / Portão
                  </span>
                )}
              </div>

              {/* Avaliação Badge */}
              <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{selectedSpot.rating || "4.9"}</span>
                <span className="text-slate-400 text-[11px]">({selectedSpot.reviewsCount || spotReviews.length || 0})</span>
              </div>

              {/* Galeria Navigation Arrows (se mais de 1 foto) */}
              {safePhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md flex items-center justify-center transition cursor-pointer opacity-90 hover:opacity-100"
                    title="Foto anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-md flex items-center justify-center transition cursor-pointer opacity-90 hover:opacity-100"
                    title="Próxima foto"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Contador de fotos (1 / X) */}
                  <div className="absolute bottom-3 right-3 bg-slate-900/75 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    {activePhotoIdx + 1} / {safePhotos.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail row */}
            {safePhotos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                {safePhotos.map((photo, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-18 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                      activePhotoIdx === idx
                        ? 'border-sky-500 ring-2 ring-sky-300 scale-102'
                        : 'border-transparent opacity-65 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ==================================================
              4. GRID: DETALHES (ESQUERDA) + CALCULADORA (DIREITA)
             ================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 cols: Informações detalhadas */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Título & Localização */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {selectedSpot.title}
                </h2>
                
                <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-slate-600 text-xs sm:text-sm mt-2">
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{selectedSpot.address || selectedSpot.neighborhood || "Centro, Itabuna - BA"}</span>
                  </div>

                  {userDistText && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-sky-700 font-extrabold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/70">
                        📍 {userDistText} de você
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Reconhecimento Visual da Fachada / Portão */}
              {selectedSpot.facadePhoto && (
                <div className="p-3.5 sm:p-4 bg-amber-50/80 rounded-2xl border border-amber-200/90 flex flex-col sm:flex-row items-center gap-3.5">
                  <img
                    src={selectedSpot.facadePhoto}
                    alt="Foto da Entrada"
                    className="w-full sm:w-32 h-20 rounded-xl object-cover ring-2 ring-amber-300 shrink-0"
                  />
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="bg-amber-400/30 text-amber-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                      📷 Foto da Entrada / Fachada
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Reconhecimento do Portão</h4>
                    <p className="text-xs text-slate-600">
                      Identifique facilmente o portão da garagem assim que se aproximar do endereço.
                    </p>
                  </div>
                </div>
              )}

              {/* Descrição: Sobre esta vaga */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sobre esta vaga</h4>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  {isDescExpanded || descriptionText.length <= 180
                    ? descriptionText
                    : descriptionText.slice(0, 180) + '...'}
                </p>
                {descriptionText.length > 180 && (
                  <button
                    type="button"
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 underline transition cursor-pointer"
                  >
                    {isDescExpanded ? "Ver menos" : "Ver mais"}
                  </button>
                )}
              </div>

              {/* Características e Recursos de Segurança */}
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Características da Vaga</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {safeFeatures.map((feat, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 transition"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Veículos Permitidos & Dimensões */}
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-2.5 flex items-center gap-2">
                  <Car className="w-4 h-4 text-sky-600" />
                  <span>Veículos Permitidos</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {safeAllowedVehicles.map((veh, idx) => (
                    <span
                      key={idx}
                      className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                    >
                      🚗 {veh}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Altura máxima: <strong className="text-slate-700">{selectedSpot.heightLimit || "2,20m"}</strong> • Tamanho: <strong className="text-slate-700">{selectedSpot.size || "Padrão"}</strong>
                </p>
              </div>

              {/* Regras da Garagem */}
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-2">Regras da Garagem</h4>
                <ul className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                  {safeRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Informações do Anfitrião */}
              <div className="p-4 bg-sky-50/40 rounded-2xl border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedSpot.ownerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"}
                    alt={selectedSpot.ownerName || "Anfitrião"}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-sky-300"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-sky-700 uppercase">Anfitrião Verificado</span>
                      {(selectedSpot.isSuperHost || (selectedSpot.ownerRating || 5.0) >= 4.8) && (
                        <span className="bg-amber-400/20 text-amber-800 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                          ⭐ SuperHost
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{selectedSpot.ownerName || "Anfitrião VagaGo"}</h4>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{selectedSpot.ownerRating || "5.0"} Nota de Avaliação</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat com Anfitrião</span>
                </button>
              </div>

              {/* Avaliações dos Clientes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Avaliações dos Motoristas</span>
                  </h4>
                  <span className="text-xs text-slate-500 font-semibold">
                    {spotReviews.length > 0 ? `${spotReviews.length} avaliações` : "Ainda sem avaliações"}
                  </span>
                </div>

                {spotReviews.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                    Ainda não há avaliações para esta vaga. Seja o primeiro a avaliar após estacionar!
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {spotReviews.map((rev, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{rev.userName || "Motorista"}</span>
                          <span className="text-[11px] text-slate-400">{rev.date || "Recente"}</span>
                        </div>
                        <div className="flex text-amber-400 text-xs">
                          {"★".repeat(rev.rating || 5)}
                        </div>
                        <p className="text-slate-600">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Localização Exata no Mapa */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="font-extrabold text-slate-900 text-sm">Localização no Mapa</h4>
                  <button
                    type="button"
                    onClick={() => openExternalNavigation(selectedSpot.lat, selectedSpot.lng, selectedSpot.address)}
                    className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Abrir GPS</span>
                  </button>
                </div>

                <div className="h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                  <InteractiveMap
                    spots={[selectedSpot]}
                    selectedSpotId={selectedSpot.id}
                    center={[Number(selectedSpot.lat || -14.7877), Number(selectedSpot.lng || -39.2789)]}
                    zoom={15}
                    className="w-full h-full"
                  />
                </div>
              </div>

            </div>

            {/* Right 5 cols: Calculadora de Reserva e CTA */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xl space-y-5 lg:sticky lg:top-20">
                
                {/* Preço em Destaque */}
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Valor da Vaga</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-slate-900">R$ {hourlyRate.toFixed(2)}</span>
                    <span className="text-slate-500 text-sm font-semibold">/ hora</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                      <span className="text-slate-400 block font-semibold text-[10px]">DIÁRIA</span>
                      <span className="font-extrabold text-slate-800">R$ {Number(selectedSpot.priceDaily || 28).toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                      <span className="text-slate-400 block font-semibold text-[10px]">MENSAL</span>
                      <span className="font-extrabold text-slate-800">R$ {Number(selectedSpot.priceMonthly || 280).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Seleção de Data e Horário */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900">Quando deseja estacionar?</label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleDatePreset('hoje')}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition ${
                          datePreset === 'hoje'
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Hoje
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDatePreset('amanha')}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition ${
                          datePreset === 'amanha'
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Amanhã
                      </button>
                    </div>
                  </div>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setDatePreset('custom');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                  />

                  {/* Horários de Entrada e Saída */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Entrada</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Saída</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Resumo da Reserva */}
                <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100 space-y-2">
                  <div className="text-[11px] font-bold uppercase text-sky-800 tracking-wider">Resumo da Reserva</div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Data:</span>
                    <span className="font-bold text-slate-800">{selectedDate.split('-').reverse().join('/')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Horário:</span>
                    <span className="font-bold text-slate-800">{startTime} — {endTime}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Duração:</span>
                    <span className="font-bold text-slate-800">{hours} {hours === 1 ? 'hora' : 'horas'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Tarifa horária:</span>
                    <span>R$ {hourlyRate.toFixed(2)}/h</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-sky-200/60">
                    <span>Total Estimado:</span>
                    <span className="text-sky-600 text-lg">R$ {totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* CTA Principal de Reserva */}
                <button
                  type="button"
                  disabled={!isAvailable}
                  onClick={handleReservationClick}
                  className={`w-full text-white font-extrabold text-sm py-3.5 px-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                    isAvailable
                      ? 'bg-sky-600 hover:bg-sky-500 active:bg-sky-700 shadow-sky-600/30 hover:-translate-y-0.5'
                      : 'bg-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span>{isAvailable ? (isAuthenticated ? "Reservar vaga agora" : "Entrar para reservar vaga") : "Vaga Indisponível"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {!isAuthenticated && (
                  <p className="text-[11px] text-slate-500 text-center font-medium">
                    Para reservar uma vaga, entre na sua conta com 1 clique.
                  </p>
                )}

                {/* Botão de Assinatura Mensalista */}
                <button
                  type="button"
                  onClick={() => setIsMonthlyModalOpen(true)}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs py-2.5 px-4 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
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

        {/* ==================================================
            5. MOBILE STICKY BOTTOM BAR (Acesso Rápido com 1 Mão)
           ================================================== */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3.5 flex items-center justify-between gap-3 shadow-2xl">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total ({hours}h)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">R$ {totalPrice.toFixed(2)}</span>
              <span className="text-xs text-slate-500">({startTime} - {endTime})</span>
            </div>
          </div>

          <button
            type="button"
            disabled={!isAvailable}
            onClick={handleReservationClick}
            className={`px-6 py-3 rounded-2xl text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-md cursor-pointer ${
              isAvailable
                ? 'bg-sky-600 hover:bg-sky-500 active:bg-sky-700 shadow-sky-600/30'
                : 'bg-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>{isAvailable ? "Reservar Vaga" : "Indisponível"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
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
