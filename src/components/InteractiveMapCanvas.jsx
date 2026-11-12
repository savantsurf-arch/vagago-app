import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, MapPin, ChevronRight, Maximize2 } from 'lucide-react';

// Cache lightweight marker DivIcons in memory to prevent reallocations on hover/pan
const priceIconCache = new Map();
let cachedUserLocationIcon = null;
let cachedEntranceGateIcon = null;

const getUserLocationMarkerIcon = () => {
  if (cachedUserLocationIcon) return cachedUserLocationIcon;
  const html = `
    <div style="position:relative;width:22px;height:22px;">
      <div style="position:absolute;width:22px;height:22px;background:rgba(2,132,199,0.28);border-radius:50%;"></div>
      <div style="position:absolute;top:4px;left:4px;width:14px;height:14px;background:#0284c7;border:2.5px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.28);"></div>
    </div>
  `;
  cachedUserLocationIcon = L.divIcon({
    html,
    className: 'user-pulse-marker',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
  return cachedUserLocationIcon;
};

const getEntranceGateMarkerIcon = () => {
  if (cachedEntranceGateIcon) return cachedEntranceGateIcon;
  const html = `
    <div style="background:#f59e0b;color:#fff;font-weight:800;font-size:11px;padding:3px 8px;border-radius:10px;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.25);white-space:nowrap;">
      🚪 Portão
    </div>
  `;
  cachedEntranceGateIcon = L.divIcon({
    html,
    className: 'entrance-gate-marker',
    iconSize: [78, 24],
    iconAnchor: [39, 12]
  });
  return cachedEntranceGateIcon;
};

const getPriceMarkerIcon = (spot, isSelected = false, isFavorite = false, billingType = 'hora') => {
  const isOccupied = spot.availabilityStatus === 'Ocupada';
  const isUnavailable = spot.availabilityStatus === 'Indisponível';

  let bgColor = '#0284c7';
  if (isOccupied) bgColor = '#64748b';
  if (isUnavailable) bgColor = '#ef4444';
  if (isSelected) bgColor = '#0f172a';

  const rawPrice =
    billingType === 'diaria'
      ? Number(spot.priceDaily || Number(spot.priceHourly || 6) * 5)
      : billingType === 'mensal'
      ? Number(spot.priceMonthly || Number(spot.priceHourly || 6) * 45)
      : Number(spot.priceHourly || 6);
  const suffix = billingType === 'diaria' ? '/d' : billingType === 'mensal' ? '/m' : '/h';
  const priceVal = rawPrice.toFixed(0);
  const borderColor = isFavorite ? '#f43f5e' : '#ffffff';
  const labelText = isOccupied ? 'Ocupada' : isUnavailable ? 'Indisp.' : `R$ ${priceVal}${suffix}`;

  const cacheKey = `${bgColor}|${borderColor}|${labelText}|${isSelected ? 1 : 0}|${isFavorite ? 1 : 0}`;
  if (priceIconCache.has(cacheKey)) {
    return priceIconCache.get(cacheKey);
  }

  const html = `
    <div style="background:${bgColor};color:#fff;font-weight:800;font-size:12px;padding:5px 10px;border-radius:9999px;border:2px solid ${borderColor};box-shadow:0 4px 12px rgba(15,23,42,0.28);display:inline-flex;align-items:center;gap:4px;white-space:nowrap;cursor:pointer;transform:${isSelected ? 'scale(1.14)' : 'scale(1)'};transition:transform 0.15s ease;">
      ${isFavorite ? '❤️' : ''}<span>${labelText}</span>
      <span style="width:6px;height:6px;border-radius:9999px;background:${isSelected ? '#00d26a' : '#93c5fd'};display:inline-block;"></span>
    </div>
  `;

  const icon = L.divIcon({
    html,
    className: 'custom-price-marker',
    iconSize: [86, 30],
    iconAnchor: [43, 15]
  });
  if (priceIconCache.size > 150) priceIconCache.clear();
  priceIconCache.set(cacheKey, icon);
  return icon;
};

function MapInvalidator() {
  const map = useMap();

  useEffect(() => {
    const timer1 = setTimeout(() => map.invalidateSize(), 120);
    const timer2 = setTimeout(() => map.invalidateSize(), 400);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [map]);

  return null;
}

function AutoFitBoundsController({ spots, userLocation, autoFitTrigger, fullScreen }) {
  const map = useMap();
  const spotsCount = spots?.length || 0;
  const isLive = Boolean(userLocation?.isLive);

  useEffect(() => {
    if (!spots || spots.length === 0) return;

    const points = spots.map(s => [Number(s.lat), Number(s.lng)]);
    if (userLocation && userLocation.lat && userLocation.lng) {
      points.push([Number(userLocation.lat), Number(userLocation.lng)]);
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          paddingTopLeft: fullScreen ? [32, 128] : [36, 36],
          paddingBottomRight: fullScreen ? [32, 220] : [36, 36],
          maxZoom: 15,
          animate: true,
          duration: 0.5
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotsCount, isLive, autoFitTrigger, map]);

  return null;
}

function PanToSelectedSpotController({ selectedSpotId, spots }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedSpotId || !spots || spots.length === 0) return;
    const spot = spots.find(s => s && s.id === selectedSpotId);
    if (spot && spot.lat && spot.lng && !isNaN(Number(spot.lat)) && !isNaN(Number(spot.lng))) {
      map.panTo([Number(spot.lat), Number(spot.lng)], { animate: true, duration: 0.4 });
    }
  }, [selectedSpotId, spots, map]);
  return null;
}

export default function InteractiveMapCanvas({
  spots = [],
  userLocation = null,
  routePolyline = null,
  alternativePolylines = [],
  selectedSpotId = null,
  hoveredSpotId = null,
  favorites = [],
  onSelectSpot = () => {},
  fullScreen = false,
  disablePopupOnSelect = false,
  billingType = 'hora',
  controlsTopClass = '',
  center = [-14.7966, -39.2789],
  zoom = 14,
  className = "w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative group"
}) {
  const [autoFitKey, setAutoFitKey] = useState(0);

  const effectiveCenter = userLocation ? [Number(userLocation.lat), Number(userLocation.lng)] : center;

  const validSpots = useMemo(
    () => (spots || []).filter(s => s && s.lat && s.lng && !isNaN(Number(s.lat)) && !isNaN(Number(s.lng))),
    [spots]
  );
  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  const floatingTopPos = controlsTopClass || (fullScreen ? 'top-36 right-3 sm:top-28 sm:right-4' : 'top-3 right-3');

  return (
    <div className={`relative overflow-hidden isolate ${fullScreen ? 'min-h-0' : ''} ${className}`}>
      {/* Floating Map Controls */}
      <div className={`absolute ${floatingTopPos} z-[10] flex flex-col gap-2 pointer-events-auto`}>
        <button
          onClick={() => setAutoFitKey(prev => prev + 1)}
          type="button"
          className="bg-white/95 hover:bg-white text-slate-800 text-xs font-bold px-3 py-2 min-h-[40px] rounded-xl shadow-md border border-slate-200 flex items-center gap-1.5 backdrop-blur-xs transition hover:scale-105 cursor-pointer"
          title="Ajustar o mapa para ver todas as vagas cadastradas em Itabuna"
        >
          <Maximize2 className="w-4 h-4 text-sky-600" />
          <span>Ver Vagas Itabuna ({validSpots.length})</span>
        </button>
      </div>

      <MapContainer
        center={effectiveCenter}
        zoom={zoom}
        scrollWheelZoom={fullScreen}
        zoomControl={!fullScreen}
        preferCanvas={true}
        style={{ width: '100%', height: '100%', zIndex: 1, position: 'relative', borderRadius: 'inherit' }}
      >
        <MapInvalidator />

        <AutoFitBoundsController
          spots={validSpots}
          userLocation={userLocation}
          autoFitTrigger={autoFitKey}
          fullScreen={fullScreen}
        />

        <PanToSelectedSpotController
          selectedSpotId={selectedSpotId}
          spots={validSpots}
        />

        {/* CartoDB Voyager Tile Layer optimized for mobile 4G/5G data savings */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          updateWhenIdle={true}
          updateWhenZooming={false}
          keepBuffer={1}
          detectRetina={false}
        />

        {routePolyline && routePolyline.length > 1 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{ color: '#0284c7', weight: 6, opacity: 0.9 }}
          />
        )}

        {alternativePolylines.map((poly, i) => (
          <Polyline
            key={i}
            positions={poly}
            pathOptions={{ color: '#94a3b8', weight: 4, opacity: 0.6, dashArray: '6, 6' }}
          />
        ))}

        {userLocation && userLocation.lat && userLocation.lng && (
          <Marker
            position={[Number(userLocation.lat), Number(userLocation.lng)]}
            icon={getUserLocationMarkerIcon()}
          >
            <Popup>
              <div className="p-2 font-sans text-xs text-slate-800 font-bold">
                📍 {userLocation.addressName || "Sua Posição Atual (GPS)"}
              </div>
            </Popup>
          </Marker>
        )}

        {validSpots.map((spot) => {
          const isSelected = selectedSpotId === spot.id || hoveredSpotId === spot.id;
          const isFav = safeFavorites.includes(spot.id);
          const markerIcon = getPriceMarkerIcon(spot, isSelected, isFav, billingType);
          const spotLat = Number(spot.lat);
          const spotLng = Number(spot.lng);

          return (
            <React.Fragment key={spot.id}>
              <Marker
                position={[spotLat, spotLng]}
                icon={markerIcon}
                eventHandlers={{
                  click: () => onSelectSpot(spot)
                }}
              >
                {!disablePopupOnSelect && (
                <Popup>
                  <div className="w-60 p-3 bg-white font-sans text-slate-800">
                    <div className="relative rounded-lg overflow-hidden h-24 mb-2 bg-slate-100">
                      <img
                        src={(spot.photos && spot.photos[0]) || spot.facadePhoto || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=500&q=75"}
                        alt={spot.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1.5 right-1.5 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {Number(spot.rating || 4.8).toFixed(1)}
                      </div>
                      <span className={`absolute top-1.5 left-1.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white ${
                        spot.availabilityStatus === 'Ocupada' ? 'bg-slate-700' :
                        spot.availabilityStatus === 'Indisponível' ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}>
                        {spot.availabilityStatus || 'Disponível'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm leading-tight text-slate-900 truncate">
                      {spot.title}
                    </h4>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                      <MapPin className="w-3 h-3 text-sky-600 shrink-0" />
                      <span className="truncate">{spot.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 mt-2 bg-slate-50 p-1.5 rounded-lg">
                      <span className="text-sky-600">{spot.distFormatted || spot.distance || "500 m"}</span>
                      <span>•</span>
                      <span>{spot.walkTime || "5 min a pé"}</span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Valor</span>
                        <span className="text-base font-extrabold text-sky-600">R$ {Number(spot.priceHourly || 6).toFixed(2)}/h</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectSpot(spot)}
                        className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-xs cursor-pointer"
                      >
                        Reservar
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Popup>
                )}
              </Marker>

              {spot.entranceLat && spot.entranceLng && !isNaN(Number(spot.entranceLat)) && !isNaN(Number(spot.entranceLng)) && (
                <Marker
                  position={[Number(spot.entranceLat), Number(spot.entranceLng)]}
                  icon={getEntranceGateMarkerIcon()}
                >
                  <Popup>
                    <div className="p-2.5 font-sans text-xs text-slate-800 space-y-1">
                      <span className="font-extrabold text-amber-600 block">🚪 Portão de Entrada</span>
                      <p className="text-[11px] font-semibold text-slate-600">{spot.entranceInstructions || "Direcione o veículo para este portão."}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
