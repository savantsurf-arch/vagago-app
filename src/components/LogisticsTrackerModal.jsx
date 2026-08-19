import React, { useState, useEffect } from 'react';
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
  Phone,
  QrCode,
  Sparkles,
  ArrowRight,
  Footprints,
  RotateCcw,
  Zap,
  Check
} from 'lucide-react';
import {
  calculateAlternativeRoutes,
  assignGarageBoxNumber
} from '../services/googleServices';
import { openExternalNavigation } from '../services/geoUtils';

export const LogisticsTrackerModal = ({ booking, isOpen, onClose }) => {
  const { userLocation, parkingSpaces, authorizeCheckIn } = useApp();

  const [logisticsStep, setLogisticsStep] = useState(1); // 1: Em Rota, 2: Chegando, 3: Portão/QR Code, 4: Estacionado
  const [transportMode, setTransportMode] = useState('CAR'); // 'CAR' vs 'WALKING'
  const [selectedRouteId, setSelectedRouteId] = useState('fastest'); // 'fastest', 'shortest', 'alternative'
  const [isRecalculating, setIsRecalculating] = useState(false);

  useEffect(() => {
    if (booking) {
      setLogisticsStep(booking.bookingStatus === 'Em Andamento' ? 4 : 1);
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const targetSpot = parkingSpaces.find(s => s.id === booking.spaceId) || {
    lat: -14.7966,
    lng: -39.2789,
    entranceLat: -14.7968,
    entranceLng: -39.2787,
    title: booking.spaceTitle,
    address: booking.spaceAddress,
    photos: ["https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80"]
  };

  // Target coordinates: navigate to exact entrance gate if available!
  const destinationLat = targetSpot.entranceLat || targetSpot.lat;
  const destinationLng = targetSpot.entranceLng || targetSpot.lng;

  // Calculate 3 alternative routes
  const routesData = calculateAlternativeRoutes(
    userLocation.lat,
    userLocation.lng,
    destinationLat,
    destinationLng,
    transportMode
  );

  const activeRoute = routesData[selectedRouteId] || routesData.fastest;
  const assignedBox = booking.assignedBox || assignGarageBoxNumber(booking.spaceId);

  const handleSimulateOffRoute = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setIsRecalculating(false);
    }, 1500);
  };

  const handleSimulateArrival = () => {
    if (logisticsStep === 1) setLogisticsStep(2);
    else if (logisticsStep === 2) setLogisticsStep(3);
    else if (logisticsStep === 3) {
      authorizeCheckIn(booking.id);
      setLogisticsStep(4);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-400/30">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold bg-sky-500/30 text-sky-300 px-2 py-0.5 rounded uppercase">
                  Navegação GPS Avançada
                </span>
                <span className="text-xs text-slate-400">• #{booking.bookingNumber}</span>
              </div>
              <h3 className="font-extrabold text-base">GPS & Navegação até a Garagem</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Recalculating Banner */}
          {isRecalculating && (
            <div className="p-3 bg-amber-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md animate-pulse">
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Desvio detectado! Recalculando melhor rota a partir da sua posição...</span>
            </div>
          )}

          {/* STEP PROGRESS BAR */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">Fluxo de Navegação & Chegada</span>
              <span className="text-sky-600 font-extrabold">Passo {logisticsStep} de 4</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
              <div className={`p-2 rounded-xl border transition ${
                logisticsStep >= 1 ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-400 border-slate-200'
              }`}>
                1. Em Rota 🚗
              </div>
              <div className={`p-2 rounded-xl border transition ${
                logisticsStep >= 2 ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-400 border-slate-200'
              }`}>
                2. Aproximando 📍
              </div>
              <div className={`p-2 rounded-xl border transition ${
                logisticsStep >= 3 ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-400 border-slate-200'
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

          {/* MODE SELECTOR (Carro 🚗 vs A Pé 🚶) & ETA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-sky-50 p-4 rounded-2xl border border-sky-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-sky-950">{activeRoute.etaString}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-200 shadow-2xs">
                  {activeRoute.trafficStatus}
                </span>
              </div>
              <p className="text-xs font-semibold text-sky-800 mt-0.5">
                Destino: Portão da Garagem ({booking.spaceAddress})
              </p>
            </div>

            {/* Transport Mode Switcher */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-sky-200 shrink-0">
              <button
                onClick={() => setTransportMode('CAR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition ${
                  transportMode === 'CAR' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Carro</span>
              </button>
              <button
                onClick={() => setTransportMode('WALKING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition ${
                  transportMode === 'WALKING' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>A pé</span>
              </button>
            </div>
          </div>

          {/* ALTERNATIVE ROUTES SELECTOR */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Selecione a Rota de Preferência:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {Object.values(routesData).map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRouteId(r.id)}
                  className={`p-3 rounded-2xl border text-left transition ${
                    selectedRouteId === r.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span>{r.title}</span>
                    {selectedRouteId === r.id && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                  <div className="text-sm font-black mt-1">{r.etaString}</div>
                  <div className="text-[10px] opacity-75 truncate">{r.subtitle}</div>
                </button>
              ))}
            </div>
          </div>

          {/* GATE ENTRANCE & SECRET INSTRUCTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1">
              <span className="font-extrabold text-amber-900 block flex items-center gap-1">
                🚪 Local Exato da Entrada:
              </span>
              <p className="font-semibold text-slate-800">
                {targetSpot.entranceInstructions || "Direcione o veículo para o portão principal."}
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1">
              <span className="font-extrabold text-emerald-900 block flex items-center gap-1">
                🅿️ Box Atribuído:
              </span>
              <p className="font-black text-emerald-950 text-sm">{assignedBox}</p>
            </div>
          </div>

          {/* MAP WITH ACTIVE ROUTE POLYLINE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-600" />
                Trajeto Ativo no Mapa (Indo para o Portão)
              </span>
              <button
                onClick={handleSimulateOffRoute}
                className="text-[11px] font-bold text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Recalcular Trajeto
              </button>
            </div>

            <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <InteractiveMap
                spots={[targetSpot]}
                userLocation={userLocation}
                routePolyline={activeRoute.polyline}
                selectedSpotId={targetSpot.id}
                center={[userLocation.lat, userLocation.lng]}
                zoom={15}
                className="w-full h-full rounded-2xl"
              />
            </div>
          </div>

          {/* STEP 3 & 4 QR CODE DISPLAY */}
          {logisticsStep >= 3 && (
            <div className="p-5 bg-slate-900 text-white rounded-2xl text-center space-y-3 animate-in fade-in">
              <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-400/30">
                🎉 VOCÊ CHEGOU À GARAGEM!
              </span>
              <h4 className="font-extrabold text-sm text-sky-400">Escaneie no Portão Eletrônico</h4>
              <div className="bg-white p-3 rounded-xl inline-block">
                <QRCodeSVG value={booking.qrCodeData} size={150} />
              </div>
              <p className="text-xs text-slate-300">
                Apresente este código para liberar a trava do <strong>{assignedBox}</strong>.
              </p>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => openExternalNavigation(destinationLat, destinationLng, booking.spaceAddress)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-sky-200" />
              <span>Abrir Navegação GPS Externa</span>
            </button>

            <button
              onClick={handleSimulateArrival}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {logisticsStep === 1 && "Avançar no Trajeto (500m)"}
              {logisticsStep === 2 && "Confirmar Chegada ao Portão"}
              {logisticsStep === 3 && "Escanear QR Code & Estacionar"}
              {logisticsStep === 4 && "✓ Estacionado com Sucesso"}
            </button>
          </div>


        </div>

      </div>
    </div>
  );
};
