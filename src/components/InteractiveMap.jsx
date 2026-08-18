import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Star, MapPin, Navigation, Clock, Car, ChevronRight, Heart, Maximize2, Compass } from 'lucide-react';

// Custom Marker Icon Generator for User Location (Blue Pulse)
const createUserLocationMarkerIcon = () => {
  const html = `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="
        position: absolute;
        width: 24px;
        height: 24px;
        background-color: rgba(2, 132, 199, 0.3);
        border-radius: 50%;
        animation: pulse 2s infinite ease-in-out;
      "></div>
      <div style="
        position: absolute;
        top: 4px;
        left: 4px;
        width: 16px;
        height: 16px;
        background-color: #0284c7;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      "></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'user-pulse-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Custom Marker Icon Generator for Gate Entrance Location (Door/Portão 🚪)
const createEntranceGateMarkerIcon = () => {
  const html = `
    <div style="
      background-color: #f59e0b;
      color: white;
      font-weight: 800;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 12px;
      border: 2px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 3px;
      white-space: nowrap;
    ">
      🚪 Portão de Entrada
    </div>
  `;
  return L.divIcon({
    html,
    className: 'entrance-gate-marker',
    iconSize: [120, 26],
    iconAnchor: [60, 13]
  });
};

// Custom Marker Icon Generator with R$ Price Tag & Status Color
const createPriceMarkerIcon = (spot, isSelected = false, isFavorite = false) => {
  const isOccupied = spot.availabilityStatus === 'Ocupada';
  const isUnavailable = spot.availabilityStatus === 'Indisponível';

  let bgColor = '#0284c7';
  if (isOccupied) bgColor = '#64748b';
  if (isUnavailable) bgColor = '#ef4444';
  if (isSelected) bgColor = '#0f172a';

  const priceVal = Number(spot.priceHourly || 6).toFixed(0);
  const borderColor = isFavorite ? '#f43f5e' : '#ffffff';
  const labelText = isOccupied ? 'Ocupada' : isUnavailable ? 'Indisponível' : `R$ ${priceVal}/h`;


  const html = `
    <div style="
      background-color: ${bgColor};
      color: white;
      font-weight: 800;
      font-size: 12px;
      padding: 5px 10px;
      border-radius: 20px;
      border: 2px solid ${borderColor};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      cursor: pointer;
      transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
      transition: all 0.2s ease-in-out;
    ">
      ${isFavorite ? '❤️' : ''}
      <span>${labelText}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-price-marker',
    iconSize: [80, 30],
    iconAnchor: [40, 15]
  });
};

// Map Invalidator Helper to recalculate map dimensions when loaded inside modals
function MapInvalidator() {
  const map = useMap();

  useEffect(() => {
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 300);
    const timer3 = setTimeout(() => map.invalidateSize(), 600);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [map]);

  return null;
}

// Auto-Fit Map Bounds Component to Frame All Garages & User Location
function AutoFitBoundsController({ spots, userLocation, autoFitTrigger }) {
  const map = useMap();

  useEffect(() => {
    if (!spots || spots.length === 0) return;

    const points = spots.map(s => [s.lat, s.lng]);
    if (userLocation && userLocation.lat && userLocation.lng) {
      points.push([userLocation.lat, userLocation.lng]);
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [40, 40],
          maxZoom: 15,
          animate: true,
          duration: 0.8
        });
      }
    }
  }, [spots, userLocation, autoFitTrigger, map]);

  return null;
}

