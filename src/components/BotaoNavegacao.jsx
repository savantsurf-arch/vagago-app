import React, { useState } from 'react';
import { MapPin, Navigation, Car, ChevronDown, Route } from 'lucide-react';
import { getNavigationLinks } from '../services/geoUtils';

/**
 * Componente "Como Chegar" com escolha entre Waze, Google Maps e Apple Maps,
 * além de gatilho opcional para visualizar a rota azul diretamente no mapa do app.
 */
export default function BotaoNavegacao({
  latitude,
  longitude,
  endereco = '',
  compact = false,
  onPreviewRoute = null,
  isShowingRoute = false,
  routeInfo = null,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(!compact);

  const { googleMapsUrl, wazeUrl, appleMapsUrl } = getNavigationLinks(
    latitude,
    longitude,
    endereco
  );

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  const openUrl = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={compact ? className : `mt-4 ${className}`}>
      {compact && (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="w-full min-h-[48px] px-4 rounded-2xl bg-[#002A66] hover:bg-[#017AFC] text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
        >
          <Navigation className="w-4 h-4 shrink-0" />
          <span>Como Chegar</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {isOpen && (
        <div
          className={
            compact
              ? 'mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 animate-in fade-in duration-150'
              : 'p-4 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-3'
          }
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-extrabold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#017AFC]" />
              <span>Como chegar na vaga</span>
            </h3>

            {typeof onPreviewRoute === 'function' && (
              <button
                type="button"
                onClick={onPreviewRoute}
                className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition cursor-pointer ${
                  isShowingRoute
                    ? 'bg-[#017AFC] text-white border-[#017AFC]'
                    : 'bg-white text-[#002A66] border-sky-200 hover:bg-sky-50'
                }`}
              >
                <Route className="w-3.5 h-3.5" />
                <span>{isShowingRoute ? 'Ocultar rota' : 'Ver rota no mapa'}</span>
              </button>
            )}
          </div>

          {routeInfo && (
            <div className="flex items-center gap-2 text-xs font-bold text-[#002A66] bg-sky-50 border border-sky-200 px-3 py-2 rounded-xl">
              <Car className="w-4 h-4 text-[#017AFC] shrink-0" />
              <span>
                Trajeto estimado: <strong>{routeInfo.durationMin} min de carro</strong> •{' '}
                {routeInfo.distanceKm < 1
                  ? `${Math.round(routeInfo.distanceKm * 1000)} m`
                  : `${routeInfo.distanceKm.toFixed(1)} km`}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => openUrl(wazeUrl)}
              aria-label="Abrir rota no Waze"
              className="min-h-[44px] flex items-center justify-center gap-2 bg-[#33CCFF] hover:bg-[#1abce8] text-slate-950 font-extrabold text-sm py-2.5 px-3 rounded-xl transition active:scale-95 shadow-xs cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Waze</span>
            </button>

            <button
              type="button"
              onClick={() => openUrl(googleMapsUrl)}
              aria-label="Abrir rota no Google Maps"
              className="min-h-[44px] flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-slate-900 font-extrabold text-sm py-2.5 px-3 rounded-xl transition active:scale-95 shadow-xs cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#029518]" />
              <span>Google Maps</span>
            </button>
          </div>

          {(isIOS || !compact) && (
            <button
              type="button"
              onClick={() => openUrl(appleMapsUrl)}
              aria-label="Abrir rota no Apple Maps"
              className="w-full min-h-[40px] flex items-center justify-center gap-2 text-[#002A66] hover:text-[#017AFC] font-bold text-xs py-2 bg-white hover:bg-sky-50 border border-slate-200 rounded-xl transition cursor-pointer"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Abrir no Apple Maps (iPhone)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
