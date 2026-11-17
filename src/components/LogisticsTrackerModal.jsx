import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from './InteractiveMap';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Navigation,
  Compass,
  CheckCircle2,
  Clock,
  Car,
  MapPin,
  ShieldCheck,
  QrCode,
  Sparkles,
  Footprints,
  RotateCcw,
  Zap,
  Check,
  LocateFixed,
  Radio,
  AlertTriangle,
  Play,
  CheckCircle
} from 'lucide-react';
import {
  fetchDrivingRoute,
  calculateOsmAlternativeRoutes,
  assignGarageBoxNumber,
  formatDistance
} from '../services/geoUtils';
import {
  useRealtimeGpsTracker,
  subscribeToDriverLocationRealtime
} from '../services/gpsTrackingService';

export const LogisticsTrackerModal = ({ booking, isOpen, onClose }) => {
  const { userLocation, parkingSpaces, authorizeCheckIn, currentUser } = useApp();

  const [logisticsStep, setLogisticsStep] = useState(1); // 1: Em Rota, 2: Chegando, 3: Portão/QR Code, 4: Estacionado
  const [transportMode, setTransportMode] = useState('CAR'); // 'CAR' vs 'WALKING'
  const [selectedRouteId, setSelectedRouteId] = useState('fastest');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [osrmRoute, setOsrmRoute] = useState(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [simStepFraction, setSimStepFraction] = useState(0);

  const targetSpot = (parkingSpaces || []).find((s) => s && s.id === booking?.spaceId) || {
    id: booking?.spaceId || 'spc_default',
    lat: -14.7966,
    lng: -39.2789,
    entranceLat: -14.7968,
    entranceLng: -39.2787,
    title: booking?.spaceTitle || 'Garagem VagaGo',
    address: booking?.spaceAddress || 'Centro, Itabuna - BA',
    photos: ['https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80'],
    entranceInstructions: 'Dirija-se ao portão automático à direita da entrada.'
  };

  const destinationLat = Number(targetSpot.entranceLat || targetSpot.lat || -14.7966);
  const destinationLng = Number(targetSpot.entranceLng || targetSpot.lng || -39.2789);

  // Hook nativo de rastreamento GPS em tempo real (watchPosition + Supabase Realtime sync)
  const tracker = useRealtimeGpsTracker({
    bookingId: booking?.id || booking?.bookingNumber,
    userId: currentUser?.id || booking?.userId,
    destinationLat,
    destinationLng,
    autoStart: isOpen
  });

  // Coordenadas ativas do motorista: se o GPS já emitiu posição, usa ela; senão usa a posição do AppContext
  const driverLat = tracker.currentLocation?.latitude ?? (userLocation?.lat || -14.7966);
  const driverLng = tracker.currentLocation?.longitude ?? (userLocation?.lng || -39.2789);
  const driverHeading = tracker.currentLocation?.heading ?? 0;

  // Escuta atualizações de localização remotas no Supabase Realtime (ex: se visualizado por outro dispositivo)
  useEffect(() => {
    if (!isOpen || !booking?.id) return;
    const unsub = subscribeToDriverLocationRealtime(booking.id, (remoteLoc) => {
      // Confirmação de recebimento em tempo real pelo canal Supabase
      console.log('📡 Coordenada recebida via Supabase Realtime:', remoteLoc);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [isOpen, booking?.id]);

  // Sincroniza passo inicial com status da reserva
  useEffect(() => {
    if (booking) {
      setLogisticsStep(booking.bookingStatus === 'Em Andamento' ? 4 : 1);
    }
  }, [booking]);

  // Atualiza automaticamente o passo para "Chegando" quando estiver a menos de 100m
  useEffect(() => {
    if (tracker.distanceRemainingMeters !== null) {
      if (tracker.distanceRemainingMeters <= 50 && logisticsStep < 3) {
        setLogisticsStep(3);
      } else if (tracker.distanceRemainingMeters <= 150 && logisticsStep === 1) {
        setLogisticsStep(2);
      }
    }
  }, [tracker.distanceRemainingMeters, logisticsStep]);

  // Busca e atualiza a rota OSRM baseada no deslocamento
  const lastFetchedOriginRef = useRef({ lat: null, lng: null });

  useEffect(() => {
    if (!isOpen || !booking) {
      setOsrmRoute(null);
      return;
    }

    // Só busca nova rota se não houver rota ou se o deslocamento for relevante (> 60m)
    const prev = lastFetchedOriginRef.current;
    if (prev.lat && prev.lng) {
      const dist = Math.hypot(driverLat - prev.lat, driverLng - prev.lng);
      if (dist < 0.0006 && osrmRoute) {
        return; // Posição muito próxima da anterior, reaproveita rota existente
      }
    }

    let cancelled = false;
    fetchDrivingRoute(driverLat, driverLng, destinationLat, destinationLng, transportMode).then(
      (res) => {
        if (!cancelled && res) {
          lastFetchedOriginRef.current = { lat: driverLat, lng: driverLng };
          setOsrmRoute(res);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [isOpen, booking, driverLat, driverLng, destinationLat, destinationLng, transportMode]);

  if (!isOpen || !booking) return null;

  // Rotas OpenStreetMap + OSRM
  const routesData = calculateOsmAlternativeRoutes(
    driverLat,
    driverLng,
    destinationLat,
    destinationLng,
    transportMode,
    osrmRoute
  );

  const activeRoute = routesData[selectedRouteId] || routesData.fastest;
  const assignedBox = booking.assignedBox || assignGarageBoxNumber(booking.spaceId);

  // Recalcular rota sob demanda
  const handleRecalculateRoute = () => {
    setIsRecalculating(true);
    fetchDrivingRoute(driverLat, driverLng, destinationLat, destinationLng, transportMode)
      .then((res) => {
        if (res) {
          lastFetchedOriginRef.current = { lat: driverLat, lng: driverLng };
          setOsrmRoute(res);
        }
      })
      .finally(() => {
        setTimeout(() => setIsRecalculating(false), 500);
      });
  };

  // Botão para avançar no teste controlado de bancada (sem GPS físico)
  const handleAdvanceSimulation = () => {
    const nextFraction = simStepFraction >= 0.95 ? 1 : simStepFraction + 0.25;
    setSimStepFraction(nextFraction);
    tracker.simulateStep(nextFraction, activeRoute.polyline);

    if (nextFraction >= 1) {
      setLogisticsStep(3);
    } else if (nextFraction >= 0.75) {
      setLogisticsStep(2);
    }
  };

  // Centraliza o mapa na posição do veículo
  const handleRecenter = () => {
    setRecenterTrigger((prev) => prev + 1);
  };

  // Encerramento do trajeto
  const handleFinishTracking = () => {
    tracker.stopTracking();
    if (logisticsStep >= 3) {
      authorizeCheckIn(booking.id);
    }
    onClose();
  };

  // Objeto de localização formatado para o Leaflet com heading dinâmico e pulso
  const driverMapLocation = {
    lat: driverLat,
    lng: driverLng,
    heading: driverHeading,
    isLive: true,
    addressName: 'Seu Veículo (Em deslocamento)'
  };

  // Métricas dinâmicas em tempo real
  const displayDistMeters = tracker.distanceRemainingMeters ?? Math.round((activeRoute.distanceKm || 0.8) * 1000);
  const displayDistText = displayDistMeters > 999
    ? `${(displayDistMeters / 1000).toFixed(1)} km`
    : `${displayDistMeters} m`;

  const displayEta = activeRoute.etaString || `${Math.max(1, Math.round(displayDistMeters / 400))} min`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border border-slate-200">
        
        {/* Header Tecnológico VagaGo */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#06152D] text-white">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 bg-gradient-to-br from-[#087BFF]/30 to-[#19E600]/20 text-[#00D9FF] rounded-2xl border border-[#00D9FF]/40 shadow-inner">
              <Navigation className="w-5 h-5 animate-pulse text-[#19E600]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#19E600] animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-[#087BFF]/30 text-[#00D9FF] border border-[#087BFF]/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Rastreamento GPS em Tempo Real
                </span>
                <span className="text-xs text-slate-400 font-mono">#{booking.bookingNumber || booking.id?.slice(0, 8)}</span>
              </div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                Navegação até a Garagem
                <span className="text-xs font-bold text-slate-400 font-normal">({booking.spaceTitle || targetSpot.title})</span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar navegação"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de Status GPS e Realtime */}
        <div className="px-5 py-2.5 bg-slate-900 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {tracker.trackingStatus === 'TRACKING' ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>GPS Ativo em Alta Precisão (Leaflet + OpenStreetMap)</span>
              </span>
            ) : tracker.trackingStatus === 'LOCATING' ? (
              <span className="inline-flex items-center gap-1.5 text-sky-400 font-bold">
                <Radio className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                <span>Localizando sinal de GPS do dispositivo...</span>
              </span>
            ) : tracker.trackingStatus === 'PERMISSION_DENIED' ? (
              <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Permissão de GPS negada pelo navegador.</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-slate-400 font-semibold">
                <Radio className="w-3.5 h-3.5 text-slate-500" />
                <span>GPS em espera</span>
              </span>
            )}

            {tracker.isTestMode && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                Modo de Teste Controlado Ativo
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Sincronização:</span>
            <span className="text-[11px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60">
              Supabase Realtime
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Recalculating alert */}
          {isRecalculating && (
            <div className="p-3 bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md animate-pulse">
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Ajustando trajeto a partir da sua localização em tempo real...</span>
            </div>
          )}

          {/* PERMISSION DENIED BANNER */}
          {tracker.permissionError && !tracker.isTestMode && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 font-black text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Aviso de Localização: {tracker.permissionError}</span>
              </div>
              <p className="text-slate-600 font-medium">
                Para acompanhar sua rota no mapa em tempo real enquanto dirige, permita o acesso à localização neste site, ou utilize o botão de teste de bancada abaixo:
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={tracker.startTracking}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  Tentar Ativar GPS Novamente
                </button>
                <button
                  type="button"
                  onClick={handleAdvanceSimulation}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Usar Modo de Teste Controlado</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP PROGRESS BAR */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">Etapas do Deslocamento</span>
              <span className="text-[#087BFF] font-extrabold">Passo {logisticsStep} de 4</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
              <div className={`p-2 rounded-xl border transition ${
                logisticsStep >= 1 ? 'bg-[#06152D] text-white border-[#06152D]' : 'bg-white text-slate-400 border-slate-200'
              }`}>
                1. Em Rota 🚗
              </div>
              <div className={`p-2 rounded-xl border transition ${
                logisticsStep >= 2 ? 'bg-[#06152D] text-white border-[#06152D]' : 'bg-white text-slate-400 border-slate-200'
              }`}>
                2. Aproximando 📍
              </div>
              <div className={`p-2 rounded-xl border transition ${
                logisticsStep >= 3 ? 'bg-[#06152D] text-white border-[#06152D]' : 'bg-white text-slate-400 border-slate-200'
              }`}>
                3. Portão / QR 🏁
              </div>
              <div className={`p-2 rounded-xl border transition ${
                logisticsStep >= 4 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-200'
              }`}>
                4. Estacionado 🅿️
              </div>
            </div>
          </div>

          {/* HUD METRICS (Uber / iFood Style: Distância restante, ETA e Transporte) */}
          <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-emerald-50 p-4 rounded-2xl border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{displayDistText}</span>
                <span className="text-base font-extrabold text-[#087BFF] bg-sky-100/80 px-2.5 py-0.5 rounded-lg">
                  {displayEta}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                  {activeRoute.trafficStatus || '🟢 Trajeto Livre'}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600">
                Destino: <strong className="text-slate-900">{targetSpot.address}</strong> (Portão de Acesso)
              </p>
            </div>

            {/* Switcher Carro / A pé */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0 shadow-2xs">
              <button
                type="button"
                onClick={() => setTransportMode('CAR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition cursor-pointer ${
                  transportMode === 'CAR' ? 'bg-[#06152D] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Carro</span>
              </button>
              <button
                type="button"
                onClick={() => setTransportMode('WALKING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition cursor-pointer ${
                  transportMode === 'WALKING' ? 'bg-[#06152D] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>A pé</span>
              </button>
            </div>
          </div>

          {/* MAPA PRINCIPAL LEAFLET / OPENSTREETMAP (100% Integrado sem redirecionamento externo) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#087BFF]" />
                <span>Mapa em Tempo Real (Leaflet • OpenStreetMap)</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRecenter}
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs transition cursor-pointer"
                  title="Centralizar no seu veículo"
                >
                  <LocateFixed className="w-3.5 h-3.5 text-[#087BFF]" />
                  <span>Centralizar GPS</span>
                </button>

                <button
                  type="button"
                  onClick={handleRecalculateRoute}
                  className="text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Recalcular</span>
                </button>
              </div>
            </div>

            {/* Container do Mapa Leaflet */}
            <div className="h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-md relative group">
              <InteractiveMap
                eagerLoad={true}
                spots={[targetSpot]}
                userLocation={driverMapLocation}
                routePolyline={activeRoute.polyline}
                selectedSpotId={targetSpot.id}
                center={[driverLat, driverLng]}
                zoom={16}
                recenterTrigger={recenterTrigger}
                className="w-full h-full rounded-2xl"
              />

              {/* Tag flutuante sobre o mapa indicando posição viva */}
              <div className="absolute bottom-3 left-3 z-[10] bg-[#06152D]/90 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl border border-[#00D9FF]/40 shadow-lg flex items-center gap-2 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-[#19E600] animate-ping"></span>
                <span>Marcador de Veículo VagaGo (Orientação em {Math.round(driverHeading)}°)</span>
              </div>
            </div>
          </div>

          {/* INSTRUÇÕES DO PORTÃO E BOX ATRIBUÍDO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1">
              <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                🚪 Instruções do Portão:
              </span>
              <p className="font-semibold text-slate-800">
                {targetSpot.entranceInstructions || 'Direcione o veículo para o portão principal da garagem.'}
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1">
              <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                🅿️ Box Atribuído:
              </span>
              <p className="font-black text-emerald-950 text-base">{assignedBox}</p>
            </div>
          </div>

          {/* QR CODE DE LIBERAÇÃO (Exibido a partir do Passo 3 ou ao aproximar) */}
          {logisticsStep >= 3 && (
            <div className="p-5 bg-gradient-to-br from-[#06152D] to-slate-900 text-white rounded-3xl text-center space-y-3 border border-emerald-500/40 shadow-xl animate-in fade-in">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 font-black text-xs px-3.5 py-1 rounded-full border border-emerald-400/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>VOCÊ CHEGOU AO DESTINO!</span>
              </div>
              <h4 className="font-extrabold text-sm text-[#00D9FF]">Apresente no Leitor do Portão Eletrônico</h4>
              
              <div className="bg-white p-3.5 rounded-2xl inline-block shadow-lg">
                <QRCodeSVG value={booking.qrCodeData || `VAGAGO-GATE-${booking.id}`} size={160} />
              </div>
              
              <p className="text-xs text-slate-300 max-w-sm mx-auto font-medium">
                Aproxime este QR Code da câmera do portão para destravar o acesso ao <strong>{assignedBox}</strong>.
              </p>
            </div>
          )}

          {/* ACTION BUTTONS (Sem links externos — 100% no app) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Botão de Teste de Bancada para computadores sem GPS físico */}
            <button
              type="button"
              onClick={handleAdvanceSimulation}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
            >
              <Play className="w-4 h-4 text-sky-600" />
              <span>Simular Deslocamento (Teste de Bancada)</span>
            </button>

            {/* Botão de Avanço e Finalização */}
            {logisticsStep < 3 ? (
              <button
                type="button"
                onClick={() => setLogisticsStep(3)}
                className="bg-[#19E600] hover:bg-[#15c500] text-[#06152D] font-black text-xs py-3.5 px-4 rounded-2xl shadow-lg shadow-[#19E600]/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Confirmar Chegada ao Portão</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishTracking}
                className="bg-[#06152D] hover:bg-slate-800 text-white font-black text-xs py-3.5 px-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                <Check className="w-4 h-4 text-[#19E600]" />
                <span>Finalizar Acompanhamento & Liberar Vaga</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