export const InteractiveMap = ({
  spots = [],
  userLocation = null,
  routePolyline = null,
  alternativePolylines = [],
  selectedSpotId = null,
  favorites = [],
  onSelectSpot = () => {},
  center = [-14.7966, -39.2789], // Default Itabuna - BA
  zoom = 14,
  className = "w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative group"
}) => {
  const [autoFitKey, setAutoFitKey] = React.useState(0);

  const effectiveCenter = userLocation ? [userLocation.lat, userLocation.lng] : center;

  const triggerFitAll = () => {
    setAutoFitKey(prev => prev + 1);
  };

  const validSpots = (spots || []).filter(s => s && s.lat && s.lng && !isNaN(Number(s.lat)) && !isNaN(Number(s.lng)));
  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  return (
    <div className={`relative overflow-hidden isolate ${className}`}>
      
      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-[10] flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={triggerFitAll}
          type="button"
          className="bg-white/95 hover:bg-white text-slate-800 text-xs font-bold px-3 py-2 rounded-xl shadow-md border border-slate-200 flex items-center gap-1.5 backdrop-blur-xs transition hover:scale-105"
          title="Ajustar o mapa para ver todas as vagas cadastradas em Itabuna"
        >
          <Maximize2 className="w-4 h-4 text-sky-600" />
          <span>Ver Vagas Itabuna ({validSpots.length})</span>
        </button>
      </div>

      <MapContainer
        center={effectiveCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', zIndex: 1, position: 'relative', borderRadius: 'inherit' }}
      >
        <MapInvalidator />

        <AutoFitBoundsController
          spots={validSpots}
          userLocation={userLocation}
          autoFitTrigger={autoFitKey}
        />

        {/* CartoDB Voyager Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Primary Route Polyline (Google Directions Path) */}
        {routePolyline && routePolyline.length > 1 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{ color: '#0284c7', weight: 6, opacity: 0.9 }}
          />
        )}

        {/* Alternative Polylines */}
        {alternativePolylines.map((poly, i) => (
          <Polyline
            key={i}
            positions={poly}
            pathOptions={{ color: '#94a3b8', weight: 4, opacity: 0.6, dashArray: '6, 6' }}
          />
        ))}

        {/* User Current Location Marker */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <Marker
            position={[Number(userLocation.lat), Number(userLocation.lng)]}
            icon={createUserLocationMarkerIcon()}
          >
            <Popup>
              <div className="p-2 font-sans text-xs text-slate-800 font-bold">
                📍 {userLocation.addressName || "Sua Posição Atual (GPS)"}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Spot Markers & Entrance Gate Markers */}
        {validSpots.map((spot) => {
          const isSelected = selectedSpotId === spot.id;
          const isFav = safeFavorites.includes(spot.id);
          const markerIcon = createPriceMarkerIcon(spot, isSelected, isFav);
          const spotLat = Number(spot.lat);
          const spotLng = Number(spot.lng);

          return (
            <React.Fragment key={spot.id}>
              {/* Garage Main Marker */}
              <Marker
                position={[spotLat, spotLng]}
                icon={markerIcon}
                eventHandlers={{
                  click: () => onSelectSpot(spot)
                }}
              >
                <Popup>
                  <div className="w-64 p-3 bg-white font-sans text-slate-800">
                    <div className="relative rounded-lg overflow-hidden h-28 mb-2">
                      <img
                        src={(spot.photos && spot.photos[0]) || spot.facadePhoto || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80"}
                        alt={spot.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {spot.rating || 5.0}
                      </div>

                      <span className={`absolute top-2 left-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white ${
                        spot.availabilityStatus === 'Ocupada' ? 'bg-slate-700' :
                        spot.availabilityStatus === 'Indisponível' ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}>
                        {spot.availabilityStatus || 'Disponível'}
                      </span>

                      {/* Facade Badge */}
                      <div className="absolute bottom-1 left-2 bg-slate-900/90 text-amber-300 font-extrabold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        📷 Foto da Entrada / Fachada
                      </div>
                    </div>

                    <h4 className="font-bold text-sm leading-tight text-slate-900 truncate">
                      {spot.title}
                    </h4>
                    
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                      <MapPin className="w-3 h-3 text-sky-600 shrink-0" />
                      <span className="truncate">{spot.address}</span>
                    </div>

                    {/* Distance & Travel Time info */}
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 mt-2 bg-slate-50 p-1.5 rounded-lg">
                      <span className="text-sky-600">{spot.distFormatted || spot.distance || "500m"}</span>
                      <span>•</span>
                      <span>{spot.walkTime || "5 min a pé"}</span>
                      <span>•</span>
                      <span>{spot.driveTime || "2 min carro"}</span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Cobrança</span>
                        <span className="text-base font-extrabold text-sky-600">R$ {Number(spot.priceHourly || 6).toFixed(2)}/h</span>
                      </div>

                      <button
                        onClick={() => onSelectSpot(spot)}
                        className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-xs"
                      >
                        Ver vaga
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Exact Entrance Gate Marker if entrance coordinates exist */}
              {spot.entranceLat && spot.entranceLng && !isNaN(Number(spot.entranceLat)) && !isNaN(Number(spot.entranceLng)) && (
                <Marker
                  position={[Number(spot.entranceLat), Number(spot.entranceLng)]}
                  icon={createEntranceGateMarkerIcon()}
                >
                  <Popup>
                    <div className="p-2.5 font-sans text-xs text-slate-800 space-y-1">
                      <span className="font-extrabold text-amber-600 block">🚪 Local Exato do Portão de Entrada</span>
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
};

